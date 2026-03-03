#!/bin/bash

# Local script to test badge updates without pushing
# Usage: ./scripts/update-badges-local.sh

set -e

echo "🧪 Running tests with coverage..."
yarn test:coverage

echo ""
echo "📊 Updating README badges..."
node scripts/update-readme.mjs

echo ""
echo "📝 Changes to README.md:"
git diff README.md

echo ""
echo "✅ Done! Review the changes above."
echo "   To revert: git checkout README.md"
