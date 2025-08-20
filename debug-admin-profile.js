#!/usr/bin/env node

// Debug script to check admin profile setup
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

async function debugAdminProfile() {
  console.log('🔍 Debugging Admin Profile Setup\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test signin to get current user
    console.log('🔐 Testing signin with admin@weblaunchcoach.com...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@weblaunchcoach.com',
      password: 'WebLaunchAdmin123!' // Use the password you set
    });
    
    if (signInError) {
      console.log('❌ Signin failed:', signInError.message);
      console.log('💡 Try with your actual password or check the manual setup');
      return;
    }
    
    console.log('✅ Signin successful!');
    const authUserId = signInData.user.id;
    console.log('🆔 Auth User ID:', authUserId);
    console.log('📧 Email:', signInData.user.email);
    
    // Check admin_users table
    console.log('\n🔍 Checking admin_users table...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@weblaunchcoach.com');
    
    if (adminError) {
      console.log('❌ Error querying admin_users:', adminError.message);
    } else if (adminUsers && adminUsers.length > 0) {
      const adminUser = adminUsers[0];
      console.log('✅ Found admin user record:');
      console.log('   - ID:', adminUser.id);
      console.log('   - User ID:', adminUser.user_id);
      console.log('   - Email:', adminUser.email);
      console.log('   - Role:', adminUser.role);
      
      if (adminUser.user_id === authUserId) {
        console.log('✅ User IDs MATCH - Admin profile should work!');
      } else {
        console.log('❌ User IDs DO NOT MATCH!');
        console.log('   - Auth User ID:', authUserId);
        console.log('   - Admin table user_id:', adminUser.user_id);
        console.log('\n🔧 FIXING: Updating admin_users table...');
        
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ user_id: authUserId })
          .eq('email', 'admin@weblaunchcoach.com');
        
        if (updateError) {
          console.log('❌ Failed to update admin_users table:', updateError.message);
        } else {
          console.log('✅ Successfully updated admin_users table!');
        }
      }
    } else {
      console.log('❌ No admin user found in admin_users table');
    }
    
    // Check students table
    console.log('\n🔍 Checking students table...');
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', authUserId);
    
    if (studentError) {
      console.log('❌ Error querying students:', studentError.message);
    } else if (students && students.length > 0) {
      const student = students[0];
      console.log('⚠️ Found conflicting student record:');
      console.log('   - ID:', student.id);
      console.log('   - User ID:', student.user_id);
      console.log('   - Email:', student.email);
      console.log('   - This is causing the conflict!');
      
      console.log('\n🔧 FIXING: Removing conflicting student record...');
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('user_id', authUserId);
      
      if (deleteError) {
        console.log('❌ Failed to remove student record:', deleteError.message);
      } else {
        console.log('✅ Successfully removed conflicting student record!');
      }
    } else {
      console.log('✅ No conflicting student record found');
    }
    
    // Sign out for clean state
    await supabase.auth.signOut();
    
    console.log('\n🎉 DIAGNOSIS COMPLETE!');
    console.log('📋 NEXT STEPS:');
    console.log('1. Try signing in again at /auth/signin');
    console.log('2. You should now see the admin badge');
    console.log('3. The duplicate key error should be resolved');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

debugAdminProfile();