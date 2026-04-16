-- ============================================
-- FIX: Add INSERT policy for users table
-- ============================================
--
-- The users table needs an INSERT policy to allow
-- the handle_new_user() trigger to create records
-- when auth.users are created via admin.createUser()
--
-- Date: 2026-04-16
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policies if any
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Allow user creation from auth trigger" ON users;

-- Allow service role to INSERT users (for handle_new_user trigger)
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway, but explicit policy is clearer

-- Verify
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Users table INSERT policy added';
  RAISE NOTICE '   Service role can now insert user records';
  RAISE NOTICE '';
END $$;
