#!/bin/bash

# Set error handling
set -e

# Colors for better logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function for logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    error "Must be run from project root directory"
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
log "Current version: $CURRENT_VERSION"

# Calculate new version (minor bump)
NEW_VERSION=$(node -p "
    const [major, minor, patch] = '$CURRENT_VERSION'.split('.');
    \`\${major}.\${parseInt(minor) + 1}.0\`
")
log "New version will be: $NEW_VERSION"

# Update version in package.json
log "Updating package.json version..."
npm version $NEW_VERSION --no-git-tag-version

# Build locally first to ensure everything works
log "Building locally to verify..."
pnpm run make:desktop || error "Local build failed"
success "Local build successful!"

# Stage all changes
log "Staging changes..."
git add . || error "Failed to stage changes"

# Commit with conventional commit message
log "Committing changes..."
git commit -m "chore: release v$NEW_VERSION" || error "Failed to commit changes"

# Create and push tag
log "Creating tag v$NEW_VERSION..."
git tag -d "v$NEW_VERSION" 2>/dev/null || true
git push origin ":refs/tags/v$NEW_VERSION" 2>/dev/null || true
git tag "v$NEW_VERSION" || error "Failed to create tag"

# Push changes and tags
log "Pushing changes and tags..."
git push && git push --tags || error "Failed to push changes"
success "Changes pushed successfully!"

# Wait for GitHub Action to start
log "Waiting for GitHub Action to start..."
sleep 5

# Monitor GitHub Action progress
MAX_ATTEMPTS=30
ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    STATUS=$(gh run list --json status,name --jq '.[0].status' 2>/dev/null || echo "unknown")
    if [ "$STATUS" = "completed" ]; then
        success "GitHub Action completed successfully!"
        break
    elif [ "$STATUS" = "failed" ]; then
        error "GitHub Action failed. Check the logs with: gh run view"
    fi
    log "Build still in progress... (Attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 10
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    warning "Timed out waiting for GitHub Action to complete. Check status manually with: gh run view"
fi

success "Release process completed!"
log "New version v$NEW_VERSION is being published"
log "You can check the release status at: https://github.com/LovesWorking/rn-better-dev-tools/releases" 