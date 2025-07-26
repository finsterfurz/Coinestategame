// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title LuncToken
 * @dev LUNC reward token for Virtual Building Empire
 * Features: Mintable, Burnable, Pausable, Access Control
 */
contract LuncToken is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // ===================================
    // 🔐 ROLES & CONSTANTS
    // ===================================
    
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant DAILY_REWARD_POOL = 100_000 * 10**18; // 100k tokens per day

    // ===================================
    // 🗃️ STATE VARIABLES
    // ===================================
    
    mapping(address => uint256) public lastRewardClaim;
    mapping(address => bool) public gameContracts;
    
    uint256 public totalRewardsDistributed;
    uint256 public dailyRewardPool;
    bool public rewardsEnabled;

    // ===================================
    // 📡 EVENTS
    // ===================================
    
    event RewardsClaimed(address indexed user, uint256 amount);
    event GameContractAdded(address indexed gameContract);
    event GameContractRemoved(address indexed gameContract);
    event RewardsToggled(bool enabled);
    event DailyRewardPoolUpdated(uint256 newAmount);

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
        uint256 initialSupply
    ) public initializer {
        __ERC20_init(name, symbol);
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        dailyRewardPool = DAILY_REWARD_POOL;
        rewardsEnabled = true;
        
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    // ===================================
    // 🎮 GAME REWARD FUNCTIONS
    // ===================================
    
    function claimDailyRewards(address user, uint256 amount) external nonReentrant {
        require(gameContracts[msg.sender], "Not authorized game contract");
        require(rewardsEnabled, "Rewards are disabled");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(user, amount);
        totalRewardsDistributed += amount;
        lastRewardClaim[user] = block.timestamp;
        
        emit RewardsClaimed(user, amount);
    }
    
    function batchRewardUsers(
        address[] calldata users,
        uint256[] calldata amounts
    ) external nonReentrant {
        require(hasRole(MINTER_ROLE, msg.sender), "Not authorized");
        require(users.length == amounts.length, "Arrays length mismatch");
        require(users.length <= 100, "Too many users");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Would exceed max supply");
        
        for (uint256 i = 0; i < users.length; i++) {
            if (amounts[i] > 0) {
                _mint(users[i], amounts[i]);
                lastRewardClaim[users[i]] = block.timestamp;
                emit RewardsClaimed(users[i], amounts[i]);
            }
        }
        
        totalRewardsDistributed += totalAmount;
    }

    // ===================================
    // 🔧 ADMIN FUNCTIONS
    // ===================================
    
    function addGameContract(address gameContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(gameContract != address(0), "Invalid address");
        gameContracts[gameContract] = true;
        emit GameContractAdded(gameContract);
    }
    
    function removeGameContract(address gameContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        gameContracts[gameContract] = false;
        emit GameContractRemoved(gameContract);
    }
    
    function setDailyRewardPool(uint256 newAmount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        dailyRewardPool = newAmount;
        emit DailyRewardPoolUpdated(newAmount);
    }
    
    function toggleRewards() external onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardsEnabled = !rewardsEnabled;
        emit RewardsToggled(rewardsEnabled);
    }
    
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ===================================
    // 🔍 VIEW FUNCTIONS
    // ===================================
    
    function getUserLastClaim(address user) external view returns (uint256) {
        return lastRewardClaim[user];
    }
    
    function isGameContract(address account) external view returns (bool) {
        return gameContracts[account];
    }
    
    function getRemainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    function getRewardStats() external view returns (
        uint256 totalDistributed,
        uint256 dailyPool,
        bool enabled
    ) {
        return (totalRewardsDistributed, dailyRewardPool, rewardsEnabled);
    }

    // ===================================
    // 🔨 INTERNAL FUNCTIONS
    // ===================================
    
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        super._beforeTokenTransfer(from, to, amount);
    }
}