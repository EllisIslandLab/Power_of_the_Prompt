#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const dns = require('dns');
const { promisify } = require('util');

const resolve4 = promisify(dns.resolve4);

async function getIPv4Address(hostname) {
  try {
    const addresses = await resolve4(hostname);
    return addresses[0]; // Return first IPv4 address
  } catch (error) {
    throw new Error(`Failed to resolve ${hostname}: ${error.message}`);
  }
}

async function executeSQL(client, sql, description) {
  try {
    console.log(`⚙️  ${description}...`);
    await client.query(sql);
    console.log(`✅ ${description} - Success!\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Failed!`);
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
}

async function main() {
  // Parse DATABASE_URL to get credentials
  const dbUrl = process.env.DATABASE_URL;
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(\?|$)/);

  if (!match) {
    console.error('Could not parse DATABASE_URL');
    process.exit(1);
  }

  const [, username, password, hostname, port, database] = match;
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
  const directHost = `db.${projectRef}.supabase.co`;

  console.log('🔍 Resolving database host to IPv4...');
  const ipAddress = await getIPv4Address(directHost);
  console.log(`✅ Resolved ${directHost} to ${ipAddress}\n`);

  // Connect using IP address instead of hostname
  const connectionString = `postgresql://${username}:${password}@${ipAddress}:5432/${database.split('?')[0]}?sslmode=require`;

  console.log(`🔌 Connecting to ${ipAddress}:5432...`);

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Now execute migration steps
    const command = process.argv[2];

    if (command === 'test') {
      console.log('✅ Connection test successful!');

      // Test query
      const result = await client.query('SELECT current_database(), current_user, version()');
      console.log('\n📊 Database info:');
      console.log(`   Database: ${result.rows[0].current_database}`);
      console.log(`   User: ${result.rows[0].current_user}`);
      console.log(`   Version: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);

    } else if (command === 'migrate') {
      const fs = require('fs');
      const sqlFile = process.argv[3];

      if (!sqlFile) {
        console.error('Usage: node db-migrate.js migrate <sql-file>');
        process.exit(1);
      }

      const sql = fs.readFileSync(sqlFile, 'utf8');
      console.log(`📄 Executing migration: ${sqlFile}`);
      console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB\n`);

      await client.query(sql);
      console.log('✅ Migration completed successfully!');

    } else {
      console.log('Usage:');
      console.log('  node db-migrate.js test              - Test connection');
      console.log('  node db-migrate.js migrate <file>    - Run migration file');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error(`   Code: ${error.code}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
