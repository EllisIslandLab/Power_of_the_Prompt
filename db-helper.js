#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  // Try to use direct connection or modify the pooler connection to session mode
  let connectionString = process.env.DATABASE_URL;

  // If using pgbouncer, try to convert to session mode for better compatibility
  if (connectionString.includes('pgbouncer=true')) {
    connectionString = connectionString.replace('pgbouncer=true', 'pgbouncer=true&pool_mode=session');
  }

  // Alternative: try direct connection (port 5432 instead of 6543)
  if (process.env.DIRECT_URL) {
    connectionString = process.env.DIRECT_URL;
  }

  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database\n');

    const command = process.argv[2];

    if (command === 'tables') {
      // List all tables
      const result = await client.query(`
        SELECT
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `);

      console.log('📋 Tables in public schema:\n');
      console.table(result.rows);

    } else if (command === 'schema') {
      // Show detailed schema for a specific table
      const tableName = process.argv[3];
      if (!tableName) {
        console.error('Please provide a table name: node db-helper.js schema <table_name>');
        process.exit(1);
      }

      const result = await client.query(`
        SELECT
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log(`📊 Schema for table: ${tableName}\n`);
      console.table(result.rows);

    } else if (command === 'query') {
      // Execute a custom query
      const query = process.argv.slice(3).join(' ');
      if (!query) {
        console.error('Please provide a query: node db-helper.js query "SELECT * FROM..."');
        process.exit(1);
      }

      const result = await client.query(query);
      console.log(`\n📊 Query results (${result.rowCount} rows):\n`);
      console.table(result.rows);

    } else if (command === 'exec') {
      // Execute SQL (for INSERT, UPDATE, DELETE, CREATE, etc.)
      const query = process.argv.slice(3).join(' ');
      if (!query) {
        console.error('Please provide SQL: node db-helper.js exec "CREATE TABLE..."');
        process.exit(1);
      }

      const result = await client.query(query);
      console.log(`\n✅ Executed successfully. Rows affected: ${result.rowCount || 0}`);

    } else {
      console.log('Usage:');
      console.log('  node db-helper.js tables                    - List all tables');
      console.log('  node db-helper.js schema <table_name>       - Show schema for a table');
      console.log('  node db-helper.js query "SELECT ..."        - Execute a SELECT query');
      console.log('  node db-helper.js exec "CREATE TABLE..."    - Execute DDL/DML statements');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
