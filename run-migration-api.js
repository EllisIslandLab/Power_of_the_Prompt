#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const https = require('https');

async function runMigration(sqlFilePath) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  // Read SQL file
  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(`📄 Running migration: ${path.basename(sqlFilePath)}`);
  console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB\n`);

  // Use Supabase Management API to execute SQL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

  console.log(`🔌 Connecting to project: ${projectRef}`);
  console.log(`⚙️  Executing SQL via Supabase API...\n`);

  const postData = JSON.stringify({
    query: sql
  });

  const options = {
    hostname: `${projectRef}.supabase.co`,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=representation'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Migration completed successfully!\n');
          if (data) {
            try {
              const result = JSON.parse(data);
              console.log('📋 Response:', result);
            } catch (e) {
              console.log('📋 Response:', data);
            }
          }
          resolve();
        } else {
          console.error('❌ Migration failed!');
          console.error(`Status: ${res.statusCode}`);
          console.error('Response:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Get migration file from command line
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node run-migration-api.js <path-to-sql-file>');
  process.exit(1);
}

if (!fs.existsSync(migrationFile)) {
  console.error(`Error: File not found: ${migrationFile}`);
  process.exit(1);
}

runMigration(migrationFile)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
