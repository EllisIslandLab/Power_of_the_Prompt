-- ============================================================================
-- FIX USERS TABLE RLS FOR CHAT
-- ============================================================================
-- Allows students to view other users' basic info (full_name, role) for chat
-- ============================================================================

-- Drop any overly restrictive SELECT policies on users table
DROP POLICY IF EXISTS "Users can only view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- Create a policy that allows users to view basic info of all users
-- This is needed for chat to display names
CREATE POLICY "Users can view basic info of all users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can manage all users
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
CREATE POLICY "Admins can manage all users"
ON users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

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
