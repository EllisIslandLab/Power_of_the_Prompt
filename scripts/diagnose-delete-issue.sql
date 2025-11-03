-- ============================================================================
-- DIAGNOSE DELETE MESSAGE ISSUE
-- ============================================================================
-- Shows detailed policy info and fixes the UPDATE policy
-- ============================================================================

-- 1. Show full policy details including USING and WITH CHECK
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'chat_messages'
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- 2. Drop the policy and recreate with explicit conditions
DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can edit own messages" ON chat_messages;

-- 3. Create a clear UPDATE policy
-- USING determines which rows can be selected for update
-- WITH CHECK determines what the updated row must satisfy
CREATE POLICY "Users can update own messages"
ON chat_messages
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Verify it was created
SELECT
  policyname,
  cmd,
  roles,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'chat_messages'
  AND cmd = 'UPDATE';

-- 5. Test that auth.uid() is working
SELECT auth.uid() AS current_user_id;
