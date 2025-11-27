const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL, // Use pooler instead of direct
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('🚀 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    // SQL to add columns (idempotent - safe to run multiple times)
    const sql = `
-- Add free_tokens_claimed column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='free_tokens_claimed'
  ) THEN
    ALTER TABLE users ADD COLUMN free_tokens_claimed boolean DEFAULT false;
    RAISE NOTICE '✅ Added free_tokens_claimed column';
  ELSE
    RAISE NOTICE 'ℹ️  free_tokens_claimed column already exists';
  END IF;
END $$;

-- Add free_tokens_used column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='free_tokens_used'
  ) THEN
    ALTER TABLE users ADD COLUMN free_tokens_used boolean DEFAULT false;
    RAISE NOTICE '✅ Added free_tokens_used column';
  ELSE
    RAISE NOTICE 'ℹ️  free_tokens_used column already exists';
  END IF;
END $$;

-- Add free_tokens_claimed_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='free_tokens_claimed_at'
  ) THEN
    ALTER TABLE users ADD COLUMN free_tokens_claimed_at timestamp;
    RAISE NOTICE '✅ Added free_tokens_claimed_at column';
  ELSE
    RAISE NOTICE 'ℹ️  free_tokens_claimed_at column already exists';
  END IF;
END $$;

-- Add free_tokens_used_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='free_tokens_used_at'
  ) THEN
    ALTER TABLE users ADD COLUMN free_tokens_used_at timestamp;
    RAISE NOTICE '✅ Added free_tokens_used_at column';
  ELSE
    RAISE NOTICE 'ℹ️  free_tokens_used_at column already exists';
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_free_tokens
  ON users(email, free_tokens_claimed, free_tokens_used);
`;

    console.log('📝 Executing migration SQL...\n');
    const result = await client.query(sql);

    console.log('\n✅ Migration completed successfully!\n');

    // Test query to verify columns exist
    console.log('🔍 Verifying columns...\n');
    const testResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name LIKE 'free_tokens%'
      ORDER BY column_name
    `);

    console.log('Columns added:');
    testResult.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name} (${row.data_type})`);
    });

    console.log('\n🎉 All done! The free tokens columns are ready.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
