#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration(sqlFilePath) {
  // Use pooler connection in session mode for better compatibility
  let connectionString = process.env.DATABASE_URL;

  // Ensure we're using session mode for DDL statements
  if (connectionString.includes('pgbouncer=true')) {
    connectionString = connectionString.replace('?pgbouncer=true', '');
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read SQL file
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(`📄 Running migration: ${path.basename(sqlFilePath)}`);
    console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB\n`);

    // Execute the migration
    console.log('⚙️  Executing SQL...\n');
    const result = await client.query(sql);

    console.log('✅ Migration completed successfully!\n');

    // Show any notices
    if (result.notices && result.notices.length > 0) {
      console.log('📋 Migration output:');
      result.notices.forEach(notice => {
        console.log(`   ${notice.message}`);
      });
    }

  } catch (error) {
    console.error('❌ Migration failed!');
    console.error('\nError details:');
    console.error(`  Message: ${error.message}`);
    if (error.position) {
      console.error(`  Position: ${error.position}`);
    }
    if (error.detail) {
      console.error(`  Detail: ${error.detail}`);
    }
    if (error.hint) {
      console.error(`  Hint: ${error.hint}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Get migration file from command line
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node run-migration.js <path-to-sql-file>');
  process.exit(1);
}

if (!fs.existsSync(migrationFile)) {
  console.error(`Error: File not found: ${migrationFile}`);
  process.exit(1);
}

runMigration(migrationFile);
