-- ============================================
-- CRITICAL SECURITY FIX: RLS Vulnerabilities
-- ============================================
--
-- This migration fixes critical RLS vulnerabilities:
-- 1. Users table exposed ALL user data to ANY authenticated user
-- 2. Users could potentially modify sensitive columns (credits, tier, role)
--
-- Date: 2026-03-31
-- ============================================

-- ============================================
-- STEP 1: FIX USERS TABLE SELECT POLICY
-- ============================================

-- Drop the overly permissive policy that allows any authenticated user
-- to view ALL users' data (emails, payments, phone numbers, etc.)
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON users;

-- Replace with user-scoped policy (users can only see their own profile)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Add admin-only policy for viewing all users
CREATE POLICY "Admins can view all profiles"
  ON users FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = 'hello@weblaunchacademy.com');

-- ============================================
-- STEP 2: RESTRICT COLUMN-LEVEL UPDATES
-- ============================================

-- Revoke UPDATE on all columns to prevent users from modifying sensitive fields
-- (total_ai_credits, tier, role, payment_status, total_spent, etc.)
REVOKE UPDATE ON users FROM authenticated;

-- Grant UPDATE only on safe, user-modifiable columns
GRANT UPDATE (
  full_name,
  phone_number,
  sms_consent,
  sms_consent_timestamp
) ON users TO authenticated;

-- ============================================
-- STEP 3: VERIFY POLICIES
-- ============================================

DO $$
DECLARE
  policy_count integer;
  column_privilege_count integer;
BEGIN
  -- Count SELECT policies on users table
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'users'
    AND cmd = 'SELECT';

  -- Verify we have at least 2 SELECT policies (user + admin)
  ASSERT policy_count >= 2, 'Missing SELECT policies on users table';

  -- Verify column privileges are restricted
  SELECT COUNT(*) INTO column_privilege_count
  FROM information_schema.column_privileges
  WHERE table_schema = 'public'
    AND table_name = 'users'
    AND grantee = 'authenticated'
    AND privilege_type = 'UPDATE';

  -- Should have exactly 4 columns with UPDATE privilege
  ASSERT column_privilege_count = 4,
    'Column privileges not properly restricted (expected 4, got ' || column_privilege_count || ')';

  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ CRITICAL RLS VULNERABILITIES FIXED!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '  1. Removed "view all profiles" policy';
  RAISE NOTICE '  2. Added scoped "view own profile" policy';
  RAISE NOTICE '  3. Added admin-only "view all profiles" policy';
  RAISE NOTICE '  4. Restricted column-level UPDATE to 4 safe fields';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Status:';
  RAISE NOTICE '  ✅ Users can only see their own profile';
  RAISE NOTICE '  ✅ Admins can see all profiles';
  RAISE NOTICE '  ✅ Users cannot modify credits, tier, or role';
  RAISE NOTICE '  ✅ Users can only update: name, phone, sms_consent';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
