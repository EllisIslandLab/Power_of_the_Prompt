#!/usr/bin/env node

/**
 * Auto-sync environment variables on import
 * Usage: require('@weblaunchacademy/env-sync/auto')
 * Or: import '@weblaunchacademy/env-sync/auto'
 */

const { syncEnv } = require('./index');

// Only run in Node.js (not browser)
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  // Sync immediately
  syncEnv({ verbose: true })
    .then(() => {
      console.log('[WLA] Environment variables loaded successfully ✓');
    })
    .catch((error) => {
      console.error('[WLA] Failed to load environment variables:', error.message);
      console.error('[WLA] Your app may not work correctly without these variables.');
      // Don't exit - let the app continue
    });
}

module.exports = {};
