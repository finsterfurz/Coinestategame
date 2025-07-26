// ===================================
// 🚀 SMART CONTRACT DEPLOYMENT SCRIPT
// ===================================

const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const path = require('path');

// Deployment configuration
const CONFIG = {
  // Character NFT Settings
  CHARACTER_NAME: "Virtual Building Empire Characters",
  CHARACTER_SYMBOL: "VBEC",
  CHARACTER_BASE_URI: "https://api.virtualbuilding.game/metadata/",
  
  // LUNC Token Settings
  LUNC_NAME: "Virtual Building LUNC",
  LUNC_SYMBOL: "VLUNC",
  LUNC_INITIAL_SUPPLY: ethers.utils.parseUnits("1000000000", 6), // 1B tokens with 6 decimals
  
  // Marketplace Settings
  MARKETPLACE_FEE: 250, // 2.5% (in basis points)
  
  // Building Settings
  MAX_FLOORS: 25,
  INITIAL_EFFICIENCY: 50
};

async function main() {
  console.log("🏢 Virtual Building Empire - Smart Contract Deployment");
  console.log("=" + "=".repeat(60));
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 Deployment Info:");
  console.log(`   Network: ${network.name} (${network.chainId})`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
  console.log();
  
  // Track deployed contracts
  const deployedContracts = {};
  
  try {
    // ===================================
    // 1. DEPLOY LUNC TOKEN
    // ===================================
    console.log("💎 Deploying LUNC Token...");
    
    const LuncToken = await ethers.getContractFactory("LuncToken");
    const luncToken = await LuncToken.deploy(
      CONFIG.LUNC_NAME,
      CONFIG.LUNC_SYMBOL,
      CONFIG.LUNC_INITIAL_SUPPLY
    );
    await luncToken.deployed();
    
    deployedContracts.luncToken = luncToken.address;
    console.log(`   ✅ LUNC Token deployed to: ${luncToken.address}`);
    
    // ===================================
    // 2. DEPLOY CHARACTER NFT
    // ===================================
    console.log("🎯 Deploying Character NFT...");
    
    const CharacterNFT = await ethers.getContractFactory("CharacterNFT");
    const characterNFT = await upgrades.deployProxy(
      CharacterNFT,
      [
        CONFIG.CHARACTER_NAME,
        CONFIG.CHARACTER_SYMBOL,
        CONFIG.CHARACTER_BASE_URI,
        luncToken.address
      ],
      { initializer: 'initialize' }
    );
    await characterNFT.deployed();
    
    deployedContracts.characterNFT = characterNFT.address;
    console.log(`   ✅ Character NFT deployed to: ${characterNFT.address}`);
    
    // ===================================
    // 3. DEPLOY BUILDING MANAGER
    // ===================================
    console.log("🏢 Deploying Building Manager...");
    
    const BuildingManager = await ethers.getContractFactory("BuildingManager");
    const buildingManager = await upgrades.deployProxy(
      BuildingManager,
      [
        characterNFT.address,
        luncToken.address,
        CONFIG.MAX_FLOORS,
        CONFIG.INITIAL_EFFICIENCY
      ],
      { initializer: 'initialize' }
    );
    await buildingManager.deployed();
    
    deployedContracts.buildingManager = buildingManager.address;
    console.log(`   ✅ Building Manager deployed to: ${buildingManager.address}`);
    
    // ===================================
    // 4. DEPLOY MARKETPLACE
    // ===================================
    console.log("🛒 Deploying Marketplace...");
    
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await upgrades.deployProxy(
      Marketplace,
      [
        characterNFT.address,
        luncToken.address,
        CONFIG.MARKETPLACE_FEE
      ],
      { initializer: 'initialize' }
    );
    await marketplace.deployed();
    
    deployedContracts.marketplace = marketplace.address;
    console.log(`   ✅ Marketplace deployed to: ${marketplace.address}`);
    
    // ===================================
    // 5. CONFIGURE CONTRACTS
    // ===================================
    console.log("⚙️ Configuring contracts...");
    
    // Set up roles and permissions
    const MINTER_ROLE = await characterNFT.MINTER_ROLE();
    const MANAGER_ROLE = await buildingManager.MANAGER_ROLE();
    
    // Grant necessary roles
    await characterNFT.grantRole(MINTER_ROLE, buildingManager.address);
    await characterNFT.grantRole(MINTER_ROLE, marketplace.address);
    await buildingManager.grantRole(MANAGER_ROLE, deployer.address);
    
    // Configure marketplace in character contract
    await characterNFT.setApprovalForAll(marketplace.address, true);
    
    // Transfer initial LUNC to building manager for rewards
    const rewardAmount = ethers.utils.parseUnits("100000000", 6); // 100M tokens
    await luncToken.transfer(buildingManager.address, rewardAmount);
    
    console.log(`   ✅ Contracts configured successfully`);
    
    // ===================================
    // 6. SAVE DEPLOYMENT INFO
    // ===================================
    const deploymentInfo = {
      network: {
        name: network.name,
        chainId: network.chainId
      },
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      config: CONFIG,
      transactionHashes: {
        luncToken: luncToken.deployTransaction.hash,
        characterNFT: characterNFT.deployTransaction.hash,
        buildingManager: buildingManager.deployTransaction.hash,
        marketplace: marketplace.deployTransaction.hash
      }
    };
    
    // Save to deployments directory
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = path.join(
      deploymentsDir,
      `${network.name}-${network.chainId}.json`
    );
    
    fs.writeFileSync(
      deploymentFile,
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    // ===================================
    // 7. GENERATE FRONTEND CONFIG
    // ===================================
    const frontendConfig = `// Auto-generated contract addresses for ${network.name}
export const CONTRACTS = {
  LUNC_TOKEN: "${deployedContracts.luncToken}",
  CHARACTER_NFT: "${deployedContracts.characterNFT}",
  BUILDING_MANAGER: "${deployedContracts.buildingManager}",
  MARKETPLACE: "${deployedContracts.marketplace}"
};

export const NETWORK_CONFIG = {
  CHAIN_ID: ${network.chainId},
  NETWORK_NAME: "${network.name}"
};
`;
    
    const configDir = path.join(__dirname, '..', 'src', 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(configDir, `contracts-${network.name}.js`),
      frontendConfig
    );
    
    // ===================================
    // 8. DEPLOYMENT SUMMARY
    // ===================================
    console.log();
    console.log("🎉 Deployment completed successfully!");
    console.log("=" + "=".repeat(60));
    console.log("📋 Contract Addresses:");
    console.log(`   💎 LUNC Token:        ${deployedContracts.luncToken}`);
    console.log(`   🎯 Character NFT:     ${deployedContracts.characterNFT}`);
    console.log(`   🏢 Building Manager:  ${deployedContracts.buildingManager}`);
    console.log(`   🛒 Marketplace:       ${deployedContracts.marketplace}`);
    console.log();
    console.log(`📁 Deployment info saved to: ${deploymentFile}`);
    console.log(`⚙️ Frontend config saved to: src/config/contracts-${network.name}.js`);
    console.log();
    console.log("🔍 Next steps:");
    console.log("   1. Verify contracts on block explorer");
    console.log("   2. Update .env with new contract addresses");
    console.log("   3. Test contract interactions");
    console.log("   4. Deploy frontend with new config");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    
    // Save failed deployment info
    const failedDeployment = {
      network: {
        name: network.name,
        chainId: network.chainId
      },
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      error: error.message,
      partialContracts: deployedContracts
    };
    
    const failedFile = path.join(
      __dirname,
      '..',
      'deployments',
      `failed-${network.name}-${Date.now()}.json`
    );
    
    fs.writeFileSync(
      failedFile,
      JSON.stringify(failedDeployment, null, 2)
    );
    
    console.log(`💾 Failed deployment info saved to: ${failedFile}`);
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

module.exports = main;