#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Supabase connection...\n')
console.log(`URL: ${SUPABASE_URL}`)
console.log(`Service Key: ${SUPABASE_SERVICE_KEY ? '✓ Present' : '✗ Missing'}\n`)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function testConnection() {
  try {
    // Try to query a system table
    const { data, error } = await supabase
      .from('niche_templates')
      .select('id, name, slug, is_active')
      .limit(1)

    if (error) {
      console.error('❌ Error querying niche_templates:', error.message)
      console.log('\nThis table might not exist yet. Trying a different test...\n')

      // Try querying users table instead
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      if (userError) {
        console.error('❌ Error querying users:', userError.message)
        return false
      } else {
        console.log('✅ Database connection works! Users table exists.')
        console.log('⚠️  But niche_templates table does not exist yet - migrations needed.')
        return true
      }
    } else {
      console.log('✅ Database connection works! niche_templates table exists.')
      console.log('\nFound template(s):')
      console.log(data)
      return true
    }
  } catch (err) {
    console.error('💥 Connection failed:', err.message)
    return false
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1)
})
