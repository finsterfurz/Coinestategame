// 🚀 Virtual Building Empire - Smart Contract Deployment Script

const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Deployment Configuration
const DEPLOYMENT_CONFIG = {
    // NFT Configuration
    nft: {
        name: "Virtual Building Empire Characters",
        symbol: "VBEC",
        baseURI: "https://api.virtualbuilding.game/metadata/",
        mintPrice: ethers.utils.parseEther("0.05")
    },
    
    // LUNC Token Configuration
    luncToken: {
        // Replace with actual LUNC token address on your network
        address: "0x0000000000000000000000000000000000000000", // TO BE UPDATED
        initialRewardPool: ethers.utils.parseEther("1000000") // 1M LUNC
    },
    
    // Network Configuration
    network: {
        confirmations: 2, // Wait for 2 confirmations
        gasLimit: 8000000,
        gasPrice: ethers.utils.parseUnits("20", "gwei")
    }
};

async function main() {
    console.log("🎮 Virtual Building Empire - Smart Contract Deployment");
    console.log("=" .repeat(60));
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("\n📱 Deploying contracts with account:", deployer.address);
    
    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
    
    if (balance.lt(ethers.utils.parseEther("0.1"))) {
        console.log("⚠️  Warning: Low balance for deployment!");
    }
    
    // Deployment results
    const deploymentResults = {
        network: await deployer.provider.getNetwork(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {}
    };
    
    try {
        // 1. Deploy CharacterNFT Contract
        console.log("\n🎯 Step 1: Deploying CharacterNFT Contract...");
        const CharacterNFT = await ethers.getContractFactory("CharacterNFT");
        
        const characterNFT = await CharacterNFT.deploy(
            DEPLOYMENT_CONFIG.nft.name,
            DEPLOYMENT_CONFIG.nft.symbol,
            DEPLOYMENT_CONFIG.nft.baseURI,
            {
                gasLimit: DEPLOYMENT_CONFIG.network.gasLimit,
                gasPrice: DEPLOYMENT_CONFIG.network.gasPrice
            }
        );
        
        await characterNFT.deployed();
        console.log("✅ CharacterNFT deployed to:", characterNFT.address);
        
        // Wait for confirmations
        console.log(`⏳ Waiting for ${DEPLOYMENT_CONFIG.network.confirmations} confirmations...`);
        await characterNFT.deployTransaction.wait(DEPLOYMENT_CONFIG.network.confirmations);
        
        deploymentResults.contracts.characterNFT = characterNFT.address;
        
        // 2. Deploy LuncRewards Contract
        console.log("\n🎯 Step 2: Deploying LuncRewards Contract...");
        
        if (DEPLOYMENT_CONFIG.luncToken.address === "0x0000000000000000000000000000000000000000") {
            console.log("⚠️  LUNC Token address not configured! Please update DEPLOYMENT_CONFIG");
            console.log("Using placeholder address for now...");
        }
        
        const LuncRewards = await ethers.getContractFactory("LuncRewards");
        const luncRewards = await LuncRewards.deploy(
            DEPLOYMENT_CONFIG.luncToken.address,
            characterNFT.address,
            {
                gasLimit: DEPLOYMENT_CONFIG.network.gasLimit,
                gasPrice: DEPLOYMENT_CONFIG.network.gasPrice
            }
        );
        
        await luncRewards.deployed();
        console.log("✅ LuncRewards deployed to:", luncRewards.address);
        
        // Wait for confirmations
        await luncRewards.deployTransaction.wait(DEPLOYMENT_CONFIG.network.confirmations);
        
        deploymentResults.contracts.luncRewards = luncRewards.address;
        
        // 3. Initialize Contracts
        console.log("\n🎯 Step 3: Initializing Contracts...");
        
        // Set initial job salaries
        console.log("💼 Setting up job salaries...");
        const jobSalaries = [
            ["Building Director", "200"],
            ["IT Department Head", "120"],
            ["HR Manager", "110"],
            ["Marketing Director", "130"],
            ["Finance Controller", "125"],
            ["Senior Developer", "80"],
            ["Marketing Specialist", "65"],
            ["Accountant", "70"],
            ["System Administrator", "75"],
            ["Security Chief", "45"],
            ["Maintenance Worker", "35"],
            ["Receptionist", "30"],
            ["Cleaning Staff", "25"],
            ["Chef", "40"],
            ["Fitness Trainer", "35"],
            ["Waiter", "20"]
        ];
        
        for (const [jobTitle, salary] of jobSalaries) {
            const tx = await luncRewards.updateJobSalary(
                jobTitle,
                ethers.utils.parseEther(salary)
            );
            await tx.wait();
            console.log(`   ✓ ${jobTitle}: ${salary} LUNC/day`);
        }
        
        // Set initial building efficiency
        console.log("🏢 Setting building efficiency to 80%...");
        const efficiencyTx = await luncRewards.updateBuildingEfficiency(80);
        await efficiencyTx.wait();
        console.log("   ✓ Building efficiency set to 80%");
        
        // 4. Verify Contracts
        console.log("\n🎯 Step 4: Verifying Contract Setup...");
        
        // Verify CharacterNFT
        const nftName = await characterNFT.name();
        const nftSymbol = await characterNFT.symbol();
        const maxSupply = await characterNFT.MAX_SUPPLY();
        
        console.log(`📋 CharacterNFT: ${nftName} (${nftSymbol})`);
        console.log(`   Max Supply: ${maxSupply.toString()}`);
        
        // Verify LuncRewards
        const buildingEfficiency = await luncRewards.buildingEfficiency();
        const directorSalary = await luncRewards.getJobSalary("Building Director");
        
        console.log(`💰 LuncRewards configured`);
        console.log(`   Building Efficiency: ${buildingEfficiency}%`);
        console.log(`   Director Salary: ${ethers.utils.formatEther(directorSalary)} LUNC/day`);
        
        // 5. Save Deployment Info
        console.log("\n🎯 Step 5: Saving Deployment Information...");
        
        // Save to deployments directory
        const deploymentsDir = path.join(__dirname, '..', 'deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }
        
        const deploymentFile = path.join(deploymentsDir, `deployment-${Date.now()}.json`);
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResults, null, 2));
        
        // Update config file for frontend
        const configFile = path.join(__dirname, '..', 'config', 'gameConfig.js');
        if (fs.existsSync(configFile)) {
            let configContent = fs.readFileSync(configFile, 'utf8');
            configContent = configContent.replace(
                /characterNFT: '.*?'/,
                `characterNFT: '${characterNFT.address}'`
            );
            configContent = configContent.replace(
                /luncRewards: '.*?'/,
                `luncRewards: '${luncRewards.address}'`
            );
            fs.writeFileSync(configFile, configContent);
            console.log("✅ Updated gameConfig.js with contract addresses");
        }
        
        // Generate frontend constants file
        const constantsContent = `// 🎮 Virtual Building Empire - Contract Addresses
// Auto-generated on ${deploymentResults.timestamp}

export const CONTRACT_ADDRESSES = {
    CHARACTER_NFT: '${characterNFT.address}',
    LUNC_REWARDS: '${luncRewards.address}',
    LUNC_TOKEN: '${DEPLOYMENT_CONFIG.luncToken.address}'
};

export const NETWORK_CONFIG = {
    chainId: ${deploymentResults.network.chainId},
    name: '${deploymentResults.network.name}'
};

export default CONTRACT_ADDRESSES;
`;
        
        const constantsFile = path.join(__dirname, '..', 'src', 'constants', 'contracts.js');
        const constantsDir = path.dirname(constantsFile);
        if (!fs.existsSync(constantsDir)) {
            fs.mkdirSync(constantsDir, { recursive: true });
        }
        fs.writeFileSync(constantsFile, constantsContent);
        
        // Success Summary
        console.log("\n" + "=".repeat(60));
        console.log("🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("=".repeat(60));
        console.log(`\n📋 Contract Addresses:`);
        console.log(`   CharacterNFT: ${characterNFT.address}`);
        console.log(`   LuncRewards:  ${luncRewards.address}`);
        console.log(`\n🌐 Network: ${deploymentResults.network.name} (Chain ID: ${deploymentResults.network.chainId})`);
        console.log(`📁 Deployment saved: ${deploymentFile}`);
        console.log(`⚙️  Config updated: config/gameConfig.js`);
        console.log(`📜 Constants created: src/constants/contracts.js`);
        
        // Next Steps
        console.log(`\n🚀 Next Steps:`);
        console.log(`   1. Update LUNC_TOKEN address in deployment config`);
        console.log(`   2. Fund LuncRewards contract with LUNC tokens`);
        console.log(`   3. Verify contracts on block explorer`);
        console.log(`   4. Test minting and job assignments`);
        console.log(`   5. Deploy frontend application`);
        
        // Verification Commands
        if (deploymentResults.network.name !== 'hardhat' && deploymentResults.network.name !== 'localhost') {
            console.log(`\n🔍 Verify contracts with:`);
            console.log(`   npx hardhat verify --network ${deploymentResults.network.name} ${characterNFT.address} "${DEPLOYMENT_CONFIG.nft.name}" "${DEPLOYMENT_CONFIG.nft.symbol}" "${DEPLOYMENT_CONFIG.nft.baseURI}"`);
            console.log(`   npx hardhat verify --network ${deploymentResults.network.name} ${luncRewards.address} ${DEPLOYMENT_CONFIG.luncToken.address} ${characterNFT.address}`);
        }
        
    } catch (error) {
        console.error("\n❌ Deployment failed:", error);
        
        // Save error information
        const errorFile = path.join(__dirname, '..', 'deployments', `error-${Date.now()}.json`);
        fs.writeFileSync(errorFile, JSON.stringify({
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            config: DEPLOYMENT_CONFIG
        }, null, 2));
        
        process.exit(1);
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main, DEPLOYMENT_CONFIG };