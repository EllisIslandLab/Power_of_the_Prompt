#!/usr/bin/env node

/**
 * Run Phase 2A Migration via Supabase Admin API
 *
 * Uses the service role key to execute SQL via the Supabase REST API
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20251116000001_phase2a_foundation_revised.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  // Create Supabase admin client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qaaautcjhztvjhizklxr.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
    process.exit(1);
  }

  console.log('🔌 Connecting to Supabase...');
  console.log(`URL: ${supabaseUrl}\n`);

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🚀 Running Phase 2A migration...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // If exec_sql function doesn't exist, try using the postgres REST API directly
      if (error.message?.includes('exec_sql')) {
        console.log('⚠️  exec_sql function not available, using direct query...\n');

        // Split migration into individual statements and execute them
        const statements = migrationSQL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (let i = 0; i < statements.length; i++) {
          const stmt = statements[i];
          if (stmt.length < 10) continue; // Skip very short statements

          console.log(`Executing statement ${i + 1}/${statements.length}...`);

          const { error: stmtError } = await supabase
            .from('_any_table_')
            .select()
            .limit(0)
            .then(() => {
              // This won't work directly, we need a different approach
              throw new Error('Direct SQL execution not supported via REST API');
            })
            .catch(() => {
              throw new Error('Please run this migration via Supabase SQL Editor');
            });
        }
      } else {
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message || error);
    console.error('\n📝 Please run the migration manually:');
    console.error('1. Go to https://supabase.com/dashboard/project/qaaautcjhztvjhizklxr/sql/new');
    console.error('2. Copy the contents of: supabase/migrations/20251116000001_phase2a_foundation_revised.sql');
    console.error('3. Paste and run it in the SQL Editor\n');
    process.exit(1);
  }
}

runMigration();
