#!/usr/bin/env node

// Script to create admin user in Supabase auth system
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

async function createAdminUser() {
  console.log('🔧 Creating Admin User in Supabase Auth...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Environment check:');
  console.log('URL:', supabaseUrl);
  console.log('Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // First, let's try to test with a simple signup using a different email to see if the service works
    console.log('🧪 Testing basic signup functionality first...');
    
    const testEmail = 'test@example.com';
    const { data: testData, error: testError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPass123!'
    });
    
    if (testError) {
      console.log('❌ Basic signup test failed:', testError.message);
      if (testError.message.includes('Email address') && testError.message.includes('invalid')) {
        console.log('💡 This might be a Supabase configuration issue with email validation');
        console.log('💡 Check your Supabase project settings for email restrictions');
        return;
      }
    } else {
      console.log('✅ Basic signup test worked');
      
      // Clean up test user
      if (testData.user) {
        console.log('🧹 Cleaning up test user...');
        // Note: We can't delete users with anon key, so we just log the success
      }
    }
    
    // Try to sign up the admin user
    console.log('📝 Signing up admin@weblaunchcoach.com...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@weblaunchcoach.com',
      password: 'AdminPass123!', // Use a secure password
      options: {
        data: {
          name: 'Admin User'
        }
      }
    });
    
    if (error) {
      if (error.message.includes('User already registered')) {
        console.log('ℹ️ User already exists in auth system');
        
        // Try to sign in to test
        console.log('🔐 Testing signin...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@weblaunchcoach.com',
          password: 'AdminPass123!'
        });
        
        if (signInError) {
          console.log('❌ Signin failed:', signInError.message);
          console.log('💡 You may need to reset the password or use the correct password');
        } else {
          console.log('✅ Signin successful!');
          console.log('User ID:', signInData.user?.id);
          console.log('Email confirmed:', signInData.user?.email_confirmed_at ? 'Yes' : 'No');
        }
      } else {
        console.error('❌ Signup failed:', error.message);
        console.error('Error details:', error);
      }
    } else {
      console.log('✅ Admin user created successfully!');
      console.log('User ID:', data.user?.id);
      console.log('Email:', data.user?.email);
      console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No (check email for confirmation)');
      
      if (!data.user?.email_confirmed_at) {
        console.log('\n📧 IMPORTANT: Check the admin email for a confirmation link!');
        console.log('The user won\'t be able to sign in until the email is confirmed.');
      }
    }
    
    // Also try to connect the user to the existing admin_users record
    if (data?.user?.id) {
      console.log('\n🔗 Updating admin_users table with auth user ID...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('admin_users')
        .update({ user_id: data.user.id })
        .eq('email', 'admin@weblaunchcoach.com')
        .select();
        
      if (updateError) {
        console.log('❌ Failed to update admin_users table:', updateError.message);
      } else {
        console.log('✅ Successfully linked auth user to admin profile');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createAdminUser();