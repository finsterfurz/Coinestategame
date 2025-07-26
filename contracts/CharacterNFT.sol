// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CharacterNFT
 * @dev Virtual Building Empire Character NFT Contract
 * @author Virtual Building Empire Team
 */
contract CharacterNFT is 
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // ===================================
    // ROLES
    // ===================================
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ===================================
    // CHARACTER TYPES & RARITIES
    // ===================================
    enum CharacterType { COMMON, RARE, LEGENDARY }
    enum Department { MANAGEMENT, IT, HR, FINANCE, OPERATIONS, SECURITY, ADMINISTRATION }

    // ===================================
    // CHARACTER STRUCT
    // ===================================
    struct Character {
        string name;
        CharacterType characterType;
        Department department;
        uint256 level;
        uint256 experience;
        uint256 dailyEarnings;
        uint256 happiness;
        bool isWorking;
        uint256 mintedAt;
        address originalMinter;
    }

    // ===================================
    // STATE VARIABLES
    // ===================================
    mapping(uint256 => Character) public characters;
    mapping(CharacterType => uint256) public mintingCosts;
    mapping(CharacterType => uint256) public baseEarnings;
    mapping(address => uint256) public totalCharactersMinted;
    
    IERC20 public luncToken;
    uint256 private _nextTokenId;
    string private _baseTokenURI;
    
    // Minting limits
    uint256 public maxSupply;
    uint256 public maxPerWallet;
    
    // Character progression
    mapping(uint256 => uint256) public experienceToNextLevel;
    
    // Events
    event CharacterMinted(address indexed to, uint256 indexed tokenId, CharacterType characterType, string name);
    event CharacterLevelUp(uint256 indexed tokenId, uint256 newLevel);
    event CharacterWorking(uint256 indexed tokenId, bool isWorking, Department department);
    event ExperienceGained(uint256 indexed tokenId, uint256 experience);

    // ===================================
    // INITIALIZATION
    // ===================================
    function initialize(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address luncTokenAddress
    ) public initializer {
        __ERC721_init(name, symbol);
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(MINTER_ROLE, _msgSender());
        _grantRole(UPGRADER_ROLE, _msgSender());
        _grantRole(PAUSER_ROLE, _msgSender());

        _baseTokenURI = baseTokenURI;
        luncToken = IERC20(luncTokenAddress);
        _nextTokenId = 1;
        
        // Set default values
        maxSupply = 10000;
        maxPerWallet = 50;
        
        // Minting costs (in LUNC with 6 decimals)
        mintingCosts[CharacterType.COMMON] = 100 * 10**6;
        mintingCosts[CharacterType.RARE] = 300 * 10**6;
        mintingCosts[CharacterType.LEGENDARY] = 1000 * 10**6;
        
        // Base daily earnings
        baseEarnings[CharacterType.COMMON] = 25 * 10**6;
        baseEarnings[CharacterType.RARE] = 50 * 10**6;
        baseEarnings[CharacterType.LEGENDARY] = 100 * 10**6;
        
        // Experience requirements for levels
        for (uint256 i = 1; i <= 100; i++) {
            experienceToNextLevel[i] = i * 100;
        }
    }

    // ===================================
    // MINTING FUNCTIONS
    // ===================================
    function mintCharacter(
        address to,
        string memory name,
        CharacterType characterType,
        Department department
    ) public nonReentrant whenNotPaused returns (uint256) {
        require(hasRole(MINTER_ROLE, _msgSender()) || _msgSender() == to, "Not authorized to mint");
        require(_nextTokenId <= maxSupply, "Max supply reached");
        require(balanceOf(to) < maxPerWallet, "Max per wallet reached");
        require(bytes(name).length > 0 && bytes(name).length <= 50, "Invalid name length");
        
        // Handle payment if not minted by authorized role
        if (!hasRole(MINTER_ROLE, _msgSender())) {
            uint256 cost = mintingCosts[characterType];
            require(luncToken.transferFrom(_msgSender(), address(this), cost), "Payment failed");
        }
        
        uint256 tokenId = _nextTokenId++;
        
        // Create character
        characters[tokenId] = Character({
            name: name,
            characterType: characterType,
            department: department,
            level: 1,
            experience: 0,
            dailyEarnings: calculateDailyEarnings(characterType, 1, 100),
            happiness: 80 + (uint256(keccak256(abi.encodePacked(block.timestamp, tokenId))) % 21), // 80-100
            isWorking: false,
            mintedAt: block.timestamp,
            originalMinter: to
        });
        
        totalCharactersMinted[to]++;
        
        _safeMint(to, tokenId);
        
        emit CharacterMinted(to, tokenId, characterType, name);
        
        return tokenId;
    }
    
    function batchMintCharacters(
        address to,
        string[] memory names,
        CharacterType[] memory types,
        Department[] memory departments
    ) external nonReentrant whenNotPaused returns (uint256[] memory) {
        require(names.length == types.length && types.length == departments.length, "Array length mismatch");
        require(names.length <= 10, "Too many characters at once");
        
        uint256[] memory tokenIds = new uint256[](names.length);
        
        for (uint256 i = 0; i < names.length; i++) {
            tokenIds[i] = mintCharacter(to, names[i], types[i], departments[i]);
        }
        
        return tokenIds;
    }

    // ===================================
    // CHARACTER MANAGEMENT
    // ===================================
    function setCharacterWorking(uint256 tokenId, bool working, Department newDepartment) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not authorized");
        
        Character storage character = characters[tokenId];
        character.isWorking = working;
        character.department = newDepartment;
        
        emit CharacterWorking(tokenId, working, newDepartment);
    }
    
    function addExperience(uint256 tokenId, uint256 exp) external onlyRole(MINTER_ROLE) {
        Character storage character = characters[tokenId];
        character.experience += exp;
        
        // Check for level up
        uint256 requiredExp = experienceToNextLevel[character.level];
        if (character.experience >= requiredExp && character.level < 100) {
            character.level++;
            character.experience -= requiredExp;
            character.dailyEarnings = calculateDailyEarnings(
                character.characterType,
                character.level,
                character.happiness
            );
            
            emit CharacterLevelUp(tokenId, character.level);
        }
        
        emit ExperienceGained(tokenId, exp);
    }
    
    function updateHappiness(uint256 tokenId, uint256 happiness) external onlyRole(MINTER_ROLE) {
        require(happiness <= 100, "Happiness cannot exceed 100");
        
        Character storage character = characters[tokenId];
        character.happiness = happiness;
        character.dailyEarnings = calculateDailyEarnings(
            character.characterType,
            character.level,
            character.happiness
        );
    }

    // ===================================
    // VIEW FUNCTIONS
    // ===================================
    function calculateDailyEarnings(
        CharacterType characterType,
        uint256 level,
        uint256 happiness
    ) public view returns (uint256) {
        uint256 base = baseEarnings[characterType];
        uint256 levelMultiplier = 100 + (level * 5); // 5% per level
        uint256 happinessMultiplier = happiness; // Direct percentage
        
        return (base * levelMultiplier * happinessMultiplier) / 10000;
    }
    
    function getCharacter(uint256 tokenId) external view returns (Character memory) {
        require(_exists(tokenId), "Character does not exist");
        return characters[tokenId];
    }
    
    function getCharactersByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory result = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            result[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return result;
    }
    
    function getWorkingCharacters(address owner) external view returns (uint256[] memory) {
        uint256[] memory ownedTokens = this.getCharactersByOwner(owner);
        uint256 workingCount = 0;
        
        // Count working characters
        for (uint256 i = 0; i < ownedTokens.length; i++) {
            if (characters[ownedTokens[i]].isWorking) {
                workingCount++;
            }
        }
        
        // Create result array
        uint256[] memory workingTokens = new uint256[](workingCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < ownedTokens.length; i++) {
            if (characters[ownedTokens[i]].isWorking) {
                workingTokens[index] = ownedTokens[i];
                index++;
            }
        }
        
        return workingTokens;
    }

    // ===================================
    // ADMIN FUNCTIONS
    // ===================================
    function setMintingCost(CharacterType characterType, uint256 cost) external onlyRole(DEFAULT_ADMIN_ROLE) {
        mintingCosts[characterType] = cost;
    }
    
    function setBaseEarnings(CharacterType characterType, uint256 earnings) external onlyRole(DEFAULT_ADMIN_ROLE) {
        baseEarnings[characterType] = earnings;
    }
    
    function setMaxSupply(uint256 newMaxSupply) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMaxSupply >= totalSupply(), "Cannot be less than current supply");
        maxSupply = newMaxSupply;
    }
    
    function setMaxPerWallet(uint256 newMaxPerWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxPerWallet = newMaxPerWallet;
    }
    
    function setBaseURI(string memory newBaseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = newBaseURI;
    }
    
    function withdrawLunc(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(luncToken.transfer(to, amount), "Transfer failed");
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ===================================
    // INTERNAL FUNCTIONS
    // ===================================
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
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
        delete characters[tokenId];
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    // ===================================
    // INTERFACE SUPPORT
    // ===================================
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}