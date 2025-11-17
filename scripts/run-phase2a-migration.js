#!/usr/bin/env node

/**
 * Run Phase 2A Migration
 *
 * This script applies the Phase 2A foundation migration to the database.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20251116000001_phase2a_foundation_revised.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  // Database connection (use direct connection, not pooler)
  // Convert: aws-0-us-east-2.pooler.supabase.com:6543 -> qaaautcjhztvjhizklxr.supabase.co:5432
  const connectionString = process.env.DATABASE_URL
    ?.replace('aws-0-us-east-2.pooler.supabase.com:6543', 'qaaautcjhztvjhizklxr.supabase.co:5432')
    .replace('?pgbouncer=true', '')
    || 'postgresql://postgres.qaaautcjhztvjhizklxr:LetsgoBrandon314$@qaaautcjhztvjhizklxr.supabase.co:5432/postgres';

  console.log('🔌 Connecting to database...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully\n');

    console.log('🚀 Running Phase 2A migration...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Run migration
    const result = await client.query(migrationSQL);

    console.log('\n✅ Migration completed successfully!');

    client.release();
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);

    // Print more detailed error info
    if (error.position) {
      console.error(`\nError at position: ${error.position}`);
      const lines = migrationSQL.split('\n');
      const errorLine = Math.floor(error.position / 80); // Approximate
      console.error(`Near line ${errorLine}:`);
      console.error(lines.slice(Math.max(0, errorLine - 2), errorLine + 3).join('\n'));
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
