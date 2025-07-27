#!/bin/bash

# ===================================
# 🧹 TYPESCRIPT MIGRATION CLEANUP SCRIPT
# ===================================
# 
# This script removes old JavaScript files that have been
# successfully migrated to TypeScript in Virtual Building Empire
#
# Run this script from the project root directory
# Usage: chmod +x scripts/cleanup-old-js-files.sh && ./scripts/cleanup-old-js-files.sh
#

set -e  # Exit on any error

echo ""
echo "🏢 Virtual Building Empire - TypeScript Migration Cleanup"
echo "============================================================"
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if TypeScript files exist before cleanup
echo "🔍 Verifying TypeScript files exist..."

required_ts_files=(
    "src/index.tsx"
    "src/App.tsx"
    "src/components/ErrorBoundary.tsx"
    "src/components/Homepage.tsx"
    "src/components/FamilyManagement.tsx"
    "src/components/BuildingOverview.tsx"
    "src/components/JobAssignment.tsx"
    "src/components/Marketplace.tsx"
    "src/components/CharacterMinting.tsx"
    "src/components/WalletConnection.tsx"
    "src/components/LuncWallet.tsx"
    "src/components/LoadingSpinner.tsx"
    "src/hooks/useLocalStorage.ts"
    "src/hooks/useGameNotifications.ts"
    "src/hooks/useWeb3Connection.ts"
    "src/utils/gameHelpers.ts"
)

for file in "${required_ts_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Required TypeScript file missing: $file"
        echo "Please ensure the TypeScript migration is complete before running cleanup."
        exit 1
    fi
done

echo "✅ All required TypeScript files found!"
echo ""

# Count files to be removed
old_js_files=(
    "src/App.js"
    "src/index.js"
    "src/components/BuildingOverview.js"
    "src/components/CharacterMinting.js"
    "src/components/Dashboard.js"
    "src/components/ErrorBoundary.js"
    "src/components/FamilyManagement.js"
    "src/components/Homepage.js"
    "src/components/JobAssignment.js"
    "src/components/LoadingSpinner.js"
    "src/components/LuncWallet.js"
    "src/components/Marketplace.js"
    "src/components/WalletConnection.js"
    "src/hooks/useGameNotifications.js"
    "src/hooks/useLocalStorage.js"
    "src/hooks/useWeb3Connection.js"
    "src/utils/gameHelpers.js"
)

files_found=0
for file in "${old_js_files[@]}"; do
    if [ -f "$file" ]; then
        ((files_found++))
    fi
done

if [ $files_found -eq 0 ]; then
    echo "✅ No old JavaScript files found - cleanup already complete!"
    echo "🎉 Virtual Building Empire is already 100% TypeScript!"
    exit 0
fi

echo "🗑️ Found $files_found old JavaScript files to remove"
echo ""

# Ask for confirmation
read -p "❗ Are you sure you want to remove all old JavaScript files? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled by user"
    exit 0
fi

echo ""
echo "🧹 Starting cleanup process..."
echo ""

# Remove old JavaScript files
removed_count=0
for file in "${old_js_files[@]}"; do
    if [ -f "$file" ]; then
        echo "🗑️ Removing: $file"
        rm -f "$file"
        ((removed_count++))
    fi
done

echo ""
echo "✅ Cleanup complete!"
echo "📋 $removed_count old JavaScript files removed"
echo ""

# Verify TypeScript compilation
echo "🔍 Verifying TypeScript compilation..."
if command -v npm &> /dev/null; then
    if npm run type-check > /dev/null 2>&1; then
        echo "✅ TypeScript compilation successful!"
    else
        echo "⚠️ Warning: TypeScript compilation has errors. Please check with 'npm run type-check'"
    fi
else
    echo "⚠️ Could not verify TypeScript compilation (npm not found)"
fi

echo ""
echo "🎉 SUCCESS: Virtual Building Empire is now 100% TypeScript!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run type-check' to verify no type errors"
echo "2. Run 'npm run build' to test production build"
echo "3. Run 'npm start' to test the application"
echo "4. Commit these changes to git"
echo ""
echo "🚀 Happy coding with TypeScript!"
echo ""