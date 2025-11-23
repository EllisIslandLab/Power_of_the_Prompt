#!/usr/bin/env node

/**
 * Initialize and verify Claude configuration for Web Launch Academy projects
 * Run with: npm run claude:init
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, symbol, message) {
  console.log(`${COLORS[color]}${symbol}${COLORS.reset} ${message}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log('green', '✓', `${description} exists`);
  } else {
    log('red', '✗', `${description} MISSING`);
  }
  return exists;
}

function main() {
  console.log('\n🚀 Claude Configuration Check\n');
  console.log('=' .repeat(50));

  const rootDir = process.cwd();
  let allGood = true;

  // Check .claudeconfig directory
  console.log('\n📁 .claudeconfig/ Directory:\n');

  const configDir = path.join(rootDir, '.claudeconfig');
  if (!fs.existsSync(configDir)) {
    log('red', '✗', '.claudeconfig/ directory MISSING');
    allGood = false;
  } else {
    log('green', '✓', '.claudeconfig/ directory exists');

    // Check main config files
    const configFiles = [
      { path: 'instructions.md', desc: 'Coding standards' },
      { path: 'patterns.md', desc: 'Pattern reference' },
      { path: 'diagnostics.md', desc: 'Detection rules' },
      { path: 'README.md', desc: 'Documentation' },
    ];

    configFiles.forEach(file => {
      const exists = checkFile(path.join(configDir, file.path), `  ${file.path} (${file.desc})`);
      if (!exists) allGood = false;
    });

    // Check templates directory
    const templatesDir = path.join(configDir, 'templates');
    if (fs.existsSync(templatesDir)) {
      const templates = fs.readdirSync(templatesDir).filter(f => f.endsWith('.md'));
      log('blue', '📋', `Found ${templates.length} pattern templates:`);
      templates.forEach(t => {
        console.log(`     - ${t}`);
      });
    } else {
      log('yellow', '⚠', 'templates/ directory not found');
    }
  }

  // Check .claude directory
  console.log('\n📁 .claude/ Directory:\n');

  const claudeDir = path.join(rootDir, '.claude');
  if (!fs.existsSync(claudeDir)) {
    log('yellow', '⚠', '.claude/ directory not found (optional)');
  } else {
    log('green', '✓', '.claude/ directory exists');

    const claudeFiles = [
      { path: 'message.md', desc: 'Codebase overview' },
      { path: 'settings.json', desc: 'Project settings' },
    ];

    claudeFiles.forEach(file => {
      checkFile(path.join(claudeDir, file.path), `  ${file.path} (${file.desc})`);
    });
  }

  // Check existing project utilities
  console.log('\n📦 Project Utilities:\n');

  const utilities = [
    { path: 'src/lib/schemas.ts', desc: 'Validation schemas' },
    { path: 'src/lib/rate-limiter.ts', desc: 'Rate limiting' },
    { path: 'src/lib/cache.ts', desc: 'Caching layer' },
    { path: 'src/lib/logger.ts', desc: 'Structured logging' },
    { path: 'src/lib/supabase.ts', desc: 'Database client' },
    { path: 'src/lib/stripe.ts', desc: 'Payment client' },
    { path: 'src/lib/permissions.ts', desc: 'Role permissions' },
    { path: 'src/types/database.ts', desc: 'Generated types' },
  ];

  utilities.forEach(util => {
    checkFile(path.join(rootDir, util.path), `${util.desc} (${util.path})`);
  });

  // Summary
  console.log('\n' + '=' .repeat(50));

  if (allGood) {
    log('green', '✅', 'Claude configuration is complete!\n');
    console.log('Next steps:');
    console.log('  1. Start developing with: npm run dev');
    console.log('  2. Ask Claude Code for help with patterns');
    console.log('  3. Review .claudeconfig/README.md for usage guide\n');
  } else {
    log('yellow', '⚠️', 'Some configuration files are missing.\n');
    console.log('Run the following to set up:');
    console.log('  1. Create missing files manually, or');
    console.log('  2. Ask Claude Code to regenerate configuration\n');
  }
}

main();
