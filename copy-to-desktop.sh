#!/bin/bash

# Get the version from package.json
VERSION=$(node -p "require('./package.json').version")

# Create desktop directory if it doesn't exist
DESKTOP_DIR="$HOME/Desktop/rn-dev-tools-releases"
mkdir -p "$DESKTOP_DIR"

# Copy the zip file to desktop
cp "out/make/zip/darwin/arm64/React Native DevTools-darwin-arm64-$VERSION.zip" "$DESKTOP_DIR/"

echo "✅ Release copied to $DESKTOP_DIR" 