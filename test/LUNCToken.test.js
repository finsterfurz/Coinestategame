const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("LUNCToken", function () {
  // Fixture for deploying LUNC Token
  async function deployLUNCTokenFixture() {
    const [owner, minter, user1, user2, gameContract] = await ethers.getSigners();

    // Deploy LUNC Token
    const LUNCToken = await ethers.getContractFactory("LUNCToken");
    const luncToken = await LUNCToken.deploy();
    await luncToken.deployed();

    // Grant minter role to minter address
    const MINTER_ROLE = await luncToken.MINTER_ROLE();
    await luncToken.grantRole(MINTER_ROLE, minter.address);

    return {
      luncToken,
      owner,
      minter,
      user1,
      user2,
      gameContract,
      MINTER_ROLE
    };
  }

  describe("Deployment", function () {
    it("Should set correct token details", async function () {
      const { luncToken } = await loadFixture(deployLUNCTokenFixture);
      
      expect(await luncToken.name()).to.equal("LunaClassic Gaming");
      expect(await luncToken.symbol()).to.equal("LUNC");
      expect(await luncToken.decimals()).to.equal(18);
    });

    it("Should set correct initial supply", async function () {
      const { luncToken, owner } = await loadFixture(deployLUNCTokenFixture);
      
      const expectedInitialSupply = ethers.utils.parseEther("100000000"); // 100 million
      
      expect(await luncToken.totalSupply()).to.equal(expectedInitialSupply);
      expect(await luncToken.balanceOf(owner.address)).to.equal(expectedInitialSupply);
    });

    it("Should set correct max supply", async function () {
      const { luncToken } = await loadFixture(deployLUNCTokenFixture);
      
      const expectedMaxSupply = ethers.utils.parseEther("1000000000"); // 1 billion
      expect(await luncToken.MAX_SUPPLY()).to.equal(expectedMaxSupply);
    });

    it("Should set correct daily emission rate", async function () {
      const { luncToken } = await loadFixture(deployLUNCTokenFixture);
      
      const expectedDailyEmission = ethers.utils.parseEther("25000"); // 25,000 LUNC
      expect(await luncToken.dailyEmissionRate()).to.equal(expectedDailyEmission);
    });

    it("Should grant correct roles to deployer", async function () {
      const { luncToken, owner } = await loadFixture(deployLUNCTokenFixture);
      
      const DEFAULT_ADMIN_ROLE = await luncToken.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await luncToken.MINTER_ROLE();
      const PAUSER_ROLE = await luncToken.PAUSER_ROLE();
      
      expect(await luncToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await luncToken.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await luncToken.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should allow minters to mint tokens", async function () {
      const { luncToken, minter, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      const mintAmount = ethers.utils.parseEther("1000");
      
      await expect(
        luncToken.connect(minter).mint(user1.address, mintAmount)
      )
        .to.emit(luncToken, "Transfer")
        .withArgs(ethers.constants.AddressZero, user1.address, mintAmount);
      
      expect(await luncToken.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should reject minting by non-minters", async function () {
      const { luncToken, user1, user2 } = await loadFixture(deployLUNCTokenFixture);
      
      const mintAmount = ethers.utils.parseEther("1000");
      
      await expect(
        luncToken.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWith(/AccessControl: account .* is missing role/);
    });

    it("Should reject minting beyond max supply", async function () {
      const { luncToken, minter, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      const maxSupply = await luncToken.MAX_SUPPLY();
      const currentSupply = await luncToken.totalSupply();
      const availableToMint = maxSupply.sub(currentSupply);
      
      // Try to mint more than available
      const excessiveAmount = availableToMint.add(ethers.utils.parseEther("1"));
      
      await expect(
        luncToken.connect(minter).mint(user1.address, excessiveAmount)
      ).to.be.revertedWith("Would exceed max supply");
    });

    it("Should allow minting up to max supply", async function () {
      const { luncToken, minter, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      const maxSupply = await luncToken.MAX_SUPPLY();
      const currentSupply = await luncToken.totalSupply();
      const availableToMint = maxSupply.sub(currentSupply);
      
      await luncToken.connect(minter).mint(user1.address, availableToMint);
      
      expect(await luncToken.totalSupply()).to.equal(maxSupply);
    });
  });

  describe("Daily Emission", function () {
    it("Should perform daily emission correctly", async function () {
      const { luncToken, minter, gameContract } = await loadFixture(deployLUNCTokenFixture);
      
      const dailyEmissionRate = await luncToken.dailyEmissionRate();
      const initialSupply = await luncToken.totalSupply();
      
      // Fast forward 1 day
      await time.increase(24 * 60 * 60); // 1 day in seconds
      
      await expect(
        luncToken.connect(minter).performDailyEmission(gameContract.address)
      )
        .to.emit(luncToken, "DailyEmission")
        .withArgs(dailyEmissionRate, await time.latest() + 1);
      
      expect(await luncToken.balanceOf(gameContract.address)).to.equal(dailyEmissionRate);
      expect(await luncToken.totalSupply()).to.equal(initialSupply.add(dailyEmissionRate));
    });

    it("Should reject daily emission if too early", async function () {
      const { luncToken, minter, gameContract } = await loadFixture(deployLUNCTokenFixture);
      
      // Try to emit immediately (less than 24 hours)
      await expect(
        luncToken.connect(minter).performDailyEmission(gameContract.address)
      ).to.be.revertedWith("Too early for emission");
    });

    it("Should reject daily emission by non-minters", async function () {
      const { luncToken, user1, gameContract } = await loadFixture(deployLUNCTokenFixture);
      
      await time.increase(24 * 60 * 60); // 1 day
      
      await expect(
        luncToken.connect(user1).performDailyEmission(gameContract.address)
      ).to.be.revertedWith(/AccessControl: account .* is missing role/);
    });

    it("Should track last emission time correctly", async function () {
      const { luncToken, minter, gameContract } = await loadFixture(deployLUNCTokenFixture);
      
      const initialTime = await luncToken.lastEmissionTime();
      
      await time.increase(24 * 60 * 60); // 1 day
      
      await luncToken.connect(minter).performDailyEmission(gameContract.address);
      
      const newTime = await luncToken.lastEmissionTime();
      expect(newTime).to.be.gt(initialTime);
    });

    it("Should allow multiple daily emissions over time", async function () {
      const { luncToken, minter, gameContract } = await loadFixture(deployLUNCTokenFixture);
      
      const dailyEmissionRate = await luncToken.dailyEmissionRate();
      
      // First emission
      await time.increase(24 * 60 * 60);
      await luncToken.connect(minter).performDailyEmission(gameContract.address);
      
      // Second emission
      await time.increase(24 * 60 * 60);
      await luncToken.connect(minter).performDailyEmission(gameContract.address);
      
      expect(await luncToken.balanceOf(gameContract.address)).to.equal(dailyEmissionRate.mul(2));
    });
  });

  describe("Emission Rate Management", function () {
    it("Should allow admin to set daily emission rate", async function () {
      const { luncToken, owner } = await loadFixture(deployLUNCTokenFixture);
      
      const newRate = ethers.utils.parseEther("30000"); // 30,000 LUNC
      const oldRate = await luncToken.dailyEmissionRate();
      
      await expect(
        luncToken.connect(owner).setDailyEmissionRate(newRate)
      )
        .to.emit(luncToken, "EmissionRateChanged")
        .withArgs(oldRate, newRate);
      
      expect(await luncToken.dailyEmissionRate()).to.equal(newRate);
    });

    it("Should reject emission rate change by non-admin", async function () {
      const { luncToken, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      const newRate = ethers.utils.parseEther("30000");
      
      await expect(
        luncToken.connect(user1).setDailyEmissionRate(newRate)
      ).to.be.revertedWith(/AccessControl: account .* is missing role/);
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow pauser to pause and unpause", async function () {
      const { luncToken, owner } = await loadFixture(deployLUNCTokenFixture);
      
      await luncToken.connect(owner).pause();
      expect(await luncToken.paused()).to.be.true;
      
      await luncToken.connect(owner).unpause();
      expect(await luncToken.paused()).to.be.false;
    });

    it("Should reject transfers when paused", async function () {
      const { luncToken, owner, user1, user2 } = await loadFixture(deployLUNCTokenFixture);
      
      // Transfer some tokens to user1 first
      await luncToken.transfer(user1.address, ethers.utils.parseEther("1000"));
      
      // Pause the contract
      await luncToken.connect(owner).pause();
      
      // Try to transfer - should fail
      await expect(
        luncToken.connect(user1).transfer(user2.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should reject minting when paused", async function () {
      const { luncToken, owner, minter, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      await luncToken.connect(owner).pause();
      
      await expect(
        luncToken.connect(minter).mint(user1.address, ethers.utils.parseEther("1000"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should reject pause by non-pauser", async function () {
      const { luncToken, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      await expect(
        luncToken.connect(user1).pause()
      ).to.be.revertedWith(/AccessControl: account .* is missing role/);
    });
  });

  describe("Burning", function () {
    it("Should allow token holders to burn their tokens", async function () {
      const { luncToken, owner, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      const transferAmount = ethers.utils.parseEther("1000");
      const burnAmount = ethers.utils.parseEther("500");
      
      // Transfer tokens to user1
      await luncToken.transfer(user1.address, transferAmount);
      
      const initialSupply = await luncToken.totalSupply();
      const initialBalance = await luncToken.balanceOf(user1.address);
      
      // Burn tokens
      await expect(
        luncToken.connect(user1).burn(burnAmount)
      )
        .to.emit(luncToken, "Transfer")
        .withArgs(user1.address, ethers.constants.AddressZero, burnAmount);
      
      expect(await luncToken.totalSupply()).to.equal(initialSupply.sub(burnAmount));
      expect(await luncToken.balanceOf(user1.address)).to.equal(initialBalance.sub(burnAmount));
    });

    it("Should allow approved spenders to burn tokens", async function () {
      const { luncToken, owner, user1, user2 } = await loadFixture(deployLUNCTokenFixture);
      
      const transferAmount = ethers.utils.parseEther("1000");
      const burnAmount = ethers.utils.parseEther("500");
      
      // Transfer tokens to user1 and approve user2
      await luncToken.transfer(user1.address, transferAmount);
      await luncToken.connect(user1).approve(user2.address, burnAmount);
      
      const initialSupply = await luncToken.totalSupply();
      
      // user2 burns user1's tokens
      await luncToken.connect(user2).burnFrom(user1.address, burnAmount);
      
      expect(await luncToken.totalSupply()).to.equal(initialSupply.sub(burnAmount));
      expect(await luncToken.balanceOf(user1.address)).to.equal(transferAmount.sub(burnAmount));
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to grant and revoke roles", async function () {
      const { luncToken, owner, user1, MINTER_ROLE } = await loadFixture(deployLUNCTokenFixture);
      
      // Grant minter role
      await luncToken.connect(owner).grantRole(MINTER_ROLE, user1.address);
      expect(await luncToken.hasRole(MINTER_ROLE, user1.address)).to.be.true;
      
      // Revoke minter role
      await luncToken.connect(owner).revokeRole(MINTER_ROLE, user1.address);
      expect(await luncToken.hasRole(MINTER_ROLE, user1.address)).to.be.false;
    });

    it("Should reject role management by non-admin", async function () {
      const { luncToken, user1, user2, MINTER_ROLE } = await loadFixture(deployLUNCTokenFixture);
      
      await expect(
        luncToken.connect(user1).grantRole(MINTER_ROLE, user2.address)
      ).to.be.revertedWith(/AccessControl: account .* is missing role/);
    });

    it("Should allow role renunciation", async function () {
      const { luncToken, minter, MINTER_ROLE } = await loadFixture(deployLUNCTokenFixture);
      
      expect(await luncToken.hasRole(MINTER_ROLE, minter.address)).to.be.true;
      
      await luncToken.connect(minter).renounceRole(MINTER_ROLE, minter.address);
      
      expect(await luncToken.hasRole(MINTER_ROLE, minter.address)).to.be.false;
    });
  });

  describe("Standard ERC20 Functionality", function () {
    it("Should transfer tokens correctly", async function () {
      const { luncToken, owner, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      const transferAmount = ethers.utils.parseEther("1000");
      
      await expect(
        luncToken.transfer(user1.address, transferAmount)
      )
        .to.emit(luncToken, "Transfer")
        .withArgs(owner.address, user1.address, transferAmount);
      
      expect(await luncToken.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should handle approvals correctly", async function () {
      const { luncToken, owner, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      const approvalAmount = ethers.utils.parseEther("1000");
      
      await expect(
        luncToken.approve(user1.address, approvalAmount)
      )
        .to.emit(luncToken, "Approval")
        .withArgs(owner.address, user1.address, approvalAmount);
      
      expect(await luncToken.allowance(owner.address, user1.address)).to.equal(approvalAmount);
    });

    it("Should handle transferFrom correctly", async function () {
      const { luncToken, owner, user1, user2 } = await loadFixture(deployLUNCTokenFixture);
      
      const approvalAmount = ethers.utils.parseEther("1000");
      const transferAmount = ethers.utils.parseEther("500");
      
      // Approve user1 to spend owner's tokens
      await luncToken.approve(user1.address, approvalAmount);
      
      // user1 transfers owner's tokens to user2
      await expect(
        luncToken.connect(user1).transferFrom(owner.address, user2.address, transferAmount)
      )
        .to.emit(luncToken, "Transfer")
        .withArgs(owner.address, user2.address, transferAmount);
      
      expect(await luncToken.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await luncToken.allowance(owner.address, user1.address))
        .to.equal(approvalAmount.sub(transferAmount));
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero transfers", async function () {
      const { luncToken, owner, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      await expect(
        luncToken.transfer(user1.address, 0)
      )
        .to.emit(luncToken, "Transfer")
        .withArgs(owner.address, user1.address, 0);
    });

    it("Should reject transfers to zero address", async function () {
      const { luncToken, owner } = await loadFixture(deployLUNCTokenFixture);
      
      await expect(
        luncToken.transfer(ethers.constants.AddressZero, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });

    it("Should reject minting to zero address", async function () {
      const { luncToken, minter } = await loadFixture(deployLUNCTokenFixture);
      
      await expect(
        luncToken.connect(minter).mint(ethers.constants.AddressZero, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("ERC20: mint to the zero address");
    });

    it("Should handle emission when close to max supply", async function () {
      const { luncToken, minter, gameContract } = await loadFixture(deployLUNCTokenFixture);
      
      const maxSupply = await luncToken.MAX_SUPPLY();
      const currentSupply = await luncToken.totalSupply();
      const dailyEmissionRate = await luncToken.dailyEmissionRate();
      
      // Mint tokens to get close to max supply
      const remainingSupply = maxSupply.sub(currentSupply);
      const amountToMint = remainingSupply.sub(dailyEmissionRate.div(2)); // Leave room for half emission
      
      await luncToken.connect(minter).mint(gameContract.address, amountToMint);
      
      // Try daily emission - should fail as it would exceed max supply
      await time.increase(24 * 60 * 60);
      
      await expect(
        luncToken.connect(minter).performDailyEmission(gameContract.address)
      ).to.be.revertedWith("Would exceed max supply");
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for transfers", async function () {
      const { luncToken, owner, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      const tx = await luncToken.transfer(user1.address, ethers.utils.parseEther("1000"));
      const receipt = await tx.wait();
      
      // Standard ERC20 transfer should use reasonable gas
      expect(receipt.gasUsed).to.be.below(100000);
    });

    it("Should use reasonable gas for minting", async function () {
      const { luncToken, minter, user1 } = await loadFixture(deployLUNCTokenFixture);
      
      const tx = await luncToken.connect(minter).mint(user1.address, ethers.utils.parseEther("1000"));
      const receipt = await tx.wait();
      
      // Minting should use reasonable gas
      expect(receipt.gasUsed).to.be.below(150000);
    });
  });

  describe("Events", function () {
    it("Should emit correct events during daily emission", async function () {
      const { luncToken, minter, gameContract } = await loadFixture(deployLUNCTokenFixture);
      
      const dailyEmissionRate = await luncToken.dailyEmissionRate();
      
      await time.increase(24 * 60 * 60);
      
      await expect(
        luncToken.connect(minter).performDailyEmission(gameContract.address)
      )
        .to.emit(luncToken, "Transfer")
        .withArgs(ethers.constants.AddressZero, gameContract.address, dailyEmissionRate)
        .and.to.emit(luncToken, "DailyEmission")
        .withArgs(dailyEmissionRate, await time.latest() + 1);
    });

    it("Should emit correct events during role changes", async function () {
      const { luncToken, owner, user1, MINTER_ROLE } = await loadFixture(deployLUNCTokenFixture);
      
      await expect(
        luncToken.connect(owner).grantRole(MINTER_ROLE, user1.address)
      )
        .to.emit(luncToken, "RoleGranted")
        .withArgs(MINTER_ROLE, user1.address, owner.address);
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complex scenario with multiple operations", async function () {
      const { luncToken, owner, minter, user1, user2, gameContract } = await loadFixture(deployLUNCTokenFixture);
      
      // 1. Transfer initial tokens to users
      await luncToken.transfer(user1.address, ethers.utils.parseEther("5000"));
      await luncToken.transfer(user2.address, ethers.utils.parseEther("3000"));
      
      // 2. Mint additional tokens
      await luncToken.connect(minter).mint(gameContract.address, ethers.utils.parseEther("10000"));
      
      // 3. Perform daily emission
      await time.increase(24 * 60 * 60);
      await luncToken.connect(minter).performDailyEmission(gameContract.address);
      
      // 4. User operations
      await luncToken.connect(user1).transfer(user2.address, ethers.utils.parseEther("1000"));
      await luncToken.connect(user2).burn(ethers.utils.parseEther("500"));
      
      // 5. Verify final state
      expect(await luncToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("4000"));
      expect(await luncToken.balanceOf(user2.address)).to.equal(ethers.utils.parseEther("3500")); // 3000 + 1000 - 500
      
      const dailyEmissionRate = await luncToken.dailyEmissionRate();
      expect(await luncToken.balanceOf(gameContract.address))
        .to.equal(ethers.utils.parseEther("10000").add(dailyEmissionRate));
    });
  });
});