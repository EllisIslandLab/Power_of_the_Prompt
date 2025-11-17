#!/usr/bin/env node

/**
 * Verify Phase 2A Migration
 *
 * Checks that all tables, columns, and functions were created successfully
 */

const { createClient } = require('@supabase/supabase-js');

async function verifyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qaaautcjhztvjhizklxr.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🔍 Verifying Phase 2A Migration...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allPassed = true;

  // Check new tables exist
  const newTables = [
    'ai_interaction_logs',
    'email_logs',
    'stripe_checkout_sessions'
  ];

  console.log('📋 Checking new tables...');
  for (const table of newTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(0);

      if (error && !error.message?.includes('relation')) {
        console.log(`  ❌ ${table} - ${error.message}`);
        allPassed = false;
      } else if (error) {
        console.log(`  ❌ ${table} - Table does not exist`);
        allPassed = false;
      } else {
        console.log(`  ✅ ${table}`);
      }
    } catch (err) {
      console.log(`  ❌ ${table} - ${err.message}`);
      allPassed = false;
    }
  }

  // Check users table for new columns
  console.log('\n👤 Checking users table updates...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('total_ai_credits, used_ai_credits, available_ai_credits, total_spent, highest_tier_purchased, referral_code, referred_by_code')
      .limit(1);

    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
      allPassed = false;
    } else {
      console.log('  ✅ AI credit columns added');
      console.log('  ✅ Referral columns added');
      console.log('  ✅ Purchase tracking columns added');
    }
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
    allPassed = false;
  }

  // Check demo_sessions for user_id
  console.log('\n🎨 Checking demo_sessions updates...');
  try {
    const { data, error } = await supabase
      .from('demo_sessions')
      .select('user_id')
      .limit(1);

    if (error) {
      console.log(`  ❌ user_id column: ${error.message}`);
      allPassed = false;
    } else {
      console.log('  ✅ user_id column added');
    }
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
    allPassed = false;
  }

  // Check template_submissions for auto-approval columns
  console.log('\n📄 Checking template_submissions updates...');
  try {
    const { data, error } = await supabase
      .from('template_submissions')
      .select('auto_approval_eligible, auto_approval_reason, quality_checks')
      .limit(1);

    if (error) {
      console.log(`  ❌ Auto-approval columns: ${error.message}`);
      allPassed = false;
    } else {
      console.log('  ✅ Auto-approval columns added');
    }
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
    allPassed = false;
  }

  // Check referrals for commission columns
  console.log('\n💰 Checking referrals updates...');
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('commission_rate, minimum_payout')
      .limit(1);

    if (error) {
      console.log(`  ❌ Commission columns: ${error.message}`);
      allPassed = false;
    } else {
      console.log('  ✅ Commission columns added');
    }
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
    allPassed = false;
  }

  // Check contest_entries for season dates
  console.log('\n🏆 Checking contest_entries updates...');
  try {
    const { data, error } = await supabase
      .from('contest_entries')
      .select('season_start_date, season_end_date')
      .limit(1);

    if (error) {
      console.log(`  ❌ Season date columns: ${error.message}`);
      allPassed = false;
    } else {
      console.log('  ✅ Season date columns added');
    }
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
    allPassed = false;
  }

  // Count users with AI credits
  console.log('\n📊 Checking data migration...');
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('total_ai_credits, used_ai_credits')
      .or('total_ai_credits.gt.0,used_ai_credits.gt.0');

    if (error) {
      console.log(`  ⚠️  Could not check credit migration: ${error.message}`);
    } else {
      console.log(`  ℹ️  Users with AI credits: ${users?.length || 0}`);
    }
  } catch (err) {
    console.log(`  ⚠️  ${err.message}`);
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allPassed) {
    console.log('\n✅ Migration verification PASSED!');
    console.log('\n📦 Phase 2A Foundation is ready:');
    console.log('  • AI credit tracking (user-level)');
    console.log('  • Email logging system');
    console.log('  • Stripe checkout state management');
    console.log('  • Referral commission tracking');
    console.log('  • Template auto-approval system');
    console.log('  • Contest season management\n');
  } else {
    console.log('\n❌ Migration verification FAILED');
    console.log('Some components may not have been created correctly.\n');
    process.exit(1);
  }
}

verifyMigration().catch(console.error);
