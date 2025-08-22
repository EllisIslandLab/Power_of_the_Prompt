// Load from environment variables
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function fixAdminProfile() {
  console.log('🔍 Current admin users in database:')
  
  const { data: currentAdmins, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
  
  if (adminError) {
    console.error('Error fetching admins:', adminError)
    return
  }
  
  console.log('Admins found:', currentAdmins)
  
  console.log('\n🔍 Current auth users:')
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('Error fetching auth users:', authError)
    return
  }
  
  console.log('Auth users:', authUsers.users.map(u => ({ 
    id: u.id, 
    email: u.email, 
    created_at: u.created_at 
  })))
  
  // Find the admin@weblaunchcoach.com user
  const adminAuthUser = authUsers.users.find(u => u.email === 'admin@weblaunchcoach.com')
  
  if (!adminAuthUser) {
    console.error('❌ admin@weblaunchcoach.com not found in auth.users')
    return
  }
  
  console.log(`\n🎯 Found admin auth user: ${adminAuthUser.id}`)
  
  // Check if admin profile exists with this user_id
  const existingAdmin = currentAdmins?.find(a => a.user_id === adminAuthUser.id)
  
  if (existingAdmin) {
    console.log('✅ Admin profile already matches auth user')
    return
  }
  
  // Update or create admin profile with correct user_id
  console.log('🔧 Fixing admin profile...')
  
  // First, delete any existing admin with this email
  await supabase
    .from('admin_users')
    .delete()
    .eq('email', 'admin@weblaunchcoach.com')
  
  // Create new admin profile with correct user_id
  const { data: newAdmin, error: insertError } = await supabase
    .from('admin_users')
    .insert({
      user_id: adminAuthUser.id,
      full_name: 'Admin User',
      email: 'admin@weblaunchcoach.com',
      role: 'Super Admin',
      permissions: ['all']
    })
    .select()
    .single()
  
  if (insertError) {
    console.error('❌ Error creating admin profile:', insertError)
    return
  }
  
  console.log('✅ Admin profile fixed:', newAdmin)
}

fixAdminProfile().catch(console.error)