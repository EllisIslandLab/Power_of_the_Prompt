-- ============================================================================
-- FIX CHAT RLS POLICIES
-- ============================================================================
-- Fixes the restrictive SELECT policy that blocks viewing HELP room messages
-- ============================================================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view messages in rooms they're members of" ON chat_messages;

-- Create new policy that allows viewing all public room messages
CREATE POLICY "Users can view messages in public rooms"
ON chat_messages
FOR SELECT
TO authenticated
USING (
  -- Allow viewing non-deleted messages in any active public room
  is_deleted = false
  AND EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE chat_rooms.id = chat_messages.room_id
    AND chat_rooms.is_active = true
  )
);

-- Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'chat_messages'
ORDER BY policyname;
