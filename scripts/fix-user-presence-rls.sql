-- ============================================================================
-- FIX USER_PRESENCE TABLE RLS
-- ============================================================================
-- Adds RLS policies for the user_presence table to fix 409 errors
-- ============================================================================

-- Enable RLS on user_presence table
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view presence" ON user_presence;
DROP POLICY IF EXISTS "Users can manage their own presence" ON user_presence;

-- Anyone authenticated can view presence status
CREATE POLICY "Anyone can view presence"
ON user_presence
FOR SELECT
TO authenticated
USING (true);

-- Users can manage their own presence
CREATE POLICY "Users can manage their own presence"
ON user_presence
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Verify policies
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_presence'
ORDER BY policyname;
