#!/bin/bash

set -e

echo "🔍 Step 1: Validating YAML syntax..."
if npx --yes js-yaml .github/workflows/update-badges.yml > /dev/null 2>&1; then
  echo "✅ YAML is valid!"
else
  echo "❌ YAML syntax error!"
  npx --yes js-yaml .github/workflows/update-badges.yml
  exit 1
fi

echo ""
echo "🧪 Step 2: Running tests with coverage..."
yarn test:coverage

echo ""
echo "📊 Step 3: Testing badge update script..."
node scripts/update-readme.mjs

echo ""
echo "📝 Step 4: Checking what changed..."
if git diff --quiet README.md; then
  echo "✅ No changes (badges already up to date)"
else
  echo "✅ Badges would be updated:"
  git diff README.md
fi

echo ""
echo "🔄 Step 5: Reverting README changes..."
git checkout README.md

echo ""
echo "✅ All tests passed! Safe to push."
