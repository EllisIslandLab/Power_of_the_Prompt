-- ============================================================================
-- FIX DELETE MESSAGE POLICY
-- ============================================================================
-- Adds missing UPDATE policy for users to mark their own messages as deleted
-- ============================================================================

-- 1. Show current UPDATE policies on chat_messages
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'chat_messages'
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- 2. The UPDATE policy "Users can edit own messages" exists but might not allow is_deleted updates
-- Let's verify it allows all fields to be updated by users

-- Drop and recreate the policy to ensure it works for marking as deleted
DROP POLICY IF EXISTS "Users can edit own messages" ON chat_messages;

-- Create comprehensive UPDATE policy that allows users to update their own messages
CREATE POLICY "Users can update own messages"
ON chat_messages
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Verify final state
SELECT
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'chat_messages'
ORDER BY cmd, policyname;
