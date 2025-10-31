-- ============================================================================
-- FIX RECURSIVE RLS POLICY ON USERS TABLE
-- ============================================================================
-- The previous policy caused infinite recursion by checking users table
-- from within a users table policy. This fixes it.
-- ============================================================================

-- Drop ALL policies on users table to start fresh
DROP POLICY IF EXISTS "Users can view basic info of all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can only view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- Simple policy: All authenticated users can view all user profiles
-- (needed for chat to display names)
CREATE POLICY "Anyone authenticated can view users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Users can insert their own profile (needed for signup)
CREATE POLICY "Users can insert own profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Note: Admins need to use service role key for managing users
-- to avoid recursive RLS checks

-- Verify policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY policyname;
