# Development Guide

This guide covers everything you need to know about developing React Native DevTools.

## 🛠 Prerequisites

- Node.js 20 or later
- pnpm 10.4.1 or later
- macOS for building and signing
- Apple Developer account for signing
- GitHub CLI (`gh`) for releases

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/LovesWorking/rn-better-dev-tools.git
   cd rn-better-dev-tools
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Fill in your Apple Developer credentials in `.env`:
   ```
   APPLE_ID=your.email@example.com
   APPLE_PASSWORD=app-specific-password
   APPLE_TEAM_ID=your-team-id
   ```

## 🏗 Building

### Development Build

```bash
# Start in development mode with hot reload
pnpm start

# Build and copy to desktop for testing
pnpm run make:desktop

# Build only
pnpm run make
```

### Release Build

We provide an automated release script that:

- Bumps version (minor)
- Builds locally to verify
- Commits changes
- Creates and pushes tag
- Monitors GitHub Action progress

```bash
# Using npm script
pnpm run auto-release

# Or directly
./auto-release.sh
```

## 🐛 Debugging

### Enable Debug Logs

Add to your `.env`:

```bash
DEBUG=electron-osx-sign*
```

### Common Issues

1. **Build Hanging on "Finalizing package"**

   - Check Apple Developer credentials
   - Verify keychain access
   - Run with debug logs enabled

2. **Permission Issues**

   ```bash
   # Fix directory permissions
   sudo chown -R $(whoami) .

   # Clean build artifacts
   rm -rf .vite out
   ```

3. **Certificate Issues**
   - Verify Apple Developer membership is active
   - Check Team ID matches in `.env`
   - Ensure app-specific password is correct

### Development Commands

```bash
# Clean install
pnpm run nuke

# Package without making distributables
pnpm run package

# Run linter
pnpm run lint
```

## 📦 Project Structure

```
.
├── src/                  # Source code
│   ├── main.ts          # Main process
│   ├── preload.ts       # Preload scripts
│   └── components/      # React components
├── assets/              # Static assets
├── .github/workflows/   # GitHub Actions
└── forge.config.ts      # Electron Forge config
```

## 🔄 Release Process

### Automatic Release

```bash
./auto-release.sh
```

### Manual Release Steps

1. Update version in `package.json`
2. Build and test locally
3. Create and push tag
4. GitHub Action will build and publish

## 🧪 Testing

Before submitting a PR:

1. Test in development mode (`pnpm start`)
2. Build and test locally (`pnpm run make:desktop`)
3. Verify all features work
4. Check console for errors
5. Run linter (`pnpm run lint`)
