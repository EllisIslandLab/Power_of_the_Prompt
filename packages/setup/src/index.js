#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const API_URL = 'https://weblaunchacademy.com';

async function setup() {
  console.log('\n🚀 Web Launch Academy - One-Command Setup\n');

  try {
    // Get setup code from arguments
    const setupCode = process.argv[2];

    if (!setupCode) {
      console.error('❌ Error: Setup code required');
      console.log('\nUsage: npx @weblaunchacademy/setup CODE');
      console.log('\nGet your code from: https://weblaunchacademy.com/portal\n');
      process.exit(1);
    }

    console.log('📡 Exchanging setup code for auth token...');

    // Exchange code for token
    const token = await exchangeCode(setupCode);

    console.log('✅ Auth token received\n');

    // Step 1: Install env-sync package
    console.log('📦 Installing @weblaunchacademy/env-sync...');
    try {
      execSync('npm install @weblaunchacademy/env-sync', {
        stdio: 'inherit'
      });
      console.log('✅ Package installed\n');
    } catch (error) {
      console.error('❌ Failed to install package');
      throw error;
    }

    // Step 2: Save token to .wla config
    console.log('💾 Saving configuration...');
    const configPath = path.join(process.cwd(), '.wla');
    const config = {
      token,
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Config saved to .wla\n');

    // Step 3: Update next.config.js
    console.log('⚙️  Updating next.config.js...');
    const configFile = path.join(process.cwd(), 'next.config.js');

    if (fs.existsSync(configFile)) {
      let configContent = fs.readFileSync(configFile, 'utf8');

      // Check if already has the require
      if (!configContent.includes('@weblaunchacademy/env-sync')) {
        // Add require at the top
        const requireStatement = "require('@weblaunchacademy/env-sync/auto')\n\n";
        configContent = requireStatement + configContent;
        fs.writeFileSync(configFile, configContent);
        console.log('✅ next.config.js updated\n');
      } else {
        console.log('ℹ️  next.config.js already configured\n');
      }
    } else {
      console.log('⚠️  next.config.js not found - you may need to add manually\n');
    }

    // Step 4: Add .wla to .gitignore
    console.log('🔒 Updating .gitignore...');
    const gitignorePath = path.join(process.cwd(), '.gitignore');

    if (fs.existsSync(gitignorePath)) {
      let gitignore = fs.readFileSync(gitignorePath, 'utf8');

      if (!gitignore.includes('.wla')) {
        gitignore += '\n# Web Launch Academy\n.wla\n';
        fs.writeFileSync(gitignorePath, gitignore);
        console.log('✅ .gitignore updated\n');
      } else {
        console.log('ℹ️  .gitignore already includes .wla\n');
      }
    } else {
      fs.writeFileSync(gitignorePath, '.wla\n');
      console.log('✅ .gitignore created\n');
    }

    // Done!
    console.log('🎉 Setup complete!\n');
    console.log('Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Environment variables will load automatically');
    console.log('  3. Check portal preview at localhost:3000\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

/**
 * Exchange setup code for auth token
 */
function exchangeCode(code) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ code });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(`${API_URL}/api/setup/exchange`, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode !== 200) {
            reject(new Error(response.error || `HTTP ${res.statusCode}`));
            return;
          }

          if (!response.success) {
            reject(new Error(response.error || 'Exchange failed'));
            return;
          }

          resolve(response.token);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

// Run setup
setup();
