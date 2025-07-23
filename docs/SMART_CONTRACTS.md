# 🔗 Smart Contracts Documentation

## Virtual Building Empire - Blockchain Integration

Dieses Dokument beschreibt die Smart Contracts für das Virtual Building Empire Gaming System.

## 📋 Contract Übersicht

### 1. CharacterNFT.sol
**Zweck:** NFT Collection für die 2,500 Spieler-Charaktere

**Hauptfunktionen:**
- ✅ **Mint Characters:** Neue Charaktere prägen
- ✅ **Job Assignment:** Charaktere Jobs zuweisen
- ✅ **Level System:** Erfahrung sammeln und Level aufsteigen
- ✅ **Familie Management:** Charaktere pro Wallet verwalten

**Key Features:**
```solidity
// Character Struktur
struct Character {
    string name;
    CharacterType characterType;  // Common, Rare, Legendary
    Department department;
    uint256 level;
    uint256 experience;
    uint256 happiness;
    bool isWorking;
    string currentJob;
    uint256 dailyEarnings;
    uint256 lastWorkTimestamp;
}
```

### 2. LuncRewards.sol
**Zweck:** LUNC Token Belohnungssystem für Gameplay

**Hauptfunktionen:**
- 💰 **Daily Rewards:** Tägliche LUNC Auszahlungen
- 👨‍👩‍👧‍👦 **Familie Bonuses:** Größere Familien erhalten Boni
- 🏢 **Building Efficiency:** Gebäude-Performance beeinflusst Belohnungen
- 📊 **Salary System:** Job-basierte Gehaltsstruktur

**Belohnungslogik:**
```solidity
// Familie Bonus Berechnung
function _calculateFamilyBonus(uint256 familySize) private pure returns (uint256) {
    if (familySize >= 16) return 2000;      // 20% Bonus
    else if (familySize >= 8) return 1000;  // 10% Bonus  
    else if (familySize >= 4) return 500;   // 5% Bonus
    else return 0;                          // Kein Bonus
}
```

## 🚀 Deployment Guide

### Voraussetzungen
```bash
npm install @openzeppelin/contracts
npm install hardhat
npm install @nomiclabs/hardhat-ethers
```

### 1. CharacterNFT Contract deployen
```javascript
const CharacterNFT = await ethers.getContractFactory("CharacterNFT");
const characterNFT = await CharacterNFT.deploy(
    "Virtual Building Empire Characters",
    "VBEC", 
    "https://api.virtualbuilding.game/metadata/"
);
```

### 2. LuncRewards Contract deployen
```javascript
const LuncRewards = await ethers.getContractFactory("LuncRewards");
const luncRewards = await LuncRewards.deploy(
    LUNC_TOKEN_ADDRESS,
    characterNFT.address
);
```

### 3. Contracts verknüpfen und konfigurieren
```javascript
// LUNC Tokens für Belohnungen einzahlen
const luncAmount = ethers.utils.parseEther("1000000"); // 1M LUNC
await luncToken.transfer(luncRewards.address, luncAmount);

// Job Gehälter konfigurieren
await luncRewards.updateJobSalary("Building Director", ethers.utils.parseEther("200"));
await luncRewards.updateJobSalary("Senior Developer", ethers.utils.parseEther("80"));
// ... weitere Jobs
```

## 🎮 Gaming Integration

### Frontend Web3 Integration
```javascript
import { ethers } from 'ethers';

// Contract Instanzen erstellen
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const characterContract = new ethers.Contract(
    CHARACTER_NFT_ADDRESS,
    CharacterNFT_ABI,
    signer
);

const rewardsContract = new ethers.Contract(
    LUNC_REWARDS_ADDRESS,
    LuncRewards_ABI,
    signer
);
```

### Charakter minten
```javascript
async function mintCharacter(name, department) {
    const mintPrice = ethers.utils.parseEther("0.05");
    
    const tx = await characterContract.mintCharacter(
        await signer.getAddress(),
        name,
        department,
        { value: mintPrice }
    );
    
    await tx.wait();
    console.log('Character geminted!');
}
```

### Job zuweisen
```javascript
async function assignJob(tokenId, jobTitle, dailySalary) {
    const tx = await characterContract.assignJob(
        tokenId,
        jobTitle,
        ethers.utils.parseEther(dailySalary.toString())
    );
    
    await tx.wait();
    console.log('Job zugewiesen!');
}
```

### Tägliche Belohnungen einsammeln
```javascript
async function claimDailyRewards() {
    const tx = await rewardsContract.claimDailyRewards();
    await tx.wait();
    console.log('Belohnungen erhalten!');
}
```

### Familie Stats abrufen
```javascript
async function getFamilyStats(address) {
    const stats = await rewardsContract.getFamilyStats(address);
    
    return {
        familySize: stats.familySize.toNumber(),
        workingCharacters: stats.workingCharacters.toNumber(),
        estimatedDailyEarnings: ethers.utils.formatEther(stats.estimatedDailyEarnings),
        totalEarned: ethers.utils.formatEther(stats.totalEarnedAmount)
    };
}
```

## 📊 Contract Events

### CharacterNFT Events
```solidity
event CharacterMinted(uint256 indexed tokenId, address indexed owner, CharacterType characterType);
event CharacterAssignedJob(uint256 indexed tokenId, string jobTitle, uint256 salary);
event CharacterLevelUp(uint256 indexed tokenId, uint256 newLevel);
event ExperienceGained(uint256 indexed tokenId, uint256 experienceGained);
```

### LuncRewards Events
```solidity
event RewardsDistributed(uint256 totalAmount, uint256 timestamp);
event SalaryPaid(address indexed family, uint256 indexed tokenId, uint256 amount);
event FamilyBonusApplied(address indexed family, uint256 bonusAmount);
event JobSalaryUpdated(string jobTitle, uint256 newSalary);
```

## 🛡️ Security Features

### Access Control
- **Ownable:** Admin-Funktionen nur für Contract Owner
- **ReentrancyGuard:** Schutz vor Reentrancy-Attacken
- **Input Validation:** Alle Eingaben werden validiert

### Rate Limiting
```solidity
// Tägliche Claim-Limits
require(block.timestamp >= lastClaimTimestamp[family] + 1 days, "Already claimed today");
```

### Emergency Functions
```solidity
// Notfall-Abhebung (nur Owner)
function emergencyWithdraw(uint256 amount) public onlyOwner {
    require(luncToken.transfer(owner(), amount), "Emergency withdrawal failed");
}
```

## 🎯 Game Mechanics Implementation

### Character Leveling System
```solidity
// Erfahrung sammeln durch Arbeit
if (character.experience >= character.level * 100) {
    character.level++;
    character.dailyEarnings += 5; // Level-up Bonus
    emit CharacterLevelUp(tokenId, character.level);
}
```

### Happiness System
```solidity
// Zufriedenheit durch Ruhe erhöhen
function restCharacter(uint256 tokenId) public {
    characters[tokenId].isWorking = false;
    characters[tokenId].happiness = min(100, characters[tokenId].happiness + 10);
}
```

### Building Efficiency Impact
```solidity
// Gebäude-Effizienz beeinflusst alle Belohnungen
totalDailyEarnings = (totalDailyEarnings * buildingEfficiency) / 100;
```

## 🔧 Administration Functions

### Job Management
```javascript
// Neue Jobs hinzufügen
const newJobs = [
    { title: "Blockchain Developer", salary: "150" },
    { title: "Community Manager", salary: "85" },
    { title: "Game Designer", salary: "95" }
];

for (const job of newJobs) {
    await rewardsContract.updateJobSalary(
        job.title, 
        ethers.utils.parseEther(job.salary)
    );
}
```

### Building Efficiency Updates
```javascript
// Gebäude-Effizienz anpassen
const newEfficiency = 85; // 85%
await rewardsContract.updateBuildingEfficiency(newEfficiency);
```

### LUNC Pool Management
```javascript
// LUNC Tokens für Belohnungen nachfüllen
const refillAmount = ethers.utils.parseEther("500000"); // 500K LUNC
await rewardsContract.depositLuncForRewards(refillAmount);

// Contract Balance prüfen
const balance = await rewardsContract.getContractBalance();
console.log(`Contract LUNC Balance: ${ethers.utils.formatEther(balance)}`);
```

## 📈 Analytics & Monitoring

### Contract Metrics
```javascript
async function getContractMetrics() {
    // Gesamtanzahl geminteter Charaktere
    const totalSupply = await characterContract.totalSupply();
    
    // Contract LUNC Balance
    const balance = await rewardsContract.getContractBalance();
    
    // Gebäude-Effizienz
    const efficiency = await rewardsContract.buildingEfficiency();
    
    return {
        totalCharacters: totalSupply.toNumber(),
        luncBalance: ethers.utils.formatEther(balance),
        buildingEfficiency: efficiency.toNumber()
    };
}
```

### Event Monitoring
```javascript
// Character Mint Events überwachen
characterContract.on('CharacterMinted', (tokenId, owner, characterType) => {
    console.log(`New ${characterType} character #${tokenId} minted for ${owner}`);
});

// Belohnungs Events überwachen
rewardsContract.on('SalaryPaid', (family, tokenId, amount) => {
    console.log(`Family ${family} earned ${ethers.utils.formatEther(amount)} LUNC`);
});
```

## ⚖️ Legal & Compliance

### Gaming Disclaimer
```solidity
// Contract-Level Gaming Disclaimer
string public constant GAMING_DISCLAIMER = 
    "Virtual Building Empire is a gaming platform for entertainment purposes only. "
    "LUNC rewards are gameplay rewards, not investment returns. "
    "Dubai LLC compliant. Entertainment only.";
```

### No Investment Language
- ❌ "Investment" → ✅ "Character Collection"
- ❌ "Returns" → ✅ "Gameplay Rewards" 
- ❌ "Profit" → ✅ "LUNC Earnings"
- ❌ "Investors" → ✅ "Families/Players"

## 🔍 Testing Strategy

### Unit Tests
```javascript
describe("CharacterNFT", function () {
    it("Should mint character with correct attributes", async function () {
        const tx = await characterNFT.mintCharacter(
            owner.address,
            "Test Character",
            0 // Management department
        );
        
        const character = await characterNFT.getCharacter(0);
        expect(character.name).to.equal("Test Character");
        expect(character.level).to.equal(1);
    });
});
```

### Integration Tests
```javascript
describe("Game Integration", function () {
    it("Should complete full gameplay cycle", async function () {
        // 1. Mint character
        await characterNFT.mintCharacter(owner.address, "Worker", 2);
        
        // 2. Assign job
        await characterNFT.assignJob(0, "Security Guard", ethers.utils.parseEther("45"));
        
        // 3. Claim rewards
        await rewardsContract.claimDailyRewards();
        
        // 4. Verify LUNC balance
        const balance = await luncToken.balanceOf(owner.address);
        expect(balance).to.be.gt(0);
    });
});
```

---

**🎮 Virtual Building Empire - Dubai LLC compliant gaming platform**

*Entertainment only | No investment advice | LUNC rewards are gameplay rewards*