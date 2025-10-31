-- ============================================================================
-- CLEANUP USERS TABLE RLS POLICIES
-- ============================================================================
-- Removes all conflicting policies and creates a clean minimal set
-- ============================================================================

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Service role full access to users" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view basic info of all users" ON users;
DROP POLICY IF EXISTS "Users can view other users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Anyone authenticated can view users" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create clean minimal policies

-- 1. SELECT: All authenticated users can view all user profiles
-- (needed for chat to show user names)
CREATE POLICY "Authenticated users can view all profiles"
ON users
FOR SELECT
TO authenticated
USING (true);

-- 2. INSERT: Users can insert their own profile during signup
CREATE POLICY "Users can create their own profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 3. UPDATE: Users can only update their own profile
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Note: Admins should use service role key for user management
-- to avoid complex RLS policies that can cause recursion

-- Verify final state
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY cmd, policyname;
