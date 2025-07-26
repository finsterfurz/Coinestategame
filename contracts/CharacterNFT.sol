// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CharacterNFT
 * @dev Enhanced NFT contract for Virtual Building Empire characters
 * Features: Upgradeable, Pausable, Access Control, Enumerable, URI Storage
 */
contract CharacterNFT is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using Counters for Counters.Counter;
    using Strings for uint256;

    // ===================================
    // 🔐 ROLES & CONSTANTS
    // ===================================
    
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_MINT_PER_TX = 10;
    uint256 public constant MAX_MINT_PER_WALLET = 50;

    // ===================================
    // 📊 ENUMS & STRUCTS
    // ===================================
    
    enum CharacterRarity { COMMON, RARE, LEGENDARY }
    
    struct Character {
        string name;
        CharacterRarity rarity;
        uint256 level;
        uint256 experience;
        uint256 dailyEarnings;
        uint256 happiness;
        string department;
        string job;
        bool working;
        uint256 mintedAt;
    }
    
    struct MintPrice {
        uint256 common;
        uint256 rare;
        uint256 legendary;
    }

    // ===================================
    // 🗃️ STATE VARIABLES
    // ===================================
    
    Counters.Counter private _tokenIdCounter;
    
    mapping(uint256 => Character) public characters;
    mapping(address => uint256) public mintedCount;
    mapping(CharacterRarity => uint256) public raritySupply;
    
    MintPrice public mintPrices;
    string private _baseTokenURI;
    bool public mintingEnabled;
    
    // Rarity drop rates (out of 10000)
    uint256 public constant COMMON_RATE = 7000;  // 70%
    uint256 public constant RARE_RATE = 2500;    // 25%
    uint256 public constant LEGENDARY_RATE = 500; // 5%

    // ===================================
    // 📡 EVENTS
    // ===================================
    
    event CharacterMinted(address indexed to, uint256 indexed tokenId, CharacterRarity rarity, string name);
    event CharacterLevelUp(uint256 indexed tokenId, uint256 newLevel);
    event CharacterJobAssigned(uint256 indexed tokenId, string job, string department);
    event CharacterExperienceGained(uint256 indexed tokenId, uint256 experience);
    event MintPricesUpdated(uint256 commonPrice, uint256 rarePrice, uint256 legendaryPrice);
    event MintingToggled(bool enabled);

    // ===================================
    // 🏗️ INITIALIZATION
    // ===================================
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) public initializer {
        __ERC721_init(name, symbol);
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Pausable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        _baseTokenURI = baseURI;
        mintingEnabled = true;
        
        // Set initial mint prices (in wei)
        mintPrices = MintPrice({
            common: 0.05 ether,
            rare: 0.15 ether,
            legendary: 0.5 ether
        });
    }

    // ===================================
    // 🎯 MINTING FUNCTIONS
    // ===================================
    
    function mintCharacter(
        address to,
        string memory characterName,
        CharacterRarity rarity
    ) public payable nonReentrant whenNotPaused {
        require(mintingEnabled, "Minting is disabled");
        require(to != address(0), "Cannot mint to zero address");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        require(mintedCount[to] < MAX_MINT_PER_WALLET, "Max mints per wallet reached");
        require(bytes(characterName).length > 0 && bytes(characterName).length <= 32, "Invalid name length");
        
        uint256 price = getMintPrice(rarity);
        require(msg.value >= price, "Insufficient payment");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Create character with rarity-based stats
        Character memory newCharacter = _generateCharacterStats(characterName, rarity);
        characters[tokenId] = newCharacter;
        
        raritySupply[rarity]++;
        mintedCount[to]++;
        
        _safeMint(to, tokenId);
        
        emit CharacterMinted(to, tokenId, rarity, characterName);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }
    
    function mintRandomCharacter(
        address to,
        string memory characterName
    ) external payable {
        CharacterRarity rarity = _getRandomRarity();
        mintCharacter(to, characterName, rarity);
    }
    
    function batchMintCharacters(
        address to,
        string[] memory names,
        CharacterRarity[] memory rarities
    ) external payable nonReentrant {
        require(names.length == rarities.length, "Arrays length mismatch");
        require(names.length <= MAX_MINT_PER_TX, "Too many mints per transaction");
        
        uint256 totalPrice = 0;
        for (uint256 i = 0; i < rarities.length; i++) {
            totalPrice += getMintPrice(rarities[i]);
        }
        require(msg.value >= totalPrice, "Insufficient payment");
        
        for (uint256 i = 0; i < names.length; i++) {
            mintCharacter(to, names[i], rarities[i]);
        }
    }

    // ===================================
    // 🎮 GAME FUNCTIONS
    // ===================================
    
    function levelUpCharacter(uint256 tokenId) external {
        require(_exists(tokenId), "Character does not exist");
        require(ownerOf(tokenId) == msg.sender || hasRole(MINTER_ROLE, msg.sender), "Not authorized");
        
        Character storage character = characters[tokenId];
        require(character.experience >= getExperienceRequiredForNextLevel(character.level), "Insufficient experience");
        
        character.level++;
        character.experience = 0; // Reset experience for next level
        character.dailyEarnings = _calculateDailyEarnings(character.rarity, character.level);
        
        emit CharacterLevelUp(tokenId, character.level);
    }
    
    function gainExperience(uint256 tokenId, uint256 exp) external {
        require(hasRole(MINTER_ROLE, msg.sender), "Not authorized");
        require(_exists(tokenId), "Character does not exist");
        
        characters[tokenId].experience += exp;
        emit CharacterExperienceGained(tokenId, exp);
    }
    
    function assignJob(uint256 tokenId, string memory job, string memory department) external {
        require(_exists(tokenId), "Character does not exist");
        require(ownerOf(tokenId) == msg.sender || hasRole(MINTER_ROLE, msg.sender), "Not authorized");
        
        Character storage character = characters[tokenId];
        character.job = job;
        character.department = department;
        character.working = true;
        
        emit CharacterJobAssigned(tokenId, job, department);
    }

    // ===================================
    // 🔍 VIEW FUNCTIONS
    // ===================================
    
    function getCharacter(uint256 tokenId) external view returns (Character memory) {
        require(_exists(tokenId), "Character does not exist");
        return characters[tokenId];
    }
    
    function getCharactersByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    function getMintPrice(CharacterRarity rarity) public view returns (uint256) {
        if (rarity == CharacterRarity.COMMON) return mintPrices.common;
        if (rarity == CharacterRarity.RARE) return mintPrices.rare;
        return mintPrices.legendary;
    }
    
    function getExperienceRequiredForNextLevel(uint256 currentLevel) public pure returns (uint256) {
        return (currentLevel * 100) + (currentLevel * currentLevel * 10);
    }
    
    function totalSupply() public view override returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }

    // ===================================
    // 🔧 ADMIN FUNCTIONS
    // ===================================
    
    function setMintPrices(
        uint256 commonPrice,
        uint256 rarePrice,
        uint256 legendaryPrice
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        mintPrices.common = commonPrice;
        mintPrices.rare = rarePrice;
        mintPrices.legendary = legendaryPrice;
        
        emit MintPricesUpdated(commonPrice, rarePrice, legendaryPrice);
    }
    
    function setBaseURI(string memory baseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }
    
    function toggleMinting() external onlyRole(DEFAULT_ADMIN_ROLE) {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(msg.sender).transfer(balance);
    }

    // ===================================
    // 🔨 INTERNAL FUNCTIONS
    // ===================================
    
    function _generateCharacterStats(
        string memory name,
        CharacterRarity rarity
    ) internal view returns (Character memory) {
        uint256 level = _getInitialLevel(rarity);
        uint256 dailyEarnings = _calculateDailyEarnings(rarity, level);
        
        return Character({
            name: name,
            rarity: rarity,
            level: level,
            experience: 0,
            dailyEarnings: dailyEarnings,
            happiness: 85 + (uint256(keccak256(abi.encodePacked(block.timestamp, name))) % 16), // 85-100
            department: "Unassigned",
            job: "Unemployed",
            working: false,
            mintedAt: block.timestamp
        });
    }
    
    function _getRandomRarity() internal view returns (CharacterRarity) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            _tokenIdCounter.current()
        ))) % 10000;
        
        if (random < LEGENDARY_RATE) return CharacterRarity.LEGENDARY;
        if (random < LEGENDARY_RATE + RARE_RATE) return CharacterRarity.RARE;
        return CharacterRarity.COMMON;
    }
    
    function _getInitialLevel(CharacterRarity rarity) internal pure returns (uint256) {
        if (rarity == CharacterRarity.LEGENDARY) return 15 + (block.timestamp % 16); // 15-30
        if (rarity == CharacterRarity.RARE) return 8 + (block.timestamp % 11); // 8-18
        return 1 + (block.timestamp % 10); // 1-10
    }
    
    function _calculateDailyEarnings(CharacterRarity rarity, uint256 level) internal pure returns (uint256) {
        uint256 baseEarnings;
        
        if (rarity == CharacterRarity.LEGENDARY) {
            baseEarnings = 120 + (level * 8);
        } else if (rarity == CharacterRarity.RARE) {
            baseEarnings = 50 + (level * 5);
        } else {
            baseEarnings = 15 + (level * 3);
        }
        
        return baseEarnings;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
    
    // ===================================
    // 🔗 OVERRIDES
    // ===================================
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}