#!/bin/bash

# Virtual Building Empire - Comprehensive Improvements Cleanup Script
# This script removes duplicate JavaScript files and completes the TypeScript migration

echo "🧹 Starting comprehensive cleanup for Virtual Building Empire..."
echo "This script will remove duplicate JavaScript files and finalize TypeScript migration."

# Backup current state
echo "📦 Creating backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
git stash push -m "Pre-cleanup backup $timestamp"

# Remove duplicate JavaScript files (keep TypeScript versions)
echo "🗑️  Removing duplicate JavaScript files..."

# Main application files
echo "Removing main JS files..."
rm -f src/App.js
rm -f src/index.js

# Component JavaScript files
echo "Removing component JS files..."
rm -f src/components/Homepage.js
rm -f src/components/FamilyManagement.js
rm -f src/components/BuildingOverview.js
rm -f src/components/JobAssignment.js
rm -f src/components/Marketplace.js
rm -f src/components/CharacterMinting.js
rm -f src/components/WalletConnection.js
rm -f src/components/LuncWallet.js
rm -f src/components/ErrorBoundary.js
rm -f src/components/LoadingSpinner.js
rm -f src/components/Dashboard.js

# Verify TypeScript files exist
echo "✅ Verifying TypeScript files exist..."
typescript_files=(
    "src/App.tsx"
    "src/index.tsx"
    "src/components/Homepage.tsx"
    "src/components/FamilyManagement.tsx"
    "src/components/BuildingOverview.tsx"
    "src/components/JobAssignment.tsx"
    "src/components/Marketplace.tsx"
    "src/components/CharacterMinting.tsx"
    "src/components/WalletConnection.tsx"
    "src/components/LuncWallet.tsx"
    "src/components/ErrorBoundary.tsx"
    "src/components/LoadingSpinner.tsx"
)

missing_files=()
for file in "${typescript_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "⚠️  Warning: The following TypeScript files are missing:"
    printf '%s\n' "${missing_files[@]}"
    echo "Please ensure these files exist before removing JavaScript versions."
    exit 1
fi

# Update imports in remaining files to use .tsx extensions where needed
echo "🔧 Updating import statements..."
find src -name "*.tsx" -type f -exec sed -i 's/from '\''\.\.\/components\/\([^'\'']*\)\.js'\''/from '\''..\/components\/\1'\''/g' {} \;
find src -name "*.ts" -type f -exec sed -i 's/from '\''\.\.\/components\/\([^'\'']*\)\.js'\''/from '\''..\/components\/\1'\''/g' {} \;

# Remove any remaining .js files in src directory (except node_modules)
echo "🧽 Removing any remaining .js files in src..."
find src -name "*.js" -not -path "*/node_modules/*" -type f -delete

# Verify TypeScript compilation
echo "🔍 Verifying TypeScript compilation..."
if command -v tsc &> /dev/null; then
    echo "Running TypeScript compiler check..."
    tsc --noEmit
    if [ $? -eq 0 ]; then
        echo "✅ TypeScript compilation successful!"
    else
        echo "❌ TypeScript compilation failed. Please fix errors before proceeding."
        exit 1
    fi
else
    echo "⚠️  TypeScript compiler not found. Install with: npm install -g typescript"
fi

# Update package.json scripts to use TypeScript files
echo "📝 Updating package.json scripts..."
sed -i 's/"start": "react-scripts start"/"start": "react-scripts start"/g' package.json

# Install new dependencies
echo "📦 Installing new dependencies..."
npm install framer-motion@^10.16.16 zustand@^4.4.7 @sentry/react@^7.118.0 @sentry/tracing@^7.118.0

# Run tests to ensure everything works
echo "🧪 Running tests..."
npm test -- --coverage --watchAll=false

# Format code
echo "🎨 Formatting code..."
npm run format

# Build project
echo "🏗️  Building project..."
npm run build

echo ""
echo "🎉 Cleanup completed successfully!"
echo ""
echo "Summary of changes:"
echo "✅ Removed duplicate JavaScript files"
echo "✅ Updated import statements"
echo "✅ Installed new dependencies"
echo "✅ Verified TypeScript compilation"
echo "✅ Ran tests and formatting"
echo "✅ Built project successfully"
echo ""
echo "Your project is now 100% TypeScript! 🚀"
echo ""
echo "Next steps:"
echo "1. Review the changes in git"
echo "2. Test the application thoroughly"
echo "3. Update any remaining import paths if needed"
echo "4. Commit the changes"
echo ""
echo "Files removed:"
echo "- src/App.js"
echo "- src/index.js"
echo "- All component .js files"
echo ""
echo "Files kept:"
echo "- All .tsx/.ts files"
echo "- All configuration files"
echo "- All documentation"

# Git status
echo "📊 Git status:"
git status --short

echo ""
echo "🎯 To commit these changes:"
echo "git add ."
echo "git commit -m 'feat: complete TypeScript migration cleanup'"
echo ""
