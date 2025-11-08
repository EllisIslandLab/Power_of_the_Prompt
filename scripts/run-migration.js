#!/usr/bin/env node

/**
 * Script to run Supabase migrations
 * Usage: node scripts/run-migration.js <migration-file>
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function runMigration(migrationFile) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`Error: Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`Running migration: ${migrationFile}`);
  console.log('='.repeat(50));

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      // Note: This may not work with pgbouncer, but worth a try
      console.log('RPC method not available, trying alternative approach...');

      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';';
        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: stmt });

        if (stmtError) {
          console.error(`Error on statement ${i + 1}:`, stmtError);
          throw stmtError;
        }
      }
    }

    console.log('='.repeat(50));
    console.log('✅ Migration completed successfully!');

  } catch (err) {
    console.error('='.repeat(50));
    console.error('❌ Migration failed:', err.message);
    console.error('');
    console.error('Please run this migration manually in the Supabase SQL Editor:');
    console.error(`https://supabase.com/dashboard/project/${supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)[1]}/sql`);
    console.error('');
    console.error('Or use the Supabase CLI after logging in:');
    console.error('  npx supabase login');
    console.error('  npx supabase link --project-ref <project-ref>');
    console.error('  npx supabase db push');
    process.exit(1);
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node scripts/run-migration.js <migration-file>');
  console.error('Example: node scripts/run-migration.js 20251107000001_add_scheduling_system.sql');
  process.exit(1);
}

runMigration(migrationFile);
