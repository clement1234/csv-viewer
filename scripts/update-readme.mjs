#!/usr/bin/env node

/**
 * Update README badges with latest test and coverage metrics
 *
 * Reads:
 * - coverage/coverage-summary.json (for coverage %)
 * - coverage/vitest-results.json (for test count)
 *
 * Updates:
 * - README.md badges (Tests & Coverage)
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Read and parse JSON file safely
 */
function readJSON(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read ${filePath}: ${error.message}`);
  }
}

/**
 * Compute badge color based on coverage percentage
 */
function getCoverageColor(percentage) {
  if (percentage >= 90) return 'brightgreen';
  if (percentage >= 80) return 'green';
  if (percentage >= 70) return 'yellow';
  if (percentage >= 60) return 'orange';
  return 'red';
}

/**
 * Format coverage percentage for badge (e.g., "85.23%" → "85%25")
 */
function formatCoverageForBadge(percentage) {
  const rounded = Math.round(percentage);
  return `${rounded}%25`; // URL-encoded %
}

/**
 * Update README badges with new values
 */
function updateReadmeBadges(readmePath, testCount, coveragePercent) {
  let content = readFileSync(readmePath, 'utf-8');
  const originalContent = content;

  // Compute dynamic values
  const coverageColor = getCoverageColor(coveragePercent);
  const formattedCoverage = formatCoverageForBadge(coveragePercent);

  // Update Tests badge
  // Pattern: ![Tests](https://img.shields.io/badge/Tests-<NUMBER>%20passing-success)
  const testsBadgeRegex = /!\[Tests\]\(https:\/\/img\.shields\.io\/badge\/Tests-\d+%20passing-success\)/;
  const newTestsBadge = `![Tests](https://img.shields.io/badge/Tests-${testCount}%20passing-success)`;

  if (!testsBadgeRegex.test(content)) {
    throw new Error('Tests badge not found in README.md. Expected format: ![Tests](https://img.shields.io/badge/Tests-<NUMBER>%20passing-success)');
  }
  content = content.replace(testsBadgeRegex, newTestsBadge);

  // Update Coverage badge
  // Pattern: ![Coverage](https://img.shields.io/badge/Coverage-<PERCENT>%25+-<COLOR>)
  const coverageBadgeRegex = /!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-\d+%25\+-\w+\)/;
  const newCoverageBadge = `![Coverage](https://img.shields.io/badge/Coverage-${formattedCoverage}+-${coverageColor})`;

  if (!coverageBadgeRegex.test(content)) {
    throw new Error('Coverage badge not found in README.md. Expected format: ![Coverage](https://img.shields.io/badge/Coverage-<NUMBER>%25+-<COLOR>)');
  }
  content = content.replace(coverageBadgeRegex, newCoverageBadge);

  // Write back only if changed
  if (content !== originalContent) {
    writeFileSync(readmePath, content, 'utf-8');
    return true;
  }
  return false;
}

/**
 * Main execution
 */
function main() {
  log('\n📊 Starting README badge update...', colors.blue);

  try {
    // Read coverage data
    const coveragePath = join(rootDir, 'coverage', 'coverage-summary.json');
    const coverageData = readJSON(coveragePath);
    const coveragePercent = coverageData.total.lines.pct;

    log(`✓ Coverage: ${coveragePercent.toFixed(2)}%`, colors.green);

    // Read test results
    const testsPath = join(rootDir, 'coverage', 'vitest-results.json');
    const testsData = readJSON(testsPath);
    const testCount = testsData.numTotalTests;

    log(`✓ Total tests: ${testCount}`, colors.green);

    // Update README
    const readmePath = join(rootDir, 'README.md');
    const changed = updateReadmeBadges(readmePath, testCount, coveragePercent);

    if (changed) {
      log('\n✅ README.md badges updated successfully!', colors.green);
      log(`   • Tests: ${testCount} passing`, colors.blue);
      log(`   • Coverage: ${coveragePercent.toFixed(2)}% (${getCoverageColor(coveragePercent)})`, colors.blue);
    } else {
      log('\n⚠️  No changes needed - badges already up to date', colors.yellow);
    }

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

main();
