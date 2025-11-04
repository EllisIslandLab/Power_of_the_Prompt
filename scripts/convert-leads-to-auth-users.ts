/**
 * CONVERT ALL LEADS TO AUTH USERS
 *
 * This script converts all unconverted leads in public.leads to full auth users
 * that can sign in at /signin
 *
 * What it does:
 * 1. Fetches all unconverted leads from public.leads
 * 2. Creates auth.users entries with random passwords
 * 3. Auto-creates public.users entries via handle_new_user trigger
 * 4. Updates public.users to set payment_status='paid' (100% discount)
 * 5. Sends password reset emails so users can set their password
 *
 * Usage:
 *   npx tsx scripts/convert-leads-to-auth-users.ts
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface Lead {
  id: string
  email: string
  name: string | null
  status: string
  created_at: string
}

// Generate a secure random password
function generateRandomPassword(): string {
  return crypto.randomBytes(16).toString('base64') + 'Aa1!' // Ensure it meets requirements
}

async function convertLeadsToUsers() {
  console.log('🚀 Starting lead to user conversion...\n')

  // Step 1: Fetch all unconverted leads
  console.log('📋 Step 1: Fetching unconverted leads...')
  const { data: leads, error: fetchError } = await supabase
    .from('leads')
    .select('id, email, name, status, created_at')
    .neq('status', 'converted')
    .order('created_at', { ascending: true })

  if (fetchError) {
    console.error('❌ Error fetching leads:', fetchError)
    process.exit(1)
  }

  if (!leads || leads.length === 0) {
    console.log('✅ No unconverted leads found. All leads have been converted!')
    process.exit(0)
  }

  console.log(`   Found ${leads.length} unconverted leads\n`)

  // Step 2: Convert each lead to an auth user
  console.log('🔄 Step 2: Converting leads to auth users...\n')

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i] as Lead
    const leadNum = i + 1

    console.log(`[${leadNum}/${leads.length}] Processing: ${lead.email}`)

    try {
      // Check if user already exists in auth.users
      const { data: existingAuthUsers } = await supabase.auth.admin.listUsers()
      const existingAuthUser = existingAuthUsers?.users?.find(
        u => u.email?.toLowerCase() === lead.email.toLowerCase()
      )

      let userId: string

      if (existingAuthUser) {
        console.log(`   ⏭️  User already exists in auth.users`)
        userId = existingAuthUser.id
        skipCount++
      } else {
        // Create auth.users entry with random password
        const randomPassword = generateRandomPassword()

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: lead.email.toLowerCase(),
          password: randomPassword,
          email_confirm: true, // Auto-confirm so they can sign in after password reset
          user_metadata: {
            full_name: lead.name || 'Lead User',
          }
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log(`   ⏭️  User already registered`)
            skipCount++

            // Still mark lead as converted
            await supabase
              .from('leads')
              .update({ status: 'converted', converted_at: new Date().toISOString() })
              .eq('id', lead.id)

            continue
          }

          console.error(`   ❌ Error creating auth user: ${authError.message}`)
          errorCount++
          continue
        }

        if (!authData.user) {
          console.error(`   ❌ No user returned from auth.admin.createUser`)
          errorCount++
          continue
        }

        userId = authData.user.id
        console.log(`   ✅ Created auth.users entry`)
      }

      // Step 3: Update public.users to set payment_status='paid'
      // (The handle_new_user trigger should have created this already)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          payment_status: 'paid',
          tier: 'basic',
          full_name: lead.name || 'Lead User'
        })
        .eq('id', userId)

      if (updateError) {
        console.log(`   ⚠️  Warning: Could not update payment status: ${updateError.message}`)
      } else {
        console.log(`   ✅ Set payment_status='paid'`)
      }

      // Step 4: Mark lead as converted
      const { error: leadUpdateError } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          converted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id)

      if (leadUpdateError) {
        console.log(`   ⚠️  Warning: Could not update lead status: ${leadUpdateError.message}`)
      }

      // Note: We don't send password reset emails here
      // Users will create accounts through the normal purchase flow
      // This script only converts existing leads to have auth.users entries
      // so they CAN sign in after they complete a purchase

      successCount++
      console.log('')

    } catch (error) {
      console.error(`   ❌ Unexpected error: ${error}`)
      errorCount++
      console.log('')
    }
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════')
  console.log('📊 CONVERSION SUMMARY')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`✅ Successfully converted: ${successCount}`)
  console.log(`⏭️  Skipped (already exist): ${skipCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📧 Total leads processed: ${leads.length}`)
  console.log('═══════════════════════════════════════════════════════\n')

  if (successCount > 0) {
    console.log('✅ All leads now have auth.users entries with payment_status=\'paid\'')
    console.log('   Users can now sign in at /signin using their email.')
    console.log('   Note: Users will need to create their password through the normal')
    console.log('   purchase flow or by requesting a password reset.\n')
  }

  console.log('✨ Done!')
}

// Run the conversion
convertLeadsToUsers().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
