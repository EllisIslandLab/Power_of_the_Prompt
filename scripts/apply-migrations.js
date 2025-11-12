#!/usr/bin/env node

/**
 * Apply migrations to remote Supabase database
 * This script reads migration files and executes them against the remote database
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

let DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL environment variable')
  process.exit(1)
}

// Remove pgbouncer for direct connection (required for migrations)
DATABASE_URL = DATABASE_URL.replace('?pgbouncer=true', '').replace(':6543/', ':5432/')

async function executeSqlFile(client, filePath) {
  console.log(`\n📄 Reading: ${path.basename(filePath)}`)

  const sql = fs.readFileSync(filePath, 'utf8')

  console.log(`   Executing SQL (${sql.length} bytes)...`)

  try {
    await client.query(sql)
    console.log(`   ✅ Success!`)
    return true
  } catch (error) {
    console.error(`   ❌ Error:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Applying migrations to remote Supabase database...\n')
  console.log(`   Connecting to database...`)

  const client = new Client({
    connectionString: DATABASE_URL,
  })

  try {
    await client.connect()
    console.log(`   ✅ Connected!\n`)

    const migrationsDir = path.join(__dirname, '../supabase/migrations')

    // Read all migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort() // Alphabetical order (timestamp-based naming)

    console.log(`📁 Found ${files.length} migration files\n`)

    // Apply specific migrations or show available ones
    const migrationsToApply = process.argv.slice(2)

    if (migrationsToApply.length > 0) {
      console.log('🎯 Applying specific migrations:')
      migrationsToApply.forEach(m => console.log(`   - ${m}`))

      let successCount = 0
      let errorCount = 0

      for (const migration of migrationsToApply) {
        const filePath = path.join(migrationsDir, migration)

        if (!fs.existsSync(filePath)) {
          console.error(`❌ Migration file not found: ${migration}`)
          errorCount++
          continue
        }

        const success = await executeSqlFile(client, filePath)
        if (success) {
          successCount++
        } else {
          errorCount++
        }
      }

      console.log(`\n📊 Results: ${successCount} success, ${errorCount} errors`)
    } else {
      console.log('⚠️  No specific migrations specified, showing available migrations:')
      console.log('')
      files.forEach((f, i) => console.log(`   ${i + 1}. ${f}`))
      console.log('')
      console.log('💡 Usage: node scripts/apply-migrations.js <migration-file-1> <migration-file-2> ...')
      console.log('💡 Example: node scripts/apply-migrations.js 20251109000002_add_demo_site_generator.sql')
    }

    console.log('\n✨ Done!')
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error('💥 Fatal error:', err)
  process.exit(1)
})
