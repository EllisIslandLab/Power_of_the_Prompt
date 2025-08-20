#!/usr/bin/env node

// Setup script to create admin user in Supabase
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

async function setupAdminUser() {
  console.log('🚀 Setting up Admin User for Web Launch Academy\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Environment Check:');
  console.log('✅ Supabase URL:', supabaseUrl ? 'Set' : '❌ Missing');
  console.log('✅ Anon Key:', supabaseAnonKey ? 'Set' : '❌ Missing');
  console.log('⚠️  Service Role Key:', serviceRoleKey && serviceRoleKey !== 'your-supabase-service-role-key-here' ? 'Set' : '❌ Missing/Default');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required Supabase environment variables');
    return;
  }
  
  console.log('\n📋 SOLUTION OPTIONS:');
  console.log('\nSince Supabase Auth has signup restrictions enabled, here are your options:\n');
  
  console.log('🎯 OPTION 1: Manual Admin Creation (RECOMMENDED)');
  console.log('   1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('   2. Select your project');
  console.log('   3. Go to "Authentication" → "Users"');
  console.log('   4. Click "Add user" button');
  console.log('   5. Create user with:');
  console.log('      - Email: admin@weblaunchcoach.com');
  console.log('      - Password: (choose a secure password)');
  console.log('      - Auto Confirm User: ✅ YES');
  console.log('   6. After user is created, note down the User ID');
  console.log('   7. Go to "Database" → "Table Editor"');
  console.log('   8. Select "admin_users" table');
  console.log('   9. Find the row with email "admin@weblaunchcoach.com"');
  console.log('   10. Update the "user_id" field with the User ID from step 6');
  console.log('   11. Save the changes');
  console.log('   12. Test login at /auth/signin');
  
  console.log('\n🔧 OPTION 2: Enable Signups Temporarily');
  console.log('   1. Go to Supabase Dashboard → Authentication → Settings');
  console.log('   2. Enable "Enable sign up"');
  console.log('   3. Run this script again (it will auto-signup)');
  console.log('   4. After admin is created, disable signups again for security');
  
  console.log('\n🔑 OPTION 3: Service Role Key (Advanced)');
  console.log('   1. Go to Supabase Dashboard → Settings → API');
  console.log('   2. Copy your "service_role" key');
  console.log('   3. Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY=your-key-here');
  console.log('   4. Run this script again');
  
  console.log('\n💡 TESTING CURRENT SIGNUP STATUS...\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test if signups are enabled by trying to create a test user
    const { data, error } = await supabase.auth.signUp({
      email: 'test-signup-enabled@test.com',
      password: 'testpassword123'
    });
    
    if (error) {
      if (error.message.includes('Signups not allowed') || error.message.includes('sign up')) {
        console.log('❌ Signups are DISABLED in your Supabase project');
        console.log('   → Use OPTION 1 (Manual) or OPTION 2 (Enable signups temporarily)');
      } else if (error.message.includes('Email address') && error.message.includes('invalid')) {
        console.log('❌ Email validation issues detected');
        console.log('   → Check Supabase Auth settings for email restrictions');
      } else {
        console.log('❌ Signup test failed:', error.message);
      }
    } else {
      console.log('✅ Signups are ENABLED - attempting admin user creation...');
      
      // Clean up test user first
      if (data.user) {
        console.log('🧹 Cleaning up test user...');
      }
      
      // Now create the real admin user
      console.log('📝 Creating admin user: admin@weblaunchcoach.com');
      
      const { data: adminData, error: adminError } = await supabase.auth.signUp({
        email: 'admin@weblaunchcoach.com',
        password: 'WebLaunchAdmin123!', // You should change this!
        options: {
          data: {
            name: 'Admin User'
          }
        }
      });
      
      if (adminError) {
        if (adminError.message.includes('User already registered')) {
          console.log('ℹ️ Admin user already exists in auth system');
          console.log('   → Try signing in at /auth/signin with your password');
          
          // Check if user is linked to admin_users table
          console.log('🔗 Checking admin_users table connection...');
          
          const { data: adminUsers, error: adminUsersError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', 'admin@weblaunchcoach.com');
            
          if (adminUsersError) {
            console.log('❌ Could not check admin_users table:', adminUsersError.message);
          } else if (adminUsers && adminUsers.length > 0) {
            const adminUser = adminUsers[0];
            console.log('✅ Admin user found in admin_users table');
            console.log('   → User ID in admin_users:', adminUser.user_id);
            console.log('   → You should be able to sign in now!');
          } else {
            console.log('❌ Admin user NOT found in admin_users table');
            console.log('   → You need to link the auth user to admin_users table');
            console.log('   → Use OPTION 1 step 10 to update the user_id');
          }
        } else {
          console.log('❌ Admin user creation failed:', adminError.message);
        }
      } else {
        console.log('✅ Admin user created in auth system!');
        console.log('📧 Email:', adminData.user?.email);
        console.log('🆔 User ID:', adminData.user?.id);
        console.log('📨 Email confirmed:', adminData.user?.email_confirmed_at ? 'Yes' : 'Check email for confirmation');
        
        if (adminData.user?.id) {
          // Update admin_users table with the auth user ID
          console.log('🔗 Linking to admin_users table...');
          
          const { error: updateError } = await supabase
            .from('admin_users')
            .update({ user_id: adminData.user.id })
            .eq('email', 'admin@weblaunchcoach.com');
            
          if (updateError) {
            console.log('❌ Failed to link admin_users table:', updateError.message);
            console.log('   → Manually update admin_users table user_id to:', adminData.user.id);
          } else {
            console.log('✅ Successfully linked admin user to admin_users table!');
            console.log('\n🎉 SETUP COMPLETE!');
            console.log('   → You can now sign in at /auth/signin');
            console.log('   → Email: admin@weblaunchcoach.com');
            console.log('   → Password: WebLaunchAdmin123! (change this after first login)');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
  
  console.log('\n📚 NEXT STEPS:');
  console.log('1. Complete admin user setup using one of the options above');
  console.log('2. Test sign-in at /auth/signin');
  console.log('3. Change the default password after first login');
  console.log('4. Consider disabling signups in Supabase for security');
  console.log('\n🔒 SECURITY REMINDERS:');
  console.log('• Use a strong, unique password for the admin account');
  console.log('• Enable 2FA on your Supabase dashboard');
  console.log('• Keep your service role keys secure and never commit them');
  console.log('• Disable public signups after setup unless needed');
}

setupAdminUser();