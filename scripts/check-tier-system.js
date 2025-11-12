#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function checkTierSystem() {
  console.log('Checking tier system tables...\n')

  // Check if download_tokens table exists
  const { data: tokens, error: tokensError } = await supabase
    .from('download_tokens')
    .select('id')
    .limit(1)

  if (tokensError) {
    console.log('❌ download_tokens table:', tokensError.message)
    console.log('   Status: NOT CREATED')
  } else {
    console.log('✅ download_tokens table exists')
  }

  // Check if users table has tier columns
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, tier, ai_modifications_used, ai_modifications_limit')
    .limit(1)

  if (usersError) {
    console.log('❌ users table tier columns:', usersError.message)
    console.log('   Status: NOT CREATED')
    return false
  } else {
    console.log('✅ users table has tier system columns')
    if (users.length > 0) {
      console.log('   Sample:', users[0])
    }
  }

  console.log('\n✅ Tier system appears to be fully set up!')
  return true
}

checkTierSystem().then(success => {
  process.exit(success ? 0 : 1)
})
