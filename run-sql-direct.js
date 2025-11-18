#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration(sqlFilePath) {
  // Parse the pooler connection to get credentials
  const dbUrl = process.env.DATABASE_URL;
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(\?|$)/);

  if (!match) {
    console.error('Could not parse DATABASE_URL');
    process.exit(1);
  }

  const [, username, password, , , database] = match;
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

  // Build direct connection string (port 5432, no pooler)
  const directUrl = `postgresql://${username}:${password}@db.${projectRef}.supabase.co:5432/${database.split('?')[0]}`;

  console.log(`🔌 Connecting to: db.${projectRef}.supabase.co:5432`);

  const client = new Client({
    connectionString: directUrl,
    ssl: {
      rejectUnauthorized: false
    },
    // Force IPv4
    family: 4
  });

  try {
    await client.connect();
    console.log('✅ Connected!\n');

    // Read SQL file
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(`📄 Running migration: ${path.basename(sqlFilePath)}`);
    console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB\n`);

    // Execute the migration
    console.log('⚙️  Executing SQL...\n');
    await client.query(sql);

    console.log('✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed!');
    console.error('\nError details:');
    console.error(`  Message: ${error.message}`);
    if (error.code) {
      console.error(`  Code: ${error.code}`);
    }
    if (error.position) {
      console.error(`  Position: ${error.position}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node run-sql-direct.js <path-to-sql-file>');
  process.exit(1);
}

if (!fs.existsSync(migrationFile)) {
  console.error(`Error: File not found: ${migrationFile}`);
  process.exit(1);
}

runMigration(migrationFile);
