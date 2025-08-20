#!/usr/bin/env node

// Test script to check Supabase connection and auth tables
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

async function testSupabaseAuth() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Environment Variables:');
  console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('URL:', supabaseUrl);
  console.log('');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }
  
  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client created successfully\n');
    
    // Test basic connection by checking auth users
    console.log('📋 Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth users query failed:', authError.message);
      
      // Try alternative approach - check if we can access any table
      console.log('\n🔄 Trying to access admin_users table...');
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(5);
        
      if (adminError) {
        console.log('❌ admin_users table access failed:', adminError.message);
      } else {
        console.log('✅ admin_users table accessible');
        console.log('📊 Admin users found:', adminUsers?.length || 0);
        if (adminUsers && adminUsers.length > 0) {
          console.log('👥 Admin users:');
          adminUsers.forEach(user => {
            console.log(`  - ${user.email} (${user.role})`);
          });
        }
      }
    } else {
      console.log('✅ Auth users accessible');
      console.log('📊 Auth users found:', authUsers?.users?.length || 0);
      
      if (authUsers?.users && authUsers.users.length > 0) {
        console.log('👥 Auth users:');
        authUsers.users.forEach(user => {
          console.log(`  - ${user.email} (${user.id}) - Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        });
      }
    }
    
    // Try to query users more directly using RPC if available
    console.log('\n🔍 Trying direct database approach...');
    try {
      const { data: dbUsers, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
        
      if (dbError) {
        console.log('❌ profiles table access failed:', dbError.message);
      } else {
        console.log('✅ profiles table accessible');
        console.log('📊 Profile users found:', dbUsers?.length || 0);
      }
    } catch (e) {
      console.log('❌ profiles table query failed:', e.message);
    }

    // Test signin specifically
    console.log('\n🔐 Testing signin with admin@weblaunchcoach.com...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@weblaunchcoach.com',
      password: 'testpassword123' // You'll need to provide the actual password
    });
    
    if (signInError) {
      console.log('❌ Signin failed:', signInError.message);
      console.log('Error details:', signInError);
    } else {
      console.log('✅ Signin successful');
      console.log('User ID:', signInData.user?.id);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testSupabaseAuth();