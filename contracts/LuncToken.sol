// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title LuncToken
 * @dev Virtual Building Empire LUNC Token Contract
 * @author Virtual Building Empire Team
 */
contract LuncToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard {
    // ===================================
    // ROLES
    // ===================================
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant REWARDS_ROLE = keccak256("REWARDS_ROLE");

    // ===================================
    // STATE VARIABLES
    // ===================================
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**6; // 10B tokens with 6 decimals
    
    mapping(address => bool) public excludedFromFees;
    mapping(address => uint256) public lastRewardClaim;
    
    uint256 public rewardCooldown = 24 hours;
    uint256 public maxRewardPerClaim = 1000 * 10**6; // 1000 LUNC
    
    // Events
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardCooldownUpdated(uint256 newCooldown);
    event MaxRewardUpdated(uint256 newMaxReward);
    event FeesExcluded(address indexed account, bool excluded);

    // ===================================
    // CONSTRUCTOR
    // ===================================
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds maximum");
        
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(MINTER_ROLE, _msgSender());
        _grantRole(PAUSER_ROLE, _msgSender());
        _grantRole(REWARDS_ROLE, _msgSender());
        
        _mint(_msgSender(), initialSupply);
        
        // Exclude deployer from fees
        excludedFromFees[_msgSender()] = true;
    }

    // ===================================
    // TOKEN MECHANICS
    // ===================================
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) nonReentrant {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    function batchMint(address[] memory recipients, uint256[] memory amounts) 
        external 
        onlyRole(MINTER_ROLE) 
        nonReentrant 
    {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length <= 100, "Too many recipients");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Would exceed max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }

    // ===================================
    // REWARD SYSTEM
    // ===================================
    function claimDailyReward() external nonReentrant whenNotPaused {
        require(
            block.timestamp >= lastRewardClaim[_msgSender()] + rewardCooldown,
            "Reward cooldown not met"
        );
        
        lastRewardClaim[_msgSender()] = block.timestamp;
        
        // Calculate reward based on user activity (can be enhanced)
        uint256 reward = calculateReward(_msgSender());
        require(reward > 0, "No reward available");
        require(reward <= maxRewardPerClaim, "Reward exceeds maximum");
        
        _mint(_msgSender(), reward);
        
        emit RewardsClaimed(_msgSender(), reward);
    }
    
    function calculateReward(address user) public view returns (uint256) {
        // Basic reward calculation - can be enhanced with game mechanics
        uint256 baseReward = 100 * 10**6; // 100 LUNC
        
        // Add bonus based on balance (holder bonus)
        uint256 balance = balanceOf(user);
        if (balance >= 10000 * 10**6) { // 10k+ LUNC
            baseReward = baseReward * 150 / 100; // 50% bonus
        } else if (balance >= 1000 * 10**6) { // 1k+ LUNC
            baseReward = baseReward * 125 / 100; // 25% bonus
        }
        
        return baseReward;
    }
    
    function distributeRewards(address[] memory users, uint256[] memory amounts) 
        external 
        onlyRole(REWARDS_ROLE) 
        nonReentrant 
    {
        require(users.length == amounts.length, "Array length mismatch");
        require(users.length <= 500, "Too many users");
        
        for (uint256 i = 0; i < users.length; i++) {
            if (amounts[i] > 0) {
                _mint(users[i], amounts[i]);
                emit RewardsClaimed(users[i], amounts[i]);
            }
        }
    }

    // ===================================
    // ADMIN FUNCTIONS
    // ===================================
    function setRewardCooldown(uint256 newCooldown) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newCooldown >= 1 hours && newCooldown <= 7 days, "Invalid cooldown period");
        rewardCooldown = newCooldown;
        emit RewardCooldownUpdated(newCooldown);
    }
    
    function setMaxRewardPerClaim(uint256 newMaxReward) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMaxReward > 0 && newMaxReward <= 10000 * 10**6, "Invalid max reward");
        maxRewardPerClaim = newMaxReward;
        emit MaxRewardUpdated(newMaxReward);
    }
    
    function setExcludedFromFees(address account, bool excluded) external onlyRole(DEFAULT_ADMIN_ROLE) {
        excludedFromFees[account] = excluded;
        emit FeesExcluded(account, excluded);
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    function emergencyWithdraw(address token, address to, uint256 amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(token != address(this), "Cannot withdraw LUNC");
        require(to != address(0), "Invalid recipient");
        
        IERC20(token).transfer(to, amount);
    }

    // ===================================
    // VIEW FUNCTIONS
    // ===================================
    function getRewardCooldownRemaining(address user) external view returns (uint256) {
        uint256 lastClaim = lastRewardClaim[user];
        if (lastClaim == 0) return 0;
        
        uint256 nextClaim = lastClaim + rewardCooldown;
        if (block.timestamp >= nextClaim) return 0;
        
        return nextClaim - block.timestamp;
    }
    
    function canClaimReward(address user) external view returns (bool) {
        return block.timestamp >= lastRewardClaim[user] + rewardCooldown;
    }
    
    function getCirculatingSupply() external view returns (uint256) {
        // Can be enhanced to exclude locked tokens, treasury, etc.
        return totalSupply();
    }

    // ===================================
    // INTERNAL OVERRIDES
    // ===================================
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._afterTokenTransfer(from, to, amount);
        
        // Additional logic can be added here for game mechanics
        // e.g., update user statistics, trigger events, etc.
    }
}