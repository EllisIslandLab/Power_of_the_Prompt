import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running free tokens migration...\n');

  // Read the migration file
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250125000002_free_tokens_forever.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('Trying direct SQL execution...');
      const { error: directError } = await supabase.from('_anything').select('*').limit(0);

      // Split SQL into statements and execute one by one
      console.log('Executing SQL directly via service role...');
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql })
      });

      if (!response.ok) {
        throw new Error(`Failed to execute migration: ${await response.text()}`);
      }

      console.log('✅ Migration executed successfully!');
    } else {
      console.log('✅ Migration executed successfully!');
      console.log('Result:', data);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
