#!/usr/bin/env node

/**
 * Cleanup script to remove duplicate JavaScript files after TypeScript migration
 * This script removes all old .js files that have been migrated to .tsx/.ts
 */

const fs = require('fs');
const path = require('path');

const duplicateFiles = [
  // Root source files
  'src/App.js',
  'src/index.js',
  
  // Component files
  'src/components/BuildingOverview.js',
  'src/components/CharacterMinting.js',
  'src/components/ErrorBoundary.js',
  'src/components/FamilyManagement.js',
  'src/components/Homepage.js',
  'src/components/JobAssignment.js',
  'src/components/LoadingSpinner.js',
  'src/components/LuncWallet.js',
  'src/components/Marketplace.js',
  'src/components/WalletConnection.js',
  
  // Dashboard.js - check if it has a TypeScript equivalent
  'src/components/Dashboard.js'
];

console.log('🧹 Starting cleanup of duplicate JavaScript files...\n');

let removedCount = 0;
let skippedCount = 0;

duplicateFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Removed: ${filePath}`);
      removedCount++;
    } catch (error) {
      console.error(`❌ Error removing ${filePath}:`, error.message);
    }
  } else {
    console.log(`⏭️  Skipped: ${filePath} (not found)`);
    skippedCount++;
  }
});

console.log(`\n🎉 Cleanup complete!`);
console.log(`📊 Files removed: ${removedCount}`);
console.log(`📊 Files skipped: ${skippedCount}`);
console.log(`\n💡 Next steps:`);
console.log(`   - Run 'npm run build' to ensure everything works`);
console.log(`   - Run 'npm run type-check' to verify TypeScript compilation`);
console.log(`   - Commit these changes to complete the cleanup`);
