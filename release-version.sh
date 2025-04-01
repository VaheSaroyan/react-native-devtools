#!/bin/bash

# Exit on any error
set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display status messages
function echo_status() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to display success messages
function echo_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to display error messages
function echo_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Function to display warning messages
function echo_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo_error "GitHub CLI (gh) is not installed. Please install it first."
  echo "You can install it with: brew install gh"
  exit 1
fi

# Check if gh is authenticated
if ! gh auth status &> /dev/null; then
  echo_error "You're not authenticated with GitHub CLI."
  echo "Please run: gh auth login"
  exit 1
fi

# Ensure we're on the main branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo_warning "You are not on the main branch. Switching to main..."
  git checkout main
fi

# Make sure the working directory is clean
if ! git diff-index --quiet HEAD --; then
  echo_error "Your working directory has uncommitted changes."
  echo "Please commit or stash them before running this script."
  exit 1
fi

# Pull latest changes
echo_status "Pulling latest changes from main..."
git pull origin main

# Get current version from package.json
current_version=$(node -e "console.log(require('./package.json').version)")
echo_status "Current version: ${current_version}"

# Prompt for version bump type
echo "Select version bump type:"
echo "1) Patch (1.0.0 -> 1.0.1) - For bug fixes"
echo "2) Minor (1.0.0 -> 1.1.0) - For new features"
echo "3) Major (1.0.0 -> 2.0.0) - For breaking changes"
echo "4) Custom (Enter a specific version)"

read -p "Enter your choice (1-4): " version_choice

case $version_choice in
  1)
    bump_type="patch"
    ;;
  2)
    bump_type="minor"
    ;;
  3)
    bump_type="major"
    ;;
  4)
    read -p "Enter the new version (e.g., 1.2.3): " custom_version
    bump_type="custom"
    new_version=$custom_version
    ;;
  *)
    echo_error "Invalid choice. Exiting."
    exit 1
    ;;
esac

# Calculate new version for non-custom bumps
if [ "$bump_type" != "custom" ]; then
  # Split version by dots
  IFS='.' read -ra VERSION_PARTS <<< "$current_version"
  
  major=${VERSION_PARTS[0]}
  minor=${VERSION_PARTS[1]}
  patch=${VERSION_PARTS[2]}
  
  case $bump_type in
    patch)
      patch=$((patch + 1))
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
  esac
  
  new_version="${major}.${minor}.${patch}"
fi

echo_status "New version will be: ${new_version}"

# Prompt for confirmation
read -p "Proceed with release? (y/n): " confirm
if [[ $confirm != "y" && $confirm != "Y" ]]; then
  echo_warning "Release canceled."
  exit 0
fi

# Update version in package.json
echo_status "Updating package.json version to ${new_version}..."
# Use a temporary file to avoid issues with inline editing
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
packageJson.version = '${new_version}';
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n');
"

# Prompt for release notes
echo "Enter release notes (or leave empty for default message):"
echo "Type your notes and press Ctrl+D when finished (or Ctrl+C to cancel)"
release_notes=$(cat)

if [ -z "$release_notes" ]; then
  release_notes="Version ${new_version}"
fi

# Commit the version change
echo_status "Committing version change..."
git add package.json
git commit -m "Bump version to ${new_version}"

# Push the changes
echo_status "Pushing changes to main..."
git push origin main

# Create and push tag
tag_name="v${new_version}"
echo_status "Creating and pushing tag ${tag_name}..."
git tag $tag_name
git push origin $tag_name

echo_success "Version ${new_version} has been released!"
echo "GitHub Actions should now be building and publishing your release."

# Monitor the GitHub Actions workflow
echo_status "Monitoring workflow run..."
sleep 3  # Give GitHub a moment to register the workflow

# Find the latest run ID for the tag we just pushed
echo_status "Getting the latest workflow run ID..."
run_id=$(gh run list --workflow "Build and Release macOS App" --limit 1 --json databaseId --jq ".[0].databaseId")

if [ -z "$run_id" ]; then
  echo_warning "Could not find the workflow run. Please check GitHub Actions manually."
else
  echo_status "Workflow run ID: ${run_id}"
  echo_status "Watching workflow run (press Ctrl+C to stop watching)..."
  gh run watch $run_id

  # Check the status of the run
  run_status=$(gh run view $run_id --json conclusion --jq ".conclusion")
  
  if [ "$run_status" == "success" ]; then
    echo_success "Workflow completed successfully!"
    
    # Update the release notes
    echo_status "Updating release notes..."
    gh release edit $tag_name --title "Version ${new_version}" --notes "$release_notes"
    
    # Publish the release (remove the draft status)
    echo_status "Publishing release..."
    gh release edit $tag_name --draft=false
    
    echo_success "Release v${new_version} has been published!"
    echo "URL: https://github.com/lovesworking/rn-better-dev-tools/releases/tag/${tag_name}"
  else
    echo_error "Workflow failed or was canceled. Please check GitHub Actions."
    echo "URL: https://github.com/lovesworking/rn-better-dev-tools/actions"
  fi
fi 