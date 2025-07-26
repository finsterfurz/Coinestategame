// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./CharacterNFT.sol";
import "./LuncToken.sol";

/**
 * @title BuildingManager
 * @dev Advanced building management with staking, quests, and governance
 */
contract BuildingManager is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant QUEST_MANAGER_ROLE = keccak256("QUEST_MANAGER_ROLE");

    CharacterNFT public immutable characterNFT;
    LuncToken public immutable luncToken;

    // Building and Department structures
    struct Department {
        string name;
        uint8 floor;
        uint8 maxCharacters;
        uint256 baseEarnings;
        uint256 efficiencyBonus; // Basis points (10000 = 100%)
        bool isActive;
        mapping(uint256 => bool) assignedCharacters;
        uint256[] characterList;
    }

    struct BuildingUpgrade {
        string name;
        string description;
        uint256 cost;
        uint256 effectValue;
        UpgradeType effectType;
        bool isActive;
        bool isPurchased;
        uint256 requiredLevel;
    }

    struct CharacterStake {
        uint256 characterId;
        uint256 departmentId;
        uint256 stakedAt;
        uint256 lastClaim;
        uint256 accumulatedEarnings;
        bool isActive;
    }

    struct Quest {
        string title;
        string description;
        QuestType questType;
        uint256 targetValue;
        uint256 rewardAmount;
        uint256 deadline;
        bool isActive;
        mapping(address => QuestProgress) userProgress;
    }

    struct QuestProgress {
        uint256 currentValue;
        bool isCompleted;
        bool isClaimed;
    }

    enum UpgradeType {
        EFFICIENCY,
        CAPACITY,
        EARNINGS,
        HAPPINESS
    }

    enum QuestType {
        STAKE_CHARACTERS,
        COLLECT_EARNINGS,
        UPGRADE_BUILDING,
        SOCIAL_INTERACTION
    }

    // State variables
    mapping(uint256 => Department) public departments;
    mapping(uint256 => BuildingUpgrade) public upgrades;
    mapping(uint256 => CharacterStake) public characterStakes;
    mapping(uint256 => Quest) public quests;
    mapping(address => uint256) public userBuildingLevel;
    mapping(address => uint256) public userTotalEarnings;
    mapping(address => uint256) public userLastActivity;

    uint256 public nextDepartmentId = 1;
    uint256 public nextUpgradeId = 1;
    uint256 public nextQuestId = 1;
    uint256 public buildingEfficiency = 10000; // 100% in basis points
    uint256 public globalHappiness = 7500; // 75% base happiness

    // Events
    event CharacterStaked(address indexed user, uint256 indexed characterId, uint256 indexed departmentId);
    event CharacterUnstaked(address indexed user, uint256 indexed characterId);
    event EarningsClaimed(address indexed user, uint256 amount);
    event DepartmentCreated(uint256 indexed departmentId, string name, uint8 floor);
    event UpgradePurchased(address indexed user, uint256 indexed upgradeId);
    event QuestCompleted(address indexed user, uint256 indexed questId, uint256 reward);
    event BuildingLevelUp(address indexed user, uint256 newLevel);

    constructor(
        address _characterNFT,
        address _luncToken
    ) {
        characterNFT = CharacterNFT(_characterNFT);
        luncToken = LuncToken(_luncToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(QUEST_MANAGER_ROLE, msg.sender);
        
        _initializeDefaultDepartments();
        _initializeDefaultUpgrades();
    }

    /**
     * @dev Stake a character in a department for earnings
     */
    function stakeCharacter(
        uint256 characterId,
        uint256 departmentId
    ) external nonReentrant whenNotPaused {
        require(characterNFT.ownerOf(characterId) == msg.sender, "Not character owner");
        require(departments[departmentId].isActive, "Department not active");
        require(!characterStakes[characterId].isActive, "Character already staked");
        require(
            departments[departmentId].characterList.length < departments[departmentId].maxCharacters,
            "Department at capacity"
        );

        // Check character requirements (level, rarity, etc.)
        _validateCharacterRequirements(characterId, departmentId);

        // Create stake record
        characterStakes[characterId] = CharacterStake({
            characterId: characterId,
            departmentId: departmentId,
            stakedAt: block.timestamp,
            lastClaim: block.timestamp,
            accumulatedEarnings: 0,
            isActive: true
        });

        // Update department
        departments[departmentId].assignedCharacters[characterId] = true;
        departments[departmentId].characterList.push(characterId);

        // Update user activity
        userLastActivity[msg.sender] = block.timestamp;

        // Update quest progress
        _updateQuestProgress(msg.sender, QuestType.STAKE_CHARACTERS, 1);

        emit CharacterStaked(msg.sender, characterId, departmentId);
    }

    /**
     * @dev Unstake a character and claim earnings
     */
    function unstakeCharacter(uint256 characterId) external nonReentrant {
        require(characterNFT.ownerOf(characterId) == msg.sender, "Not character owner");
        require(characterStakes[characterId].isActive, "Character not staked");

        // Calculate and transfer earnings
        uint256 earnings = calculateCharacterEarnings(characterId);
        if (earnings > 0) {
            characterStakes[characterId].accumulatedEarnings += earnings;
            _claimEarnings(msg.sender, characterId);
        }

        // Remove from department
        uint256 departmentId = characterStakes[characterId].departmentId;
        departments[departmentId].assignedCharacters[characterId] = false;
        _removeCharacterFromDepartment(departmentId, characterId);

        // Deactivate stake
        characterStakes[characterId].isActive = false;

        emit CharacterUnstaked(msg.sender, characterId);
    }

    /**
     * @dev Claim accumulated earnings for a character
     */
    function claimEarnings(uint256 characterId) external nonReentrant {
        require(characterNFT.ownerOf(characterId) == msg.sender, "Not character owner");
        require(characterStakes[characterId].isActive, "Character not staked");

        _claimEarnings(msg.sender, characterId);
        
        // Update quest progress
        _updateQuestProgress(msg.sender, QuestType.COLLECT_EARNINGS, 1);
    }

    /**
     * @dev Batch claim earnings for multiple characters
     */
    function batchClaimEarnings(uint256[] calldata characterIds) external nonReentrant {
        require(characterIds.length <= 50, "Too many characters");
        
        uint256 totalEarnings = 0;
        
        for (uint256 i = 0; i < characterIds.length; i++) {
            uint256 characterId = characterIds[i];
            require(characterNFT.ownerOf(characterId) == msg.sender, "Not character owner");
            require(characterStakes[characterId].isActive, "Character not staked");
            
            uint256 earnings = calculateCharacterEarnings(characterId);
            if (earnings > 0) {
                characterStakes[characterId].accumulatedEarnings += earnings;
                characterStakes[characterId].lastClaim = block.timestamp;
                totalEarnings += earnings;
            }
        }
        
        if (totalEarnings > 0) {
            userTotalEarnings[msg.sender] += totalEarnings;
            luncToken.mint(msg.sender, totalEarnings);
            emit EarningsClaimed(msg.sender, totalEarnings);
        }
        
        // Update quest progress
        _updateQuestProgress(msg.sender, QuestType.COLLECT_EARNINGS, characterIds.length);
    }

    /**
     * @dev Purchase a building upgrade
     */
    function purchaseUpgrade(uint256 upgradeId) external nonReentrant whenNotPaused {
        BuildingUpgrade storage upgrade = upgrades[upgradeId];
        require(upgrade.isActive, "Upgrade not available");
        require(!upgrade.isPurchased, "Upgrade already purchased");
        require(userBuildingLevel[msg.sender] >= upgrade.requiredLevel, "Insufficient building level");

        // Transfer payment
        luncToken.burnFrom(msg.sender, upgrade.cost);

        // Apply upgrade effects
        upgrade.isPurchased = true;
        _applyUpgradeEffect(upgradeId, upgrade.effectType, upgrade.effectValue);

        // Check for building level up
        _checkBuildingLevelUp(msg.sender);

        // Update quest progress
        _updateQuestProgress(msg.sender, QuestType.UPGRADE_BUILDING, 1);

        emit UpgradePurchased(msg.sender, upgradeId);
    }

    /**
     * @dev Complete a quest and claim rewards
     */
    function completeQuest(uint256 questId) external nonReentrant {
        Quest storage quest = quests[questId];
        require(quest.isActive, "Quest not active");
        require(block.timestamp <= quest.deadline, "Quest expired");
        
        QuestProgress storage progress = quest.userProgress[msg.sender];
        require(progress.currentValue >= quest.targetValue, "Quest not completed");
        require(!progress.isClaimed, "Reward already claimed");

        progress.isCompleted = true;
        progress.isClaimed = true;

        // Award quest reward
        userTotalEarnings[msg.sender] += quest.rewardAmount;
        luncToken.mint(msg.sender, quest.rewardAmount);

        emit QuestCompleted(msg.sender, questId, quest.rewardAmount);
    }

    /**
     * @dev Calculate current earnings for a staked character
     */
    function calculateCharacterEarnings(uint256 characterId) public view returns (uint256) {
        CharacterStake memory stake = characterStakes[characterId];
        if (!stake.isActive) return 0;

        Department storage dept = departments[stake.departmentId];
        uint256 timeStaked = block.timestamp - stake.lastClaim;
        
        // Base earnings calculation
        uint256 baseEarnings = dept.baseEarnings * timeStaked / 1 days;
        
        // Apply department efficiency bonus
        uint256 deptBonus = (baseEarnings * dept.efficiencyBonus) / 10000;
        
        // Apply building-wide efficiency
        uint256 buildingBonus = (baseEarnings * buildingEfficiency) / 10000;
        
        // Apply happiness modifier
        uint256 happinessBonus = (baseEarnings * globalHappiness) / 10000;
        
        return baseEarnings + deptBonus + buildingBonus + happinessBonus;
    }

    /**
     * @dev Get user's staked characters
     */
    function getUserStakedCharacters(address user) external view returns (uint256[] memory) {
        uint256 balance = characterNFT.balanceOf(user);
        uint256[] memory stakedCharacters = new uint256[](balance);
        uint256 stakedCount = 0;

        for (uint256 i = 0; i < balance; i++) {
            uint256 characterId = characterNFT.tokenOfOwnerByIndex(user, i);
            if (characterStakes[characterId].isActive) {
                stakedCharacters[stakedCount] = characterId;
                stakedCount++;
            }
        }

        // Resize array to actual count
        assembly {
            mstore(stakedCharacters, stakedCount)
        }

        return stakedCharacters;
    }

    /**
     * @dev Get department information including assigned characters
     */
    function getDepartmentInfo(uint256 departmentId) external view returns (
        string memory name,
        uint8 floor,
        uint8 maxCharacters,
        uint256 baseEarnings,
        uint256 efficiencyBonus,
        bool isActive,
        uint256[] memory assignedCharacters
    ) {
        Department storage dept = departments[departmentId];
        return (
            dept.name,
            dept.floor,
            dept.maxCharacters,
            dept.baseEarnings,
            dept.efficiencyBonus,
            dept.isActive,
            dept.characterList
        );
    }

    // Internal functions
    function _claimEarnings(address user, uint256 characterId) internal {
        uint256 earnings = calculateCharacterEarnings(characterId);
        if (earnings > 0) {
            characterStakes[characterId].accumulatedEarnings += earnings;
            characterStakes[characterId].lastClaim = block.timestamp;
            userTotalEarnings[user] += earnings;
            
            luncToken.mint(user, earnings);
            emit EarningsClaimed(user, earnings);
        }
    }

    function _validateCharacterRequirements(uint256 characterId, uint256 departmentId) internal view {
        // Implement character requirement validation
        // (level, rarity, skills, etc.)
        // This is simplified for the example
        require(characterNFT.getCharacterLevel(characterId) >= 1, "Character level too low");
    }

    function _removeCharacterFromDepartment(uint256 departmentId, uint256 characterId) internal {
        uint256[] storage characterList = departments[departmentId].characterList;
        for (uint256 i = 0; i < characterList.length; i++) {
            if (characterList[i] == characterId) {
                characterList[i] = characterList[characterList.length - 1];
                characterList.pop();
                break;
            }
        }
    }

    function _applyUpgradeEffect(uint256 upgradeId, UpgradeType effectType, uint256 effectValue) internal {
        if (effectType == UpgradeType.EFFICIENCY) {
            buildingEfficiency += effectValue;
        } else if (effectType == UpgradeType.HAPPINESS) {
            globalHappiness += effectValue;
        }
        // Add more upgrade types as needed
    }

    function _updateQuestProgress(address user, QuestType questType, uint256 amount) internal {
        // Update progress for all active quests of the specified type
        // This is simplified - in practice, you'd loop through active quests
    }

    function _checkBuildingLevelUp(address user) internal {
        // Calculate if user should level up based on upgrades purchased
        uint256 currentLevel = userBuildingLevel[user];
        uint256 upgradesPurchased = _countUserUpgrades(user);
        uint256 newLevel = upgradesPurchased / 5; // Level up every 5 upgrades
        
        if (newLevel > currentLevel) {
            userBuildingLevel[user] = newLevel;
            emit BuildingLevelUp(user, newLevel);
        }
    }

    function _countUserUpgrades(address user) internal view returns (uint256) {
        // Count purchased upgrades for user
        // This would need to track per-user upgrades in practice
        return 0; // Simplified
    }

    function _initializeDefaultDepartments() internal {
        // Management Department
        _createDepartment("Management", 25, 3, 100 ether, 1200); // 12% bonus
        
        // IT Department
        _createDepartment("IT Department", 20, 5, 80 ether, 1100); // 11% bonus
        
        // Human Resources
        _createDepartment("Human Resources", 15, 4, 70 ether, 1150); // 15% bonus
        
        // Finance
        _createDepartment("Finance", 18, 4, 90 ether, 1250); // 25% bonus
        
        // Operations
        _createDepartment("Operations", 10, 6, 60 ether, 1000); // No bonus
        
        // Security
        _createDepartment("Security", 5, 3, 75 ether, 1100); // 10% bonus
        
        // Administration
        _createDepartment("Administration", 8, 5, 55 ether, 1050); // 5% bonus
    }

    function _createDepartment(
        string memory name,
        uint8 floor,
        uint8 maxCharacters,
        uint256 baseEarnings,
        uint256 efficiencyBonus
    ) internal {
        Department storage dept = departments[nextDepartmentId];
        dept.name = name;
        dept.floor = floor;
        dept.maxCharacters = maxCharacters;
        dept.baseEarnings = baseEarnings;
        dept.efficiencyBonus = efficiencyBonus;
        dept.isActive = true;

        emit DepartmentCreated(nextDepartmentId, name, floor);
        nextDepartmentId++;
    }

    function _initializeDefaultUpgrades() internal {
        // High-Speed Elevator
        _createUpgrade("High-Speed Elevator", "Faster character movement", 1000 ether, 1000, UpgradeType.EFFICIENCY, 1);
        
        // Climate Control
        _createUpgrade("Climate Control", "Improved working conditions", 500 ether, 1500, UpgradeType.HAPPINESS, 1);
        
        // Employee Cafeteria
        _createUpgrade("Employee Cafeteria", "Increased productivity", 2000 ether, 2000, UpgradeType.EARNINGS, 1);
    }

    function _createUpgrade(
        string memory name,
        string memory description,
        uint256 cost,
        uint256 effectValue,
        UpgradeType effectType,
        uint256 requiredLevel
    ) internal {
        upgrades[nextUpgradeId] = BuildingUpgrade({
            name: name,
            description: description,
            cost: cost,
            effectValue: effectValue,
            effectType: effectType,
            isActive: true,
            isPurchased: false,
            requiredLevel: requiredLevel
        });
        nextUpgradeId++;
    }

    // Admin functions
    function createQuest(
        string memory title,
        string memory description,
        QuestType questType,
        uint256 targetValue,
        uint256 rewardAmount,
        uint256 duration
    ) external onlyRole(QUEST_MANAGER_ROLE) {
        Quest storage quest = quests[nextQuestId];
        quest.title = title;
        quest.description = description;
        quest.questType = questType;
        quest.targetValue = targetValue;
        quest.rewardAmount = rewardAmount;
        quest.deadline = block.timestamp + duration;
        quest.isActive = true;

        nextQuestId++;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        // Emergency function - use with caution
        payable(msg.sender).transfer(address(this).balance);
    }
}
