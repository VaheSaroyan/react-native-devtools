# Development Guide

This guide explains how to build and release the React Native DevTools application.

## Prerequisites

- Node.js 18+
- pnpm
- Apple Developer Account
- Xcode (for macOS builds)

## Local Development Setup

1. Clone the repository:

```bash
git clone https://github.com/lovesworking/rn-better-dev-tools.git
cd rn-better-dev-tools
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy environment template:

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

- `APPLE_ID`: Your Apple Developer email
- `APPLE_PASSWORD`: App-specific password (generate at https://appleid.apple.com/account/manage)
- `APPLE_TEAM_ID`: Your Apple Developer Team ID
- `DEBUG`: Leave as is for build debugging

## Building

### Local Development Build

```bash
pnpm start
```

### Production Build

```bash
pnpm run make:desktop
```

This will:

1. Build the application
2. Code sign it
3. Create a zip file
4. Copy the release to `~/Desktop/rn-dev-tools-releases`

### GitHub Release

```bash
pnpm run release
```

This will:

1. Build the application
2. Create a new GitHub release
3. Upload the build artifacts

## Code Signing

The application is signed using your Apple Developer certificate. The certificate fingerprint is configured in `forge.config.ts`.

## Important Files

- `forge.config.ts`: Electron Forge configuration
- `package.json`: Project configuration and scripts
- `.env`: Local environment variables (do not commit)
- `copy-to-desktop.sh`: Script to copy builds to desktop

## Release Process

1. Update version in `package.json`
2. Commit changes
3. Run `pnpm run release`
4. The GitHub Action will build and publish the release

## Troubleshooting

If the build fails:

1. Check the DEBUG logs in the console
2. Verify your Apple Developer credentials
3. Ensure your certificates are valid
4. Clear the build cache: `pnpm run nuke`
