#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Sync environment variables from Web Launch Academy
 */
async function syncEnv(options = {}) {
  const {
    apiUrl = 'https://weblaunchacademy.com',
    configPath = path.join(process.cwd(), '.wla'),
    verbose = false
  } = options;

  try {
    // Read auth token from .wla file
    if (!fs.existsSync(configPath)) {
      throw new Error(
        'No .wla config found. Run "npx wla init" first to authenticate.'
      );
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const token = config.token;

    if (!token) {
      throw new Error('No auth token found in .wla config');
    }

    if (verbose) {
      console.log('[WLA] Syncing environment variables...');
    }

    // Fetch env vars from API
    const envVars = await fetchEnvVars(apiUrl, token);

    if (verbose) {
      console.log(`[WLA] Loaded ${Object.keys(envVars).length} environment variables`);
    }

    // Inject into process.env
    Object.assign(process.env, envVars);

    return envVars;
  } catch (error) {
    console.error('[WLA] Failed to sync environment variables:', error.message);
    throw error;
  }
}

/**
 * Fetch environment variables from API
 */
function fetchEnvVars(apiUrl, token) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/env/sync', apiUrl);

    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
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
            reject(new Error(response.error || 'Sync failed'));
            return;
          }

          resolve(response.env);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.end();
  });
}

module.exports = { syncEnv };
