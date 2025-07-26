# 🎮 Virtual Building Empire - Complete Game Mechanics Guide

## 🎯 Core Game Loop

### 1. Character Collection Phase
1. **Connect Wallet** - Link MetaMask or compatible Web3 wallet
2. **Mint Characters** - Create NFT characters with different rarities
3. **Build Family** - Collect up to 50 characters per wallet
4. **Upgrade Characters** - Level up through experience and work

### 2. Building Management Phase
1. **Assign Jobs** - Place characters in building departments
2. **Optimize Efficiency** - Balance character happiness and productivity
3. **Manage Resources** - Monitor LUNC production and building capacity
4. **Expand Operations** - Unlock new floors and departments

### 3. Economic Phase
1. **Earn LUNC** - Generate passive income through working characters
2. **Trade Characters** - Buy and sell on the NFT marketplace
3. **Reinvest Profits** - Mint new characters or upgrade existing ones
4. **Strategic Growth** - Build the most efficient virtual empire

## 👥 Character System

### Character Types & Rarities

#### 🟢 Common Characters (70% chance)
- **Base Daily Earnings**: 25 LUNC
- **Minting Cost**: 100 LUNC
- **Level Cap**: 50
- **Example Jobs**: Office Worker, Security Guard, Cleaner, Maintenance
- **Special Abilities**: None
- **Happiness Decay**: Normal rate

#### 🔵 Rare Characters (25% chance)
- **Base Daily Earnings**: 50 LUNC
- **Minting Cost**: 300 LUNC
- **Level Cap**: 75
- **Example Jobs**: Manager, IT Support, HR Specialist, Accountant
- **Special Abilities**: 10% efficiency bonus to department
- **Happiness Decay**: 25% slower

#### 🟣 Legendary Characters (5% chance)
- **Base Daily Earnings**: 100 LUNC
- **Minting Cost**: 1,000 LUNC
- **Level Cap**: 100
- **Example Jobs**: CEO, Master Architect, Director, Chief Executive
- **Special Abilities**: 25% efficiency bonus + department unlock
- **Happiness Decay**: 50% slower

### Character Attributes

#### Core Stats
- **Level** (1-100): Increases daily earnings by 5% per level
- **Experience** (0-∞): Gained through work, required for leveling
- **Happiness** (0-100): Affects productivity and earning efficiency
- **Daily Earnings**: Base earnings × level multiplier × happiness multiplier

#### Work Attributes
- **Department**: Current work assignment (Management, IT, HR, etc.)
- **Working Status**: Active/Idle
- **Working Hours**: Total time spent working
- **Productivity Score**: Performance rating based on happiness and level

#### Progression System
```javascript
// Experience calculation
const experienceToNextLevel = currentLevel * 100;

// Daily earnings calculation
const dailyEarnings = baseEarnings * (1 + level * 0.05) * (happiness / 100);

// Happiness decay (daily)
const happinessDecay = isWorking ? 2 : 1; // Working characters lose happiness faster
```

### Character Development

#### Leveling System
1. **Experience Sources**:
   - Daily work: 10-50 XP per day (based on happiness)
   - Department bonuses: +25% XP for rare, +50% for legendary
   - Special events: Bonus XP weekends
   - Achievement rewards: One-time XP bonuses

2. **Level Benefits**:
   - Every level: +5% daily earnings
   - Every 10 levels: +5% happiness retention
   - Level 25: Unlock department specialization
   - Level 50: Unlock management positions
   - Level 75: Unlock executive roles
   - Level 100: Master status (maximum efficiency)

#### Happiness Management
1. **Happiness Sources**:
   - Rest periods: +10 happiness per day when not working
   - Department fit: +5 happiness for preferred departments
   - Social interactions: Happiness bonus from other characters
   - Special items: Furniture, decorations (future feature)

2. **Happiness Penalties**:
   - Overwork: -2 happiness per day when working
   - Department mismatch: -5 happiness for wrong assignments
   - Building overcrowding: -1 happiness per 10% over capacity
   - Isolation: -1 happiness when alone in department

## 🏢 Building Management

### Building Structure

#### 25-Floor Headquarters
```
Floor 25: Executive Offices (CEO, Directors)
Floor 24: Senior Management
Floor 23: IT Department (Servers, Development)
Floor 22: IT Department (Support, Security)
Floor 21: Finance Department (Accounting, Treasury)
Floor 20: Finance Department (Planning, Analysis)
Floor 19: HR Department (Recruitment, Training)
Floor 18: HR Department (Benefits, Relations)
Floor 17: Operations (Logistics, Supply Chain)
Floor 16: Operations (Quality, Process)
Floor 15: Marketing (Strategy, Creative)
Floor 14: Marketing (Digital, Events)
Floor 13: Sales (Enterprise, Regional)
Floor 12: Sales (Retail, Support)
Floor 11: Legal (Contracts, Compliance)
Floor 10: Research & Development
Floor 9: Customer Service
Floor 8: Administration
Floor 7: Security & Safety
Floor 6: Facilities Management
Floor 5: Training Center
Floor 4: Employee Recreation
Floor 3: Cafeteria & Dining
Floor 2: Reception & Lobby
Floor 1: Storage & Utilities
```

### Department System

#### 🏛️ Management Department
- **Floors**: 24-25
- **Capacity**: 50 characters
- **Specialization**: Strategic planning, oversight
- **Bonus**: +15% building-wide efficiency
- **Requirements**: Level 50+ characters
- **Unlocks**: Board meetings, strategic decisions

#### 💻 IT Department
- **Floors**: 22-23
- **Capacity**: 150 characters
- **Specialization**: Technology, automation
- **Bonus**: +10% LUNC collection efficiency
- **Requirements**: Any level
- **Unlocks**: Digital systems, server upgrades

#### 👥 HR Department
- **Floors**: 18-19
- **Capacity**: 100 characters
- **Specialization**: Character development
- **Bonus**: +25% experience gain for all characters
- **Requirements**: Level 25+ characters
- **Unlocks**: Training programs, wellness initiatives

#### 💰 Finance Department
- **Floors**: 20-21
- **Capacity**: 125 characters
- **Specialization**: LUNC optimization
- **Bonus**: +5% daily LUNC earnings
- **Requirements**: Level 30+ characters
- **Unlocks**: Investment opportunities, budgeting

#### ⚙️ Operations Department
- **Floors**: 16-17
- **Capacity**: 200 characters
- **Specialization**: Efficiency, processes
- **Bonus**: +20% building capacity
- **Requirements**: Level 20+ characters
- **Unlocks**: Automation, workflow optimization

#### 🛡️ Security Department
- **Floor**: 7
- **Capacity**: 75 characters
- **Specialization**: Protection, safety
- **Bonus**: Prevents character happiness decay
- **Requirements**: Level 15+ characters
- **Unlocks**: Advanced security, risk management

#### 📋 Administration Department
- **Floor**: 8
- **Capacity**: 100 characters
- **Specialization**: Support, coordination
- **Bonus**: +10% all department efficiency
- **Requirements**: Any level
- **Unlocks**: Streamlined processes, better communication

### Building Efficiency System

#### Efficiency Calculation
```javascript
const buildingEfficiency = (
  (totalWorkingCharacters / totalCharacters) * 0.4 +
  (averageCharacterHappiness / 100) * 0.3 +
  (departmentBalance / totalDepartments) * 0.2 +
  (buildingCapacityUtilization) * 0.1
) * 100;
```

#### Efficiency Bonuses
- **80%+ Efficiency**: +10% all earnings
- **90%+ Efficiency**: +20% all earnings + unlock premium features
- **95%+ Efficiency**: +30% all earnings + special events
- **100% Efficiency**: +50% all earnings + legendary character mint chance

## 💎 LUNC Token Economics

### Token Specifications
- **Name**: Virtual Building LUNC (VLUNC)
- **Decimals**: 6
- **Max Supply**: 10,000,000,000 LUNC
- **Initial Distribution**: 1,000,000,000 LUNC
- **Utility**: Game currency, marketplace transactions, character minting

### Earning Mechanisms

#### 1. Character Work (Primary)
- **Common Characters**: 25-125 LUNC/day (level 1-50)
- **Rare Characters**: 50-375 LUNC/day (level 1-75)
- **Legendary Characters**: 100-950 LUNC/day (level 1-100)
- **Collection**: Automatic every 24 hours at 12:00 PM UTC

#### 2. Daily Login Rewards
- **Day 1**: 50 LUNC
- **Day 7**: 100 LUNC + experience boost
- **Day 30**: 500 LUNC + rare character mint discount
- **Day 90**: 1,000 LUNC + legendary character mint chance

#### 3. Achievement Rewards
```javascript
const achievements = {
  firstCharacter: { reward: 100, description: "Mint your first character" },
  familyOf10: { reward: 500, description: "Own 10 characters" },
  levelMaster: { reward: 1000, description: "Reach level 50 with any character" },
  efficiency90: { reward: 2000, description: "Achieve 90% building efficiency" },
  marketTrader: { reward: 250, description: "Complete 5 marketplace transactions" },
  departmentHead: { reward: 750, description: "Fill a department to capacity" },
  luncMillionaire: { reward: 5000, description: "Accumulate 1,000,000 LUNC" }
};
```

#### 4. Special Events
- **Happy Hour**: 2x earnings for 2 hours daily
- **Weekend Bonus**: +50% earnings Saturday-Sunday
- **Monthly Challenges**: Themed events with bonus rewards
- **Community Goals**: Collective challenges with shared rewards

### LUNC Spending

#### Character Minting Costs
- **Common**: 100 LUNC
- **Rare**: 300 LUNC  
- **Legendary**: 1,000 LUNC
- **Bulk Minting**: 5% discount for 5+ characters
- **VIP Minting**: Premium service with guaranteed traits

#### Building Upgrades (Future Feature)
- **Floor Renovation**: 10,000 LUNC per floor
- **Capacity Expansion**: 5,000 LUNC per 10% increase
- **Efficiency Boost**: 2,500 LUNC for temporary +25% efficiency
- **Premium Furniture**: 500-2,000 LUNC for happiness bonuses

#### Marketplace Fees
- **Listing Fee**: 50 LUNC per listing
- **Transaction Fee**: 2.5% of sale price
- **Premium Listing**: 500 LUNC for featured placement
- **Auction Service**: 1% additional fee for auction-style sales

## 🛒 Marketplace Mechanics

### Trading System

#### Listing Requirements
- **Minimum Price**: 50 LUNC
- **Maximum Price**: 1,000,000 LUNC
- **Listing Duration**: 7-90 days
- **Character Status**: Must not be working
- **Approval**: NFT approval for marketplace contract

#### Pricing Dynamics
```javascript
// Suggested price calculation
const suggestedPrice = (
  baseCharacterValue[type] * 
  (1 + level * 0.1) * 
  (happiness / 100) * 
  marketDemandMultiplier[type] *
  (1 + rarityBonus[type])
);

// Market demand factors
const demandFactors = {
  totalSupply: -0.1, // More supply = lower prices
  activeListings: -0.05, // More listings = lower prices
  recentSales: +0.2, // Recent activity = higher prices
  communityEvents: +0.15 // Special events = higher prices
};
```

#### Offer System
- **Minimum Offer**: 70% of listing price
- **Offer Duration**: 1-30 days
- **Counter Offers**: Up to 3 rounds of negotiation
- **Automatic Acceptance**: Set price thresholds for instant sales

### Market Statistics

#### Price Tracking
- **Floor Price**: Lowest listing per character type
- **Average Price**: Mean sale price over 30 days
- **Volume**: Total LUNC traded in marketplace
- **Velocity**: Average time from listing to sale

#### Market Health Indicators
- **Liquidity**: Active listings vs. total characters
- **Spread**: Difference between highest offer and lowest listing
- **Transaction Frequency**: Sales per day/week
- **Price Stability**: Volatility measures

## 🎯 Strategic Gameplay

### Character Portfolio Optimization

#### Balanced Strategy
- **70% Common**: Steady, reliable income
- **25% Rare**: Higher earnings, department bonuses
- **5% Legendary**: Maximum efficiency, special abilities
- **Department Distribution**: Cover all major departments

#### Aggressive Growth Strategy
- **Focus on Legendary**: High-risk, high-reward
- **Leverage Marketplace**: Buy undervalued characters
- **Efficiency Maximization**: Target 90%+ building efficiency
- **Reinvestment**: Reinvest all earnings into character acquisition

#### Passive Income Strategy
- **Common Character Focus**: Lower risk, steady returns
- **Happiness Management**: Maintain high character satisfaction
- **Long-term Holdings**: Avoid marketplace speculation
- **Consistent Collection**: Daily LUNC collection routine

### Advanced Tactics

#### Department Synergies
- **HR + All Departments**: Experience bonuses stack
- **IT + Operations**: Automation efficiency multipliers
- **Finance + Management**: Strategic planning bonuses
- **Security + All**: Happiness protection for entire building

#### Market Timing
- **Buy During Events**: Lower prices during special events
- **Sell High-Level Characters**: Premium pricing for max-level characters
- **Seasonal Patterns**: Holiday and weekend trading patterns
- **News Trading**: React to game updates and announcements

#### Resource Management
- **LUNC Reserves**: Maintain emergency funds
- **Character Rotation**: Rest periods to maintain happiness
- **Upgrade Timing**: Strategic character leveling
- **Portfolio Rebalancing**: Adapt to market conditions

## 🏆 Achievement System

### Collection Achievements
- **Character Collector**: Own 1, 5, 10, 25, 50 characters
- **Rarity Hunter**: Own characters of each rarity type
- **Department Master**: Fill each department type
- **Level Legend**: Reach max level with each character type

### Economic Achievements
- **LUNC Accumulator**: Earn 1K, 10K, 100K, 1M, 10M LUNC
- **Market Trader**: Complete 1, 10, 50, 100 marketplace transactions
- **Profit Maximizer**: Achieve certain ROI thresholds
- **Efficiency Expert**: Maintain 90%+ efficiency for extended periods

### Social Achievements
- **Community Contributor**: Participate in community events
- **Guild Leader**: Lead community initiatives (future feature)
- **Mentor**: Help new players (future feature)
- **Ambassador**: Represent game in external communities

### Special Achievements
- **First Day Player**: Join during launch period
- **Beta Tester**: Participate in pre-launch testing
- **Bug Hunter**: Report and help fix game issues
- **Event Champion**: Win special event competitions

## 📊 Progression Metrics

### Individual Progress
- **Net Worth**: Total LUNC + character portfolio value
- **Daily Income**: Current earnings per day
- **Growth Rate**: Week-over-week progression
- **Efficiency Score**: Building optimization rating

### Leaderboards
- **Top Collectors**: Most characters owned
- **Highest Earners**: Daily/weekly/monthly income leaders
- **Market Masters**: Most successful traders
- **Efficiency Experts**: Highest building efficiency ratings

### Global Statistics
- **Total Players**: Active user count
- **Total Characters**: Minted character count
- **Economic Activity**: Daily transaction volume
- **Market Health**: Liquidity and stability metrics

---

**🎮 Ready to Build Your Empire?**

The Virtual Building Empire offers unlimited strategic depth with multiple paths to success. Whether you prefer steady passive income, aggressive market trading, or efficiency optimization, there's a gameplay style for every player. Start building your empire today!