// ===================================
// ✅ CONTRACT VERIFICATION SCRIPT
// ===================================

const { run } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("✅ Virtual Building Empire - Contract Verification");
  console.log("=" + "=".repeat(60));
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  const deploymentFile = path.join(
    __dirname,
    '..',
    'deployments',
    `${network.name}-${network.chainId}.json`
  );
  
  // Load deployment info
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("   Please run deployment script first.");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const contracts = deployment.contracts;
  const config = deployment.config;
  
  console.log(`📋 Network: ${network.name} (${network.chainId})`);
  console.log(`📁 Using deployment: ${deploymentFile}`);
  console.log();
  
  try {
    // ===================================
    // 1. VERIFY LUNC TOKEN
    // ===================================
    console.log("💎 Verifying LUNC Token...");
    try {
      await run("verify:verify", {
        address: contracts.luncToken,
        constructorArguments: [
          config.LUNC_NAME,
          config.LUNC_SYMBOL,
          config.LUNC_INITIAL_SUPPLY
        ]
      });
      console.log(`   ✅ LUNC Token verified: ${contracts.luncToken}`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`   ℹ️ LUNC Token already verified: ${contracts.luncToken}`);
      } else {
        console.error(`   ❌ LUNC Token verification failed:`, error.message);
      }
    }
    
    // ===================================
    // 2. VERIFY CHARACTER NFT
    // ===================================
    console.log("🎯 Verifying Character NFT...");
    try {
      await run("verify:verify", {
        address: contracts.characterNFT,
        constructorArguments: []
      });
      console.log(`   ✅ Character NFT verified: ${contracts.characterNFT}`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`   ℹ️ Character NFT already verified: ${contracts.characterNFT}`);
      } else {
        console.error(`   ❌ Character NFT verification failed:`, error.message);
      }
    }
    
    // ===================================
    // 3. VERIFY BUILDING MANAGER
    // ===================================
    console.log("🏢 Verifying Building Manager...");
    try {
      await run("verify:verify", {
        address: contracts.buildingManager,
        constructorArguments: []
      });
      console.log(`   ✅ Building Manager verified: ${contracts.buildingManager}`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`   ℹ️ Building Manager already verified: ${contracts.buildingManager}`);
      } else {
        console.error(`   ❌ Building Manager verification failed:`, error.message);
      }
    }
    
    // ===================================
    // 4. VERIFY MARKETPLACE
    // ===================================
    console.log("🛒 Verifying Marketplace...");
    try {
      await run("verify:verify", {
        address: contracts.marketplace,
        constructorArguments: []
      });
      console.log(`   ✅ Marketplace verified: ${contracts.marketplace}`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`   ℹ️ Marketplace already verified: ${contracts.marketplace}`);
      } else {
        console.error(`   ❌ Marketplace verification failed:`, error.message);
      }
    }
    
    console.log();
    console.log("🎉 Verification process completed!");
    console.log();
    console.log("🔍 Block Explorer Links:");
    
    // Generate block explorer links based on network
    const explorerBaseUrl = getExplorerUrl(network.chainId);
    if (explorerBaseUrl) {
      console.log(`   💎 LUNC Token:      ${explorerBaseUrl}/address/${contracts.luncToken}`);
      console.log(`   🎯 Character NFT:   ${explorerBaseUrl}/address/${contracts.characterNFT}`);
      console.log(`   🏢 Building Manager: ${explorerBaseUrl}/address/${contracts.buildingManager}`);
      console.log(`   🛒 Marketplace:     ${explorerBaseUrl}/address/${contracts.marketplace}`);
    }
    
  } catch (error) {
    console.error("❌ Verification process failed:", error);
    process.exit(1);
  }
}

function getExplorerUrl(chainId) {
  const explorers = {
    1: "https://etherscan.io",          // Ethereum Mainnet
    5: "https://goerli.etherscan.io",   // Goerli Testnet
    137: "https://polygonscan.com",     // Polygon Mainnet
    80001: "https://mumbai.polygonscan.com", // Mumbai Testnet
    56: "https://bscscan.com",          // BSC Mainnet
    97: "https://testnet.bscscan.com"   // BSC Testnet
  };
  
  return explorers[chainId] || null;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;