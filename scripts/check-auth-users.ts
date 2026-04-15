#!/usr/bin/env tsx

/**
 * Check for existing auth users by email
 * Usage: npx tsx scripts/check-auth-users.ts email@example.com
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkAuthUsers(searchEmail?: string) {
  console.log('🔍 Checking auth.users...\n')

  try {
    // List all auth users
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    if (!users || users.length === 0) {
      console.log('✅ No users found in auth.users')
      return
    }

    // Filter by email if provided
    const filteredUsers = searchEmail
      ? users.filter(u => u.email?.toLowerCase().includes(searchEmail.toLowerCase()))
      : users

    if (filteredUsers.length === 0) {
      console.log(`✅ No users found matching: ${searchEmail}`)
      return
    }

    console.log(`📊 Found ${filteredUsers.length} user(s):\n`)

    for (const user of filteredUsers) {
      console.log('─'.repeat(60))
      console.log(`Email:          ${user.email}`)
      console.log(`ID:             ${user.id}`)
      console.log(`Created:        ${new Date(user.created_at).toLocaleString()}`)
      console.log(`Email verified: ${user.email_confirmed_at ? '✅ Yes' : '❌ No'}`)
      console.log(`Last sign in:   ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`)

      // Check if public.users record exists
      const { data: publicUser } = await supabase
        .from('users')
        .select('id, full_name, tier, payment_status')
        .eq('id', user.id)
        .single()

      if (publicUser) {
        console.log(`\n📋 public.users record:`)
        console.log(`  - Name:   ${publicUser.full_name || 'Not set'}`)
        console.log(`  - Tier:   ${publicUser.tier}`)
        console.log(`  - Status: ${publicUser.payment_status}`)
      } else {
        console.log(`\n⚠️  No public.users record found (this is the problem!)`)
      }
      console.log()
    }

    console.log('─'.repeat(60))
    console.log(`\n💡 To delete a user, use Supabase Dashboard > Authentication > Users`)
    console.log(`   Or delete via SQL: DELETE FROM auth.users WHERE email = 'email@example.com';`)

  } catch (err) {
    console.error('❌ Error:', err)
  }
}

// Get email from command line argument
const searchEmail = process.argv[2]

checkAuthUsers(searchEmail)
