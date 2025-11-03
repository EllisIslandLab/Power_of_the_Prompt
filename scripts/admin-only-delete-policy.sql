-- ============================================================================
-- ADMIN-ONLY DELETE POLICY FOR CHAT MESSAGES
-- ============================================================================
-- Allows only admins to mark messages as deleted
-- Regular users can edit their own messages but cannot delete them
-- ============================================================================

-- Drop existing UPDATE policies
DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can edit own messages" ON chat_messages;

-- Policy 1: Users can edit their own messages (content, is_edited)
-- but cannot mark them as deleted
CREATE POLICY "Users can edit own message content"
ON chat_messages
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND is_deleted = false
)
WITH CHECK (
  user_id = auth.uid()
  AND is_deleted = false
);

-- Policy 2: Admins can update any message including marking as deleted
CREATE POLICY "Admins can manage all messages"
ON chat_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (true);

-- Verify final policies
SELECT
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'chat_messages'
ORDER BY cmd, policyname;
