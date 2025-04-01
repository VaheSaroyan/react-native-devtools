# Releasing React Native DevTools

This document outlines the process for creating a new release of React Native DevTools.

## Automated Release Process (Recommended)

The easiest way to create a new release is to use our automated script:

```bash
pnpm run release
```

This interactive script will:

1. Prompt you to select a version bump type (patch, minor, major, or custom)
2. Update the version in package.json
3. Ask for release notes
4. Commit and push the changes
5. Create and push a git tag
6. Monitor the GitHub Actions workflow
7. Automatically publish the release when complete

## Manual Release Process

If you need to perform the release manually, follow these steps:

1. Update the version in `package.json`:

```json
{
  "version": "x.y.z",
  ...
}
```

2. Commit your changes:

```bash
git add package.json
git commit -m "Bump version to x.y.z"
```

3. Create and push a new tag:

```bash
git tag -a vx.y.z -m "Version x.y.z"
git push origin vx.y.z
```

4. The GitHub Actions workflow will automatically:

   - Build the app for macOS
   - Create a draft release with all the built installers
   - Add the release notes

5. Go to the GitHub Releases page, review the draft release, add any additional notes, and publish it.

## Local Build and Package

If you want to build the app locally without publishing:

```bash
pnpm run pack
```

This will:

- Build the app
- Create installation packages
- Copy them to your Desktop in a "release rn better tools" folder

## Testing Before Release

Before creating a new release tag, make sure to:

1. Test the app thoroughly on your local machine
2. Run `pnpm run make` locally to ensure the build process completes without errors
3. Test the generated installers

## Troubleshooting

If the GitHub Actions build fails:

1. Check the workflow logs for errors
2. Make sure the repository has the necessary secrets and permissions set up
3. Try running the build locally to isolate the issue

## Auto-Update Feature

The app includes auto-update functionality. When a new release is published:

1. Existing users will be automatically notified of the update
2. The update will be downloaded in the background
3. The update will be installed when the user restarts the app

See GITHUB_RELEASE.md for more details on the auto-update configuration.
