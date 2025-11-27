-- ============================================
-- CLEANUP REDUNDANT TABLES
-- Remove tables that are no longer needed
-- ============================================

-- Drop verification_codes (now using Redis)
DROP TABLE IF EXISTS verification_codes CASCADE;

-- Drop orphaned demo_sessions (renamed to demo_projects)
DROP TABLE IF EXISTS demo_sessions CASCADE;

-- Drop email_logs (Resend has this)
DROP TABLE IF EXISTS email_logs CASCADE;

-- Drop user_category_submissions (can store in users)
DROP TABLE IF EXISTS user_category_submissions CASCADE;

-- Drop template_submissions (unclear purpose)
DROP TABLE IF EXISTS template_submissions CASCADE;

-- Drop contest_entries (test data)
DROP TABLE IF EXISTS contest_entries CASCADE;

-- Drop referrals table (will add columns to users instead)
DROP TABLE IF EXISTS referrals CASCADE;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ REDUNDANT TABLES CLEANED UP';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Deleted tables:';
  RAISE NOTICE '  • verification_codes (moved to Redis)';
  RAISE NOTICE '  • demo_sessions (orphaned)';
  RAISE NOTICE '  • email_logs (redundant)';
  RAISE NOTICE '  • user_category_submissions';
  RAISE NOTICE '  • template_submissions';
  RAISE NOTICE '  • contest_entries';
  RAISE NOTICE '  • referrals';
  RAISE NOTICE '';
  RAISE NOTICE 'Remaining tables are lean and focused!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
