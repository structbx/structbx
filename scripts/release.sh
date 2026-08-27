#!/bin/bash

# Release script for StructBX
# Generates changelog and creates a new tag
# Usage: ./scripts/release.sh 0.3.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -ne 1 ]; then
    echo -e "${RED}Error: Invalid number of arguments${NC}"
    echo "Usage: $0 <version>"
    echo "Example: $0 0.3.0"
    exit 1
fi

VERSION="$1"
TAG="v${VERSION}"

# Validate version format
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Error: Invalid version format '${VERSION}'${NC}"
    echo "Version must be in format: X.Y.Z (e.g., 0.3.0)"
    exit 1
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "${RED}Error: Tag '${TAG}' already exists${NC}"
    exit 1
fi

# Find the previous tag
PREVIOUS_TAG=$(git describe --tags --abbrev=0 HEAD 2>/dev/null || echo "")

if [ -z "$PREVIOUS_TAG" ]; then
    echo -e "${YELLOW}Warning: No previous tag found. Using initial commit.${NC}"
    PREVIOUS_TAG=$(git rev-list --max-parents=0 HEAD | head -1)
    PREVIOUS_TAG_DISPLAY="initial commit"
else
    PREVIOUS_TAG_DISPLAY="$PREVIOUS_TAG"
fi

# Check if opencode is installed
if ! command -v opencode &> /dev/null; then
    echo -e "${RED}Error: opencode is not installed${NC}"
    echo "Install it from: https://opencode.ai"
    exit 1
fi

# Check if there are commits between tags
COMMIT_COUNT=$(git rev-list --count "${PREVIOUS_TAG}..HEAD")
if [ "$COMMIT_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}Warning: No commits found since ${PREVIOUS_TAG}${NC}"
    exit 0
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  StructBX Release Process${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}New version:${NC}  ${TAG}"
echo -e "${GREEN}Previous tag:${NC} ${PREVIOUS_TAG_DISPLAY}"
echo -e "${GREEN}Commits:${NC}      ${COMMIT_COUNT}"
echo ""

# Show commits that will be included
echo -e "${YELLOW}Commits to be included:${NC}"
git log "${PREVIOUS_TAG}..HEAD" --pretty=format:"  %C(yellow)%h%C(reset) %s" --reverse
echo ""
echo ""

# Confirm before proceeding
read -p "Continue with release? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Release cancelled.${NC}"
    exit 0
fi

echo -e "${GREEN}Generating changelog...${NC}"
echo ""

# Run opencode with the changelog command
opencode run --command changelog "$PREVIOUS_TAG" "$TAG"

# Check if CHANGELOG.md was modified
if git diff --quiet CHANGELOG.md 2>/dev/null; then
    echo -e "${YELLOW}Warning: No changes detected in CHANGELOG.md${NC}"
    exit 0
fi

# Stage and commit the changelog
git add CHANGELOG.md
git commit -m "chore: update CHANGELOG.md for ${TAG}"

echo ""
echo -e "${GREEN}Creating tag ${TAG}...${NC}"

# Create the tag
git tag -a "$TAG" -m "Release ${TAG}"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Release ${TAG} created successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Push commits:    ${GREEN}git push origin main${NC}"
echo -e "  2. Push tag:        ${GREEN}git push origin ${TAG}${NC}"
echo ""
