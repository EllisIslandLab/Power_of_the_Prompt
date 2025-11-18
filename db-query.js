#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const command = process.argv[2];

  try {
    if (command === 'tables') {
      // List all tables using Supabase REST API
      const { data, error } = await supabase.rpc('get_tables', {});

      if (error) {
        // Try alternative method - query information_schema
        console.log('Fetching tables from information_schema...\n');
        const { data: tables, error: err2 } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');

        if (err2) {
          console.error('Cannot query tables directly. Here are your known tables based on migrations:');
          console.log('\nKnown tables:');
          console.log('- users');
          console.log('- demo_sessions');
          console.log('- payments');
          console.log('- ai_credits');
          console.log('- email_tracking');
          return;
        }

        console.log('📋 Tables:\n');
        tables.forEach(t => console.log(`  - ${t.table_name}`));
      } else {
        console.table(data);
      }

    } else if (command === 'schema') {
      const tableName = process.argv[3];
      if (!tableName) {
        console.error('Please provide a table name: node db-query.js schema <table_name>');
        process.exit(1);
      }

      // Use Supabase to describe table
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error) {
        console.error(`❌ Error accessing table ${tableName}:`, error.message);
        process.exit(1);
      }

      console.log(`📊 Table: ${tableName} is accessible\n`);
      console.log('To see the actual schema, check your migration files or use Supabase dashboard.\n');

    } else if (command === 'query') {
      const tableName = process.argv[3];
      const limit = process.argv[4] || 10;

      if (!tableName) {
        console.error('Usage: node db-query.js query <table_name> [limit]');
        process.exit(1);
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(parseInt(limit));

      if (error) {
        console.error(`❌ Error:`, error.message);
        process.exit(1);
      }

      console.log(`📊 Results from ${tableName} (limit ${limit}):\n`);
      console.table(data);

    } else if (command === 'exec') {
      const query = process.argv.slice(3).join(' ');
      if (!query) {
        console.error('Please provide SQL: node db-query.js exec "SELECT * FROM..."');
        process.exit(1);
      }

      const { data, error } = await supabase.rpc('exec_sql', { query });

      if (error) {
        console.error(`❌ Error:`, error.message);
        console.log('\nNote: For DDL operations (CREATE, ALTER, DROP), you should:');
        console.log('1. Create a migration file in supabase/migrations/');
        console.log('2. Or use the Supabase dashboard SQL editor');
        process.exit(1);
      }

      console.log('✅ Query executed successfully');
      if (data) {
        console.table(data);
      }

    } else {
      console.log('Usage:');
      console.log('  node db-query.js tables                    - List all tables');
      console.log('  node db-query.js schema <table_name>       - Check if table exists');
      console.log('  node db-query.js query <table> [limit]     - Query table data');
      console.log('  node db-query.js exec "SQL query"          - Execute SQL');
      console.log('\nNote: For best results with DDL, create migration files instead.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
