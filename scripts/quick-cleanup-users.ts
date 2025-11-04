/**
 * QUICK USER CLEANUP SCRIPT
 *
 * This script helps you view and delete test users from all tables.
 * It's safer than SQL because it uses the admin API properly.
 *
 * Usage:
 *   npx tsx scripts/quick-cleanup-users.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

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

interface UserInfo {
  email: string
  name: string
  inAuth: boolean
  inPublic: boolean
  inLeads: boolean
  authId?: string
  publicId?: string
  leadId?: string
  paymentStatus?: string
  tier?: string
  role?: string
}

async function getAllUsers(): Promise<UserInfo[]> {
  // Get auth users
  const { data: authData } = await supabase.auth.admin.listUsers()
  const authUsers = authData?.users || []

  // Get public users
  const { data: publicUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  // Get leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  // Combine all users
  const allEmails = new Set<string>()
  authUsers.forEach(u => u.email && allEmails.add(u.email))
  publicUsers?.forEach(u => u.email && allEmails.add(u.email))
  leads?.forEach(l => l.email && allEmails.add(l.email))

  const users: UserInfo[] = []

  for (const email of allEmails) {
    const authUser = authUsers.find(u => u.email === email)
    const publicUser = publicUsers?.find(u => u.email === email)
    const lead = leads?.find(l => l.email === email)

    users.push({
      email,
      name: publicUser?.full_name || lead?.name || authUser?.user_metadata?.full_name || '',
      inAuth: !!authUser,
      inPublic: !!publicUser,
      inLeads: !!lead,
      authId: authUser?.id,
      publicId: publicUser?.id,
      leadId: lead?.id,
      paymentStatus: publicUser?.payment_status,
      tier: publicUser?.tier,
      role: publicUser?.role
    })
  }

  return users
}

async function deleteUser(email: string): Promise<void> {
  console.log(`\n🗑️  Deleting user: ${email}`)

  // Delete from auth.users
  const { data: authData } = await supabase.auth.admin.listUsers()
  const authUser = authData?.users?.find(u => u.email === email)

  if (authUser) {
    const { error: authError } = await supabase.auth.admin.deleteUser(authUser.id)
    if (authError) {
      console.error(`   ❌ Failed to delete from auth.users: ${authError.message}`)
    } else {
      console.log(`   ✅ Deleted from auth.users`)
    }
  }

  // Delete from public.users
  const { error: publicError } = await supabase
    .from('users')
    .delete()
    .eq('email', email)

  if (publicError) {
    console.error(`   ❌ Failed to delete from public.users: ${publicError.message}`)
  } else {
    console.log(`   ✅ Deleted from public.users`)
  }

  // Delete from public.leads
  const { error: leadError } = await supabase
    .from('leads')
    .delete()
    .eq('email', email)

  if (leadError) {
    console.error(`   ❌ Failed to delete from public.leads: ${leadError.message}`)
  } else {
    console.log(`   ✅ Deleted from public.leads`)
  }
}

function displayUsers(users: UserInfo[]): void {
  console.log('\n═══════════════════════════════════════════════════════════════════')
  console.log('📋 ALL USERS IN DATABASE')
  console.log('═══════════════════════════════════════════════════════════════════\n')

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`)
    console.log(`   Name: ${user.name || '(no name)'}`)
    console.log(`   Tables: auth.users ${user.inAuth ? '✅' : '❌'} | public.users ${user.inPublic ? '✅' : '❌'} | public.leads ${user.inLeads ? '✅' : '❌'}`)
    if (user.inPublic) {
      console.log(`   Role: ${user.role || 'N/A'} | Tier: ${user.tier || 'N/A'} | Payment: ${user.paymentStatus || 'N/A'}`)
    }
    console.log('')
  })

  console.log(`Total users: ${users.length}`)
  console.log('═══════════════════════════════════════════════════════════════════\n')
}

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function main() {
  console.log('🚀 Loading all users...\n')

  const users = await getAllUsers()
  displayUsers(users)

  const answer = await promptUser('Enter email addresses to delete (comma-separated), or "exit" to quit: ')

  if (answer.toLowerCase() === 'exit') {
    console.log('👋 Exiting without changes.')
    process.exit(0)
  }

  const emailsToDelete = answer.split(',').map(e => e.trim()).filter(e => e)

  if (emailsToDelete.length === 0) {
    console.log('❌ No emails provided.')
    process.exit(0)
  }

  console.log(`\n⚠️  You are about to delete ${emailsToDelete.length} user(s):`)
  emailsToDelete.forEach(email => console.log(`   - ${email}`))

  const confirm = await promptUser('\nType "DELETE" to confirm: ')

  if (confirm !== 'DELETE') {
    console.log('❌ Deletion cancelled.')
    process.exit(0)
  }

  console.log('\n🗑️  Deleting users...')

  for (const email of emailsToDelete) {
    await deleteUser(email)
  }

  console.log('\n✅ Deletion complete!')

  // Show remaining users
  console.log('\n📊 Remaining users:')
  const remainingUsers = await getAllUsers()
  displayUsers(remainingUsers)
}

main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
