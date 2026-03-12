#!/usr/bin/env node

/**
 * Migration Runner Script
 * 
 * This script applies the form_submissions migration to your Supabase database.
 * Run with: node scripts/run-migration.js
 */

require('dotenv').config({ path: '.env.local' })

console.log('╔═══════════════════════════════════════════════════════╗')
console.log('║   Form Submissions Migration Runner                  ║')
console.log('╚═══════════════════════════════════════════════════════╝\n')

console.log('📋 To apply the migration, please follow these steps:\n')
console.log('1. Open your Supabase Dashboard:')
console.log('   🔗 [Your Supabase SQL Editor]\n')
console.log('2. Copy the contents of this file:')
console.log('   📄 supabase/migrations/20260312000001_create_form_submissions.sql\n')
console.log('3. Paste it into the SQL Editor and click "Run"\n')
console.log('4. Verify the table was created:')
console.log('   🔗 https://supabase.com/dashboard/project/qaaautcjhizklxr/editor\n')
console.log('   Look for the "form_submissions" table\n')

console.log('✅ After running the migration, test the forms at:')
console.log('   http://localhost:3000/portal/support\n')

console.log('📧 Email notifications will be sent to:')
console.log('   hello@weblaunchacademy.com\n')
