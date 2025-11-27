-- ============================================
-- ENABLE RLS ON VERIFICATION_CODES TABLE
-- Security fix: Prevent public access to verification codes
-- ============================================

-- Enable Row Level Security
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- No public access policies needed
-- Our API uses service role which bypasses RLS
-- This ensures no one can query verification codes directly via Supabase client

-- Optional: Allow admins to view codes for debugging (remove in production)
CREATE POLICY "Admins can view verification codes"
  ON verification_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Service role (used by our API) bypasses RLS automatically
-- So our verification endpoints will continue to work

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ RLS ENABLED ON VERIFICATION_CODES';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Security status:';
  RAISE NOTICE '  ✅ RLS enabled';
  RAISE NOTICE '  ✅ Public access blocked';
  RAISE NOTICE '  ✅ Admin view policy added';
  RAISE NOTICE '  ✅ Service role access maintained';
  RAISE NOTICE '';
  RAISE NOTICE 'API endpoints will continue to work normally';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
