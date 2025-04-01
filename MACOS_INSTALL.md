# Installing React Native DevTools on macOS

This guide will walk you through the process of installing and running React Native DevTools on your Mac.

## System Requirements

- macOS 11.0 (Big Sur) or later
- Apple Silicon (M1/M2/M3) or Intel Mac

## Download and Installation

1. **Download the latest release**:

   - Go to the [Releases page](https://github.com/lovesworking/rn-better-dev-tools/releases)
   - Download the `.zip` file (e.g., `React Native DevTools-darwin-arm64-1.0.16.zip` for Apple Silicon Macs)

2. **Extract the ZIP file**:

   - Double-click the downloaded ZIP file to extract it
   - This will create a `React Native DevTools.app` file

3. **Move to Applications folder**:

   - Drag the `React Native DevTools.app` to your Applications folder
   - This is optional but recommended for easy access

4. **First launch**:
   - Since the app is from an unidentified developer, macOS may block it on first launch
   - Right-click (or Control-click) on the app icon
   - Select "Open" from the context menu
   - Click "Open" in the dialog box that appears
   - After this initial step, you can open the app normally

## Automatic Updates

React Native DevTools includes an auto-update feature:

- The app will automatically check for updates when running
- When a new version is available, it will be downloaded in the background
- The update will be installed the next time you restart the app
- No manual re-installation is required

## Troubleshooting

### "App is damaged and can't be opened" Error

If you see a message saying the app is damaged:

1. Open Terminal (Applications > Utilities > Terminal)
2. Run the following command:
   ```bash
   xattr -cr "/Applications/React Native DevTools.app"
   ```
3. Try opening the app again

### "App can't be opened because Apple cannot check it for malicious software" Error

1. Go to System Preferences (or System Settings) > Security & Privacy
2. Look for the message about React Native DevTools being blocked
3. Click "Open Anyway"
4. Follow the prompts to open the app

### Auto-Update Issues

If the app isn't automatically updating:

1. Check your internet connection
2. Ensure the app has permissions to access the internet in your firewall settings
3. Manually download the latest version from the Releases page

## Uninstalling

To uninstall React Native DevTools:

1. Drag the app from your Applications folder to the Trash
2. Empty the Trash

## Getting Started

After installing and launching React Native DevTools:

1. The app will start a local server on port 42831
2. Configure your React Native app to connect to this server (see README.md for integration instructions)
3. Start your React Native app with the DevTools connection enabled

## Need Help?

If you encounter any issues, please:

1. Check the [GitHub Issues](https://github.com/lovesworking/rn-better-dev-tools/issues) for known problems
2. Create a new issue with details about your problem if it hasn't been reported yet
