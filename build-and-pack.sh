#!/bin/bash

# Exit on any error
set -e

# Display what's happening
echo "🚀 Building and packaging React Native DevTools..."

# Variables
VERSION=$(node -e "console.log(require('./package.json').version)")
OUTPUT_DIR="$HOME/Desktop/release rn better tools"
APP_NAME="React Native DevTools"

# Ensure the output directory exists
mkdir -p "$OUTPUT_DIR"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out/

# Check if GITHUB_TOKEN is set
if [ -n "$GITHUB_TOKEN" ]; then
  # If GITHUB_TOKEN is set, publish to GitHub
  echo "🌐 Publishing to GitHub..."
  npx electron-forge publish
else
  # If GITHUB_TOKEN is not set, just build locally
  echo "🔨 Building application locally..."
  npx electron-forge make --targets=@electron-forge/maker-zip

  # Copy the output to the destination folder
  echo "📦 Copying packaged app to destination folder..."
  cp "out/make/zip/darwin/arm64/$APP_NAME-darwin-arm64-$VERSION.zip" "$OUTPUT_DIR/"

  # Create a dated copy for versioning/archiving purposes
  DATED_FILENAME="$APP_NAME-darwin-arm64-$VERSION-$(date +%Y%m%d%H%M).zip"
  cp "out/make/zip/darwin/arm64/$APP_NAME-darwin-arm64-$VERSION.zip" "$OUTPUT_DIR/$DATED_FILENAME"

  echo "✅ Build and packaging complete!"
  echo "📝 Files created:"
  echo "   - $OUTPUT_DIR/$APP_NAME-darwin-arm64-$VERSION.zip"
  echo "   - $OUTPUT_DIR/$DATED_FILENAME"
  echo ""
  echo "🖥️  Open folder using: open \"$OUTPUT_DIR\""
  echo ""
  echo "⚠️  Note: To publish to GitHub, set the GITHUB_TOKEN environment variable and run this script again."
fi 