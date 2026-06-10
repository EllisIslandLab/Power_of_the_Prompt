#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function init() {
  console.log('\n🚀 Web Launch Academy - Environment Sync Setup\n');

  try {
    // Get auth token from user
    console.log('To get your auth token:');
    console.log('1. Go to https://weblaunchacademy.com/portal/settings');
    console.log('2. Click "Generate API Token"');
    console.log('3. Copy the token\n');

    const token = await question('Enter your WLA auth token: ');

    if (!token || token.trim().length === 0) {
      console.error('\n❌ No token provided. Aborting.');
      process.exit(1);
    }

    // Save to .wla file
    const configPath = path.join(process.cwd(), '.wla');
    const config = {
      token: token.trim(),
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log('\n✅ Configuration saved to .wla');
    console.log('\n📝 Next steps:');
    console.log('   1. Add to your next.config.js:');
    console.log('      require("@weblaunchacademy/env-sync/auto")');
    console.log('\n   2. Add .wla to .gitignore:');
    console.log('      echo ".wla" >> .gitignore');
    console.log('\n   3. Run your dev server:');
    console.log('      npm run dev\n');

    rl.close();
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Parse command
const command = process.argv[2];

if (command === 'init') {
  init();
} else {
  console.log('Usage: npx wla init');
  process.exit(1);
}
