#!/usr/bin/env node

// Fix admin profile conflicts without needing password
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

async function fixAdminConflict() {
  console.log('🔧 Fixing Admin Profile Conflicts\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('🔍 Checking admin_users table...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@weblaunchcoach.com');
    
    if (adminError) {
      console.log('❌ Error querying admin_users:', adminError.message);
      return;
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('❌ No admin user found in admin_users table');
      console.log('💡 You need to create an admin record in the admin_users table first');
      return;
    }
    
    const adminUser = adminUsers[0];
    console.log('✅ Found admin user record:');
    console.log('   - ID:', adminUser.id);
    console.log('   - User ID:', adminUser.user_id);
    console.log('   - Email:', adminUser.email);
    console.log('   - Role:', adminUser.role);
    
    const adminUserId = adminUser.user_id;
    
    // Check for conflicting student record
    console.log('\n🔍 Checking for conflicting student records...');
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', adminUserId);
    
    if (studentError) {
      console.log('❌ Error querying students:', studentError.message);
      return;
    }
    
    if (students && students.length > 0) {
      console.log('⚠️ Found conflicting student records:');
      students.forEach((student, index) => {
        console.log(`   ${index + 1}. ID: ${student.id}, Email: ${student.email}, User ID: ${student.user_id}`);
      });
      
      console.log('\n🔧 Removing conflicting student records...');
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('user_id', adminUserId);
      
      if (deleteError) {
        console.log('❌ Failed to remove student records:', deleteError.message);
      } else {
        console.log('✅ Successfully removed conflicting student records!');
      }
    } else {
      console.log('✅ No conflicting student records found');
    }
    
    // Also check for any students with the same email
    console.log('\n🔍 Checking for students with same email...');
    const { data: emailStudents, error: emailError } = await supabase
      .from('students')
      .select('*')
      .eq('email', 'admin@weblaunchcoach.com');
    
    if (emailError) {
      console.log('❌ Error querying students by email:', emailError.message);
    } else if (emailStudents && emailStudents.length > 0) {
      console.log('⚠️ Found student records with admin email:');
      emailStudents.forEach((student, index) => {
        console.log(`   ${index + 1}. ID: ${student.id}, User ID: ${student.user_id}, Email: ${student.email}`);
      });
      
      console.log('\n🔧 Removing student records with admin email...');
      const { error: deleteEmailError } = await supabase
        .from('students')
        .delete()
        .eq('email', 'admin@weblaunchcoach.com');
      
      if (deleteEmailError) {
        console.log('❌ Failed to remove student records by email:', deleteEmailError.message);
      } else {
        console.log('✅ Successfully removed student records with admin email!');
      }
    } else {
      console.log('✅ No student records with admin email found');
    }
    
    console.log('\n🎉 CONFLICT RESOLUTION COMPLETE!');
    console.log('📋 What was fixed:');
    console.log('• Removed any student records with the same user_id as admin');
    console.log('• Removed any student records with admin email address');
    console.log('• This should resolve the duplicate key constraint error');
    
    console.log('\n🧪 NEXT STEPS:');
    console.log('1. Sign out of your current session (if still logged in)');
    console.log('2. Sign in again at /auth/signin');
    console.log('3. You should now see the admin badge and no errors');
    console.log('4. The auth system will correctly identify you as an admin');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixAdminConflict();