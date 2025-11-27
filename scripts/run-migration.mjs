import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running free tokens migration...\n');

  // Read migration file
  const migrationPath = join(__dirname, '../supabase/migrations/20250125000002_free_tokens_forever.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  // Split into individual statements (rough split, but should work for this migration)
  const statements = sql
    .split(/;[\s\n]+(?=(?:DO|ALTER|CREATE|UPDATE|SELECT|INSERT|DELETE|DROP)\s)/gi)
    .filter(stmt => stmt.trim().length > 0)
    .map(stmt => stmt.trim() + (stmt.trim().endsWith(';') ? '' : ';'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`Executing statement ${i + 1}/${statements.length}...`);

    try {
      // Use raw SQL execution
      const { data, error } = await supabase.rpc('exec', { sql: stmt });

      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        console.error('Statement:', stmt.substring(0, 200) + '...');
        // Continue anyway, some errors might be expected (like "column already exists")
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    } catch (err) {
      console.error(`❌ Exception in statement ${i + 1}:`, err.message);
    }
  }

  console.log('\n🎉 Migration process complete!');
  console.log('Note: Some errors are expected if columns already exist.\n');
}

runMigration().catch(console.error);
