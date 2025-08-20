#!/usr/bin/env node

// Check current auth state and why admin badge isn't showing
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const envLines = envContent.split('\n');
envLines.forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').replace(/"/g, '');
    process.env[key] = value;
  }
});

async function debugAuthState() {
  console.log('🔍 Debugging Auth State for Admin Badge\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log('🔍 Checking admin_users table for profile check logic...');
  const { data: adminUsers, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', 'admin@weblaunchcoach.com');
  
  if (adminError) {
    console.log('❌ Error querying admin_users:', adminError.message);
    return;
  }
  
  if (adminUsers && adminUsers.length > 0) {
    const adminUser = adminUsers[0];
    console.log('✅ Admin profile found:');
    console.log('   - User ID:', adminUser.user_id);
    console.log('   - Email:', adminUser.email);
    console.log('   - Role:', adminUser.role);
    console.log('   - Full Name:', adminUser.full_name);
    
    console.log('\n🧪 Expected auth state:');
    console.log('   - userType should be: "admin"');
    console.log('   - adminProfile should contain the above data');
    console.log('   - isAdmin should be: true');
    
    console.log('\n🎯 Admin badge should show because:');
    console.log('   1. user?.userType === "admin" should be true');
    console.log('   2. Badge is at lines 101-106 in navigation.tsx');
    console.log('   3. It shows: Crown icon + "Admin" text in orange');
    
    console.log('\n🔍 POSSIBLE ISSUES:');
    console.log('   1. Browser cache - try hard refresh (Ctrl+Shift+R)');
    console.log('   2. Auth state not updating - sign out and back in');
    console.log('   3. Network tab should show API call to admin_users table');
    console.log('   4. Console should show "Found admin profile:" log message');
  } else {
    console.log('❌ No admin profile found - this is the issue!');
  }
}

debugAuthState();