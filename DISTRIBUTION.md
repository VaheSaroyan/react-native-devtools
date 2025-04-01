# Distribution Guide for React Native DevTools

This document explains how to build, package, and distribute the React Native DevTools application.

## Building and Packaging

### Automated Build Script

Use the included build script to automatically build, package, and copy the application to your desktop:

```bash
# Run the build script
./build-and-pack.sh
```

This script will:

1. Build the application using Electron Forge
2. Package it as a ZIP file
3. Copy the ZIP file to the folder `~/Desktop/release rn better tools`
4. Create a timestamped version for archiving purposes

### Manual Building

If you prefer to build manually:

```bash
# Clean any previous builds
rm -rf out/

# Build and package the app
npx electron-forge make --targets=@electron-forge/maker-zip

# The packaged ZIP file will be in:
# out/make/zip/darwin/arm64/React Native DevTools-darwin-arm64-[version].zip
```

## Distribution

Since this is an open source application distributed without an Apple Developer account, users will need to follow special steps to open it:

### For Users: Installation Instructions

Include these instructions in your release notes:

```markdown
## Installation Instructions for macOS

1. Download the ZIP file
2. Extract the ZIP file
3. Move the extracted app to your Applications folder (optional but recommended)
4. When you first try to open the app, macOS will show a security warning
5. Instead of double-clicking, right-click (or Control-click) on the app and select "Open"
6. Click "Open" in the dialog that appears
7. The app will now open, and macOS will remember your choice for future launches

Note: This warning appears because the app is not signed with an Apple Developer certificate. This is a free, open source application, and I've chosen not to pay for Apple's developer program.
```
