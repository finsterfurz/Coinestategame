const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CharacterNFT", function () {
  // ===================================
  // FIXTURES
  // ===================================
  async function deployCharacterNFTFixture() {
    const [owner, minter, user1, user2] = await ethers.getSigners();

    // Deploy LUNC Token
    const LuncToken = await ethers.getContractFactory("LuncToken");
    const luncToken = await LuncToken.deploy(
      "Virtual Building LUNC",
      "VLUNC",
      ethers.utils.parseUnits("1000000", 6) // 1M tokens
    );
    await luncToken.deployed();

    // Deploy Character NFT
    const CharacterNFT = await ethers.getContractFactory("CharacterNFT");
    const characterNFT = await upgrades.deployProxy(
      CharacterNFT,
      [
        "Virtual Building Empire Characters",
        "VBEC",
        "https://api.virtualbuilding.game/metadata/",
        luncToken.address
      ],
      { initializer: 'initialize' }
    );
    await characterNFT.deployed();

    // Setup roles
    const MINTER_ROLE = await characterNFT.MINTER_ROLE();
    await characterNFT.grantRole(MINTER_ROLE, minter.address);

    // Give users some LUNC for minting
    await luncToken.transfer(user1.address, ethers.utils.parseUnits("10000", 6));
    await luncToken.transfer(user2.address, ethers.utils.parseUnits("10000", 6));

    // Approve character contract to spend LUNC
    await luncToken.connect(user1).approve(characterNFT.address, ethers.constants.MaxUint256);
    await luncToken.connect(user2).approve(characterNFT.address, ethers.constants.MaxUint256);

    return { characterNFT, luncToken, owner, minter, user1, user2 };
  }

  // ===================================
  // DEPLOYMENT TESTS
  // ===================================
  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      const { characterNFT, luncToken, owner } = await loadFixture(deployCharacterNFTFixture);

      expect(await characterNFT.name()).to.equal("Virtual Building Empire Characters");
      expect(await characterNFT.symbol()).to.equal("VBEC");
      expect(await characterNFT.luncToken()).to.equal(luncToken.address);
      expect(await characterNFT.maxSupply()).to.equal(10000);
      expect(await characterNFT.maxPerWallet()).to.equal(50);

      // Check roles
      const DEFAULT_ADMIN_ROLE = await characterNFT.DEFAULT_ADMIN_ROLE();
      expect(await characterNFT.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should set correct minting costs", async function () {
      const { characterNFT } = await loadFixture(deployCharacterNFTFixture);

      expect(await characterNFT.mintingCosts(0)).to.equal(ethers.utils.parseUnits("100", 6)); // COMMON
      expect(await characterNFT.mintingCosts(1)).to.equal(ethers.utils.parseUnits("300", 6)); // RARE
      expect(await characterNFT.mintingCosts(2)).to.equal(ethers.utils.parseUnits("1000", 6)); // LEGENDARY
    });
  });

  // ===================================
  // MINTING TESTS
  // ===================================
  describe("Minting", function () {
    it("Should mint character with payment", async function () {
      const { characterNFT, luncToken, user1 } = await loadFixture(deployCharacterNFTFixture);

      const initialBalance = await luncToken.balanceOf(user1.address);
      const cost = await characterNFT.mintingCosts(0); // COMMON

      await expect(
        characterNFT.connect(user1).mintCharacter(
          user1.address,
          "Test Character",
          0, // COMMON
          0  // MANAGEMENT
        )
      ).to.emit(characterNFT, "CharacterMinted")
        .withArgs(user1.address, 1, 0, "Test Character");

      // Check token was minted
      expect(await characterNFT.ownerOf(1)).to.equal(user1.address);
      expect(await characterNFT.balanceOf(user1.address)).to.equal(1);

      // Check payment was made
      expect(await luncToken.balanceOf(user1.address)).to.equal(initialBalance.sub(cost));

      // Check character data
      const character = await characterNFT.getCharacter(1);
      expect(character.name).to.equal("Test Character");
      expect(character.characterType).to.equal(0);
      expect(character.department).to.equal(0);
      expect(character.level).to.equal(1);
      expect(character.isWorking).to.be.false;
    });

    it("Should allow minter role to mint without payment", async function () {
      const { characterNFT, luncToken, minter, user1 } = await loadFixture(deployCharacterNFTFixture);

      const initialBalance = await luncToken.balanceOf(user1.address);

      await characterNFT.connect(minter).mintCharacter(
        user1.address,
        "Free Character",
        1, // RARE
        1  // IT
      );

      // Check token was minted
      expect(await characterNFT.ownerOf(1)).to.equal(user1.address);

      // Check no payment was made
      expect(await luncToken.balanceOf(user1.address)).to.equal(initialBalance);
    });

    it("Should reject minting with insufficient balance", async function () {
      const { characterNFT, luncToken, user1 } = await loadFixture(deployCharacterNFTFixture);

      // Drain user's balance
      const balance = await luncToken.balanceOf(user1.address);
      await luncToken.connect(user1).transfer(ethers.constants.AddressZero, balance);

      await expect(
        characterNFT.connect(user1).mintCharacter(
          user1.address,
          "Test Character",
          0, // COMMON
          0  // MANAGEMENT
        )
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should batch mint characters", async function () {
      const { characterNFT, user1 } = await loadFixture(deployCharacterNFTFixture);

      const names = ["Character 1", "Character 2", "Character 3"];
      const types = [0, 1, 0]; // COMMON, RARE, COMMON
      const departments = [0, 1, 2]; // MANAGEMENT, IT, HR

      const tokenIds = await characterNFT.connect(user1).batchMintCharacters(
        user1.address,
        names,
        types,
        departments
      );

      expect(await characterNFT.balanceOf(user1.address)).to.equal(3);
      
      // Check first character
      const character1 = await characterNFT.getCharacter(1);
      expect(character1.name).to.equal("Character 1");
      expect(character1.characterType).to.equal(0);
    });
  });

  // ===================================
  // CHARACTER MANAGEMENT TESTS
  // ===================================
  describe("Character Management", function () {
    it("Should set character working status", async function () {
      const { characterNFT, user1 } = await loadFixture(deployCharacterNFTFixture);

      await characterNFT.connect(user1).mintCharacter(
        user1.address,
        "Worker",
        0, // COMMON
        0  // MANAGEMENT
      );

      await expect(
        characterNFT.connect(user1).setCharacterWorking(1, true, 1)
      ).to.emit(characterNFT, "CharacterWorking")
        .withArgs(1, true, 1);

      const character = await characterNFT.getCharacter(1);
      expect(character.isWorking).to.be.true;
      expect(character.department).to.equal(1);
    });

    it("Should add experience and level up", async function () {
      const { characterNFT, minter, user1 } = await loadFixture(deployCharacterNFTFixture);

      await characterNFT.connect(minter).mintCharacter(
        user1.address,
        "Leveling Character",
        0, // COMMON
        0  // MANAGEMENT
      );

      await expect(
        characterNFT.connect(minter).addExperience(1, 100)
      ).to.emit(characterNFT, "CharacterLevelUp")
        .withArgs(1, 2);

      const character = await characterNFT.getCharacter(1);
      expect(character.level).to.equal(2);
      expect(character.experience).to.equal(0); // Reset after level up
    });

    it("Should update happiness and recalculate earnings", async function () {
      const { characterNFT, minter, user1 } = await loadFixture(deployCharacterNFTFixture);

      await characterNFT.connect(minter).mintCharacter(
        user1.address,
        "Happy Character",
        0, // COMMON
        0  // MANAGEMENT
      );

      const characterBefore = await characterNFT.getCharacter(1);
      const earningsBefore = characterBefore.dailyEarnings;

      await characterNFT.connect(minter).updateHappiness(1, 100);

      const characterAfter = await characterNFT.getCharacter(1);
      expect(characterAfter.happiness).to.equal(100);
      expect(characterAfter.dailyEarnings).to.be.gt(earningsBefore);
    });
  });

  // ===================================
  // VIEW FUNCTION TESTS
  // ===================================
  describe("View Functions", function () {
    it("Should get characters by owner", async function () {
      const { characterNFT, user1 } = await loadFixture(deployCharacterNFTFixture);

      // Mint multiple characters
      await characterNFT.connect(user1).mintCharacter(user1.address, "Char 1", 0, 0);
      await characterNFT.connect(user1).mintCharacter(user1.address, "Char 2", 1, 1);
      await characterNFT.connect(user1).mintCharacter(user1.address, "Char 3", 0, 2);

      const characters = await characterNFT.getCharactersByOwner(user1.address);
      expect(characters.length).to.equal(3);
      expect(characters[0]).to.equal(1);
      expect(characters[1]).to.equal(2);
      expect(characters[2]).to.equal(3);
    });

    it("Should get working characters", async function () {
      const { characterNFT, user1 } = await loadFixture(deployCharacterNFTFixture);

      // Mint characters
      await characterNFT.connect(user1).mintCharacter(user1.address, "Worker 1", 0, 0);
      await characterNFT.connect(user1).mintCharacter(user1.address, "Worker 2", 1, 1);
      await characterNFT.connect(user1).mintCharacter(user1.address, "Idle", 0, 2);

      // Set some to work
      await characterNFT.connect(user1).setCharacterWorking(1, true, 0);
      await characterNFT.connect(user1).setCharacterWorking(2, true, 1);

      const workingCharacters = await characterNFT.getWorkingCharacters(user1.address);
      expect(workingCharacters.length).to.equal(2);
      expect(workingCharacters).to.include(ethers.BigNumber.from(1));
      expect(workingCharacters).to.include(ethers.BigNumber.from(2));
    });

    it("Should calculate daily earnings correctly", async function () {
      const { characterNFT } = await loadFixture(deployCharacterNFTFixture);

      const commonEarnings = await characterNFT.calculateDailyEarnings(0, 1, 100); // COMMON, level 1, 100% happiness
      const rareEarnings = await characterNFT.calculateDailyEarnings(1, 1, 100); // RARE, level 1, 100% happiness
      const legendaryEarnings = await characterNFT.calculateDailyEarnings(2, 1, 100); // LEGENDARY, level 1, 100% happiness

      expect(rareEarnings).to.be.gt(commonEarnings);
      expect(legendaryEarnings).to.be.gt(rareEarnings);

      // Test level scaling
      const level10Earnings = await characterNFT.calculateDailyEarnings(0, 10, 100);
      expect(level10Earnings).to.be.gt(commonEarnings);

      // Test happiness scaling
      const lowHappinessEarnings = await characterNFT.calculateDailyEarnings(0, 1, 50);
      expect(lowHappinessEarnings).to.be.lt(commonEarnings);
    });
  });

  // ===================================
  // ADMIN FUNCTION TESTS
  // ===================================
  describe("Admin Functions", function () {
    it("Should allow admin to update minting costs", async function () {
      const { characterNFT, owner } = await loadFixture(deployCharacterNFTFixture);

      const newCost = ethers.utils.parseUnits("200", 6);
      await characterNFT.connect(owner).setMintingCost(0, newCost);

      expect(await characterNFT.mintingCosts(0)).to.equal(newCost);
    });

    it("Should allow admin to update max supply", async function () {
      const { characterNFT, owner } = await loadFixture(deployCharacterNFTFixture);

      await characterNFT.connect(owner).setMaxSupply(20000);
      expect(await characterNFT.maxSupply()).to.equal(20000);
    });

    it("Should allow admin to pause/unpause", async function () {
      const { characterNFT, owner, user1 } = await loadFixture(deployCharacterNFTFixture);

      await characterNFT.connect(owner).pause();

      await expect(
        characterNFT.connect(user1).mintCharacter(
          user1.address,
          "Test",
          0,
          0
        )
      ).to.be.revertedWith("Pausable: paused");

      await characterNFT.connect(owner).unpause();

      // Should work after unpause
      await characterNFT.connect(user1).mintCharacter(
        user1.address,
        "Test",
        0,
        0
      );
      expect(await characterNFT.balanceOf(user1.address)).to.equal(1);
    });

    it("Should reject non-admin access to admin functions", async function () {
      const { characterNFT, user1 } = await loadFixture(deployCharacterNFTFixture);

      await expect(
        characterNFT.connect(user1).setMintingCost(0, 100)
      ).to.be.revertedWith("AccessControl:");

      await expect(
        characterNFT.connect(user1).pause()
      ).to.be.revertedWith("AccessControl:");
    });
  });

  // ===================================
  // ERROR CONDITION TESTS
  // ===================================
  describe("Error Conditions", function () {
    it("Should reject invalid character names", async function () {
      const { characterNFT, user1 } = await loadFixture(deployCharacterNFTFixture);

      await expect(
        characterNFT.connect(user1).mintCharacter(
          user1.address,
          "", // Empty name
          0,
          0
        )
      ).to.be.revertedWith("Invalid name length");

      const longName = "A".repeat(51);
      await expect(
        characterNFT.connect(user1).mintCharacter(
          user1.address,
          longName, // Too long
          0,
          0
        )
      ).to.be.revertedWith("Invalid name length");
    });

    it("Should respect max per wallet limit", async function () {
      const { characterNFT, minter, user1 } = await loadFixture(deployCharacterNFTFixture);

      // Set low limit for testing
      await characterNFT.setMaxPerWallet(2);

      // Mint 2 characters (should succeed)
      await characterNFT.connect(minter).mintCharacter(user1.address, "Char 1", 0, 0);
      await characterNFT.connect(minter).mintCharacter(user1.address, "Char 2", 0, 0);

      // Try to mint 3rd (should fail)
      await expect(
        characterNFT.connect(minter).mintCharacter(user1.address, "Char 3", 0, 0)
      ).to.be.revertedWith("Max per wallet reached");
    });

    it("Should handle non-existent token queries", async function () {
      const { characterNFT } = await loadFixture(deployCharacterNFTFixture);

      await expect(
        characterNFT.getCharacter(999)
      ).to.be.revertedWith("Character does not exist");
    });
  });
});