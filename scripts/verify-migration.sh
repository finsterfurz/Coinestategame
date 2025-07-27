#!/bin/bash

# ===================================
# 🔍 TYPESCRIPT MIGRATION VERIFICATION SCRIPT
# ===================================
# 
# This script verifies that the TypeScript migration was successful
# and all systems are working correctly
#

set -e

echo ""
echo "🔍 Virtual Building Empire - TypeScript Migration Verification"
echo "================================================================"
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check Node.js and npm versions
echo "🔧 Checking environment..."
node_version=$(node --version)
npm_version=$(npm --version)
echo "✅ Node.js: $node_version"
echo "✅ npm: $npm_version"
echo ""

# Check TypeScript installation
if command -v npx &> /dev/null && npx tsc --version &> /dev/null; then
    ts_version=$(npx tsc --version)
    echo "✅ TypeScript: $ts_version"
else
    echo "❌ TypeScript not found - installing..."
    npm install typescript
fi
echo ""

# Verify all TypeScript files exist
echo "📋 Verifying TypeScript files..."

required_files=(
    "src/index.tsx:Entry point"
    "src/App.tsx:Main component"
    "src/components/ErrorBoundary.tsx:Error handling"
    "src/components/Homepage.tsx:Landing page"
    "src/components/FamilyManagement.tsx:Character management"
    "src/components/BuildingOverview.tsx:Building visualization"
    "src/components/JobAssignment.tsx:Job system"
    "src/components/Marketplace.tsx:Trading system"
    "src/components/CharacterMinting.tsx:NFT minting"
    "src/components/WalletConnection.tsx:Web3 integration"
    "src/components/LuncWallet.tsx:Token management"
    "src/components/LoadingSpinner.tsx:UI component"
    "src/hooks/useLocalStorage.ts:Storage hook"
    "src/hooks/useGameNotifications.ts:Notification system"
    "src/hooks/useWeb3Connection.ts:Web3 hook"
    "src/utils/gameHelpers.ts:Game utilities"
    "src/types/index.ts:Type definitions"
    "tsconfig.json:TypeScript config"
)

all_files_exist=true
for item in "${required_files[@]}"; do
    file=$(echo $item | cut -d':' -f1)
    description=$(echo $item | cut -d':' -f2)
    
    if [ -f "$file" ]; then
        echo "✅ $file ($description)"
    else
        echo "❌ $file ($description) - MISSING!"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo ""
    echo "❌ Migration verification failed - missing required files"
    exit 1
fi

echo ""
echo "✅ All required TypeScript files found!"
echo ""

# Check for old JavaScript files
echo "🔍 Checking for old JavaScript files..."

old_js_files=(
    "src/App.js"
    "src/index.js"
    "src/components/BuildingOverview.js"
    "src/components/CharacterMinting.js"
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

old_files_found=0
for file in "${old_js_files[@]}"; do
    if [ -f "$file" ]; then
        echo "⚠️ Old file still exists: $file"
        ((old_files_found++))
    fi
done

if [ $old_files_found -gt 0 ]; then
    echo ""
    echo "⚠️ Found $old_files_found old JavaScript files"
    echo "Run './scripts/cleanup-old-js-files.sh' to clean them up"
else
    echo "✅ No old JavaScript files found - cleanup complete!"
fi
echo ""

# Type checking
echo "🔍 Running TypeScript type check..."
if npm run type-check; then
    echo "✅ TypeScript type checking passed!"
else
    echo "❌ TypeScript type checking failed!"
    echo "Please fix type errors before proceeding"
    exit 1
fi
echo ""

# Test build
echo "🔧 Testing production build..."
if npm run build; then
    echo "✅ Production build successful!"
    echo "📁 Build output created in ./build/"
else
    echo "❌ Production build failed!"
    echo "Please fix build errors before deploying"
    exit 1
fi
echo ""

# Calculate TypeScript coverage
echo "📊 Calculating TypeScript coverage..."
ts_files=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
js_files=$(find src -name "*.js" -o -name "*.jsx" | wc -l)
total_files=$((ts_files + js_files))

if [ $total_files -eq 0 ]; then
    coverage=0
else
    coverage=$((ts_files * 100 / total_files))
fi

echo "📋 TypeScript files: $ts_files"
echo "📋 JavaScript files: $js_files"
echo "📋 Total coverage: $coverage%"
echo ""

# Final verification
if [ $coverage -eq 100 ] && [ $old_files_found -eq 0 ]; then
    echo "🎉 MIGRATION COMPLETE: 100% TypeScript coverage achieved!"
    echo ""
    echo "✅ All checks passed:"
    echo "   • All TypeScript files present"
    echo "   • No old JavaScript files remaining"
    echo "   • Type checking successful"
    echo "   • Production build working"
    echo "   • 100% TypeScript coverage"
    echo ""
    echo "🚀 Virtual Building Empire is ready for production!"
else
    echo "⚠️ Migration verification completed with warnings:"
    if [ $coverage -lt 100 ]; then
        echo "   • TypeScript coverage: $coverage% (target: 100%)"
    fi
    if [ $old_files_found -gt 0 ]; then
        echo "   • $old_files_found old JavaScript files still present"
    fi
    echo ""
    echo "Please address the warnings above for optimal results."
fi

echo ""
echo "📈 Migration Statistics:"
echo "   • TypeScript Files: $ts_files"
echo "   • Coverage: $coverage%"
echo "   • Type Errors: 0"
echo "   • Build Status: Passing"
echo ""
echo "📝 Next steps:"
echo "   1. Review any warnings above"
echo "   2. Test the application manually"
echo "   3. Deploy to production"
echo "   4. Set up automated type checking in CI/CD"
echo ""
echo "Happy coding with TypeScript! 🎉"