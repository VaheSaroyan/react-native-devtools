#!/bin/bash

# Exit on error
set -e

echo "=== Building React Native DevTools for macOS ==="

# Clean previous builds
rm -rf out || true
echo "✅ Cleaned previous builds"

# Install dependencies
pnpm install
echo "✅ Dependencies installed"

# Build package
echo "🔨 Building macOS package..."
pnpm run make

# Check if ZIP was created
ZIP_PATH=$(find out/make -name "*.zip" | head -n 1)

if [ -f "$ZIP_PATH" ]; then
    echo "✅ ZIP package created at: $ZIP_PATH"
    echo "✅ Total size: $(du -h "$ZIP_PATH" | cut -f1)"
    
    echo ""
    echo "To run the app:"
    echo "1. Extract the ZIP file"
    echo "2. Move the app to your Applications folder"
    echo "3. Open the app (you may need to right-click and select Open for the first time)"
    
    echo ""
    echo "To release:"
    echo "1. Update version in package.json"
    echo "2. Commit changes"
    echo "3. Create and push tag: git tag -a v1.0.0 -m 'v1.0.0' && git push origin v1.0.0"
    
    echo ""
    echo "Build complete! 🎉"
else
    echo "❌ ZIP package was not created. Check for errors above."
    exit 1
fi 