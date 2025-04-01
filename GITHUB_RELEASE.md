# GitHub Release Process

This guide explains how to release updates to GitHub and enable auto-updating for React Native DevTools.

## Automated Release Process

The recommended way to create a new release is to use the automated script:

1. Make sure your changes are committed to the main branch
2. Run the release script:
   ```bash
   pnpm run release
   # or directly with
   ./release-version.sh
   ```
3. Follow the interactive prompts to:
   - Select the version bump type (patch, minor, major, or custom)
   - Enter release notes
   - Confirm the release
4. The script will:
   - Update the version in package.json
   - Commit and push the changes
   - Create and push a git tag
   - Monitor the GitHub Actions workflow
   - Automatically publish the release when complete

## Manual Releases

If you need to manually publish a release:

1. Ensure you have a GitHub access token with "repo" permissions
2. Set the token as an environment variable:
   ```bash
   export GITHUB_TOKEN=your_github_token
   ```
3. Run the pack script:
   ```bash
   pnpm run pack
   # or directly with
   ./build-and-pack.sh
   ```

## GitHub Actions Automated Releases

For automated releases using GitHub Actions:

1. Create a new tag following semantic versioning:

   ```bash
   git tag v1.x.x
   git push origin v1.x.x
   ```

2. The GitHub Actions workflow will automatically build and release the app
3. The release will initially be created as a draft
4. Review the release and publish it when ready

## Auto-Updates

The app is configured to automatically check for updates when running. When a new version is released on GitHub:

1. Users with the previous version will automatically receive update notifications
2. Updates are downloaded in the background
3. The update will be installed when the user restarts the app

## Configuration Files

The auto-update system is configured in several files:

- `forge.config.ts`: Contains the GitHub publisher configuration
- `package.json`: Contains the electron-builder configuration
- `src/auto-updater.ts`: Implements the auto-update checking logic
- `.github/workflows/build.yml`: Defines the GitHub Actions workflow for automated builds

## Troubleshooting

- If the auto-updater isn't working, check the log file at:
  - macOS: `~/Library/Logs/react-native-devtools/main.log`
- Make sure your repository is public, or if it's private, ensure users have proper access tokens configured

- To debug update issues, run the app with the `DEBUG` environment variable:
  ```bash
  DEBUG=electron-updater npm start
  ```

## Version Updates

The automated release script handles version updates for you, but if you need to do it manually:

1. Update the version in `package.json`
2. Commit the changes
3. Create a new tag matching the version number
4. Push the tag to GitHub

The version format should follow semantic versioning: `MAJOR.MINOR.PATCH`
