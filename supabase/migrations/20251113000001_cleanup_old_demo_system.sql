-- ============================================
-- CLEANUP: Remove old demo system to make room for Phase 1
-- ============================================
-- This migration removes the old demo_projects table and related
-- functions/triggers to prepare for the new component-based system

-- Drop all RLS policies on tables we're about to drop/recreate
DO $$
BEGIN
  -- Drop policies if they exist (ignore errors if they don't)
  EXECUTE 'DROP POLICY IF EXISTS "Admin full access demo_sessions" ON demo_sessions';
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can create demo" ON demo_sessions';
  EXECUTE 'DROP POLICY IF EXISTS "View own sessions" ON demo_sessions';
  EXECUTE 'DROP POLICY IF EXISTS "Admin full access templates" ON template_submissions';
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can submit templates" ON template_submissions';
  EXECUTE 'DROP POLICY IF EXISTS "View approved templates" ON template_submissions';
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore errors if policies don't exist
END $$;

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_reset_demo_expiry_on_update ON demo_projects;
DROP TRIGGER IF EXISTS trigger_update_session_activity ON demo_sessions;

-- Drop functions
DROP FUNCTION IF EXISTS reset_demo_expiry_on_update();
DROP FUNCTION IF EXISTS use_download_token(text);
DROP FUNCTION IF EXISTS generate_download_token(uuid, text);
DROP FUNCTION IF EXISTS increment_referral_clicks(text);
DROP FUNCTION IF EXISTS update_session_activity();

-- Drop tables (if they exist) - use CASCADE to drop dependent objects
DROP TABLE IF EXISTS download_tokens CASCADE;
DROP TABLE IF EXISTS demo_projects CASCADE;
DROP TABLE IF EXISTS component_ratings CASCADE;
DROP TABLE IF EXISTS component_versions CASCADE;
DROP TABLE IF EXISTS components CASCADE;
DROP TABLE IF EXISTS template_submissions CASCADE;
DROP TABLE IF EXISTS demo_sessions CASCADE;
DROP TABLE IF EXISTS contest_entries CASCADE;
DROP TABLE IF EXISTS referral_clicks CASCADE;
DROP TABLE IF EXISTS referral_payouts CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS user_purchases CASCADE;
DROP TABLE IF EXISTS business_categories CASCADE;
DROP TABLE IF EXISTS boilerplate_versions CASCADE;

-- Note: We're preserving any existing user, tier, and payment tables
-- as they may contain important historical data
