-- ============================================================================
-- VERIFY AND FIX CHAT - SIMPLE APPROACH
-- ============================================================================
-- Shows current state and fixes chat to just work
-- ============================================================================

-- 1. Show current policies on chat tables
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('chat_rooms', 'chat_messages', 'chat_room_members')
ORDER BY tablename, cmd, policyname;

-- 2. Drop all existing chat_messages policies and create simple ones
DROP POLICY IF EXISTS "Users can view messages in rooms they're members of" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in public rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages, admins can delete any" ON chat_messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON chat_messages;

-- Create simple policies that just work
CREATE POLICY "Everyone can view messages"
ON chat_messages
FOR SELECT
TO authenticated
USING (is_deleted = false);

CREATE POLICY "Everyone can post messages"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can edit own messages"
ON chat_messages
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Verify final state
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'chat_messages'
ORDER BY cmd, policyname;
