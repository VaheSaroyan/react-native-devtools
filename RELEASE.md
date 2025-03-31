# Releasing React Native DevTools

This document outlines the process for creating a new release of React Native DevTools.

## Release Process

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

   - Build the app for macOS, Windows, and Linux
   - Create a draft release with all the built installers
   - Add the release notes

5. Go to the GitHub Releases page, review the draft release, add any additional notes, and publish it.

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
