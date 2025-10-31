-- ============================================================================
-- CHAT SYSTEM RLS POLICIES
-- ============================================================================
-- Sets up Row Level Security policies for all chat-related tables
-- ============================================================================

-- ============================================================================
-- PART 1: Enable RLS on all chat tables
-- ============================================================================

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: Chat Rooms Policies
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view active chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Admins can manage chat rooms" ON chat_rooms;

-- Students and admins can view active rooms
CREATE POLICY "Anyone can view active chat rooms"
ON chat_rooms
FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can manage all rooms
CREATE POLICY "Admins can manage chat rooms"
ON chat_rooms
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- PART 3: Chat Messages Policies
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view messages in rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON chat_messages;

-- Anyone authenticated can view non-deleted messages
CREATE POLICY "Users can view messages in rooms"
ON chat_messages
FOR SELECT
TO authenticated
USING (is_deleted = false);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own messages"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own messages (for edits/deletes)
CREATE POLICY "Users can update their own messages"
ON chat_messages
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can manage all messages
CREATE POLICY "Admins can manage all messages"
ON chat_messages
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- PART 4: Chat Room Members Policies
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view room members" ON chat_room_members;
DROP POLICY IF EXISTS "Users can manage their own membership" ON chat_room_members;
DROP POLICY IF EXISTS "Admins can manage all memberships" ON chat_room_members;

-- Anyone can view room members
CREATE POLICY "Users can view room members"
ON chat_room_members
FOR SELECT
TO authenticated
USING (true);

-- Users can update their own membership (last_read_at, etc.)
CREATE POLICY "Users can manage their own membership"
ON chat_room_members
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can manage all memberships
CREATE POLICY "Admins can manage all memberships"
ON chat_room_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- NOTE: Message reactions and attachments
-- ============================================================================
-- message_reactions table is created in add-chat-phase2.sql
-- If that script hasn't been run yet, reactions won't be available
-- Attachments are stored as columns in chat_messages table, not a separate table

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('chat_rooms', 'chat_messages', 'chat_room_members')
ORDER BY tablename;

-- Count policies created
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('chat_rooms', 'chat_messages', 'chat_room_members')
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- This script sets up RLS for the chat system with these permissions:
--
-- Chat Rooms:
-- - All authenticated users can view active rooms
-- - Admins can create/update/delete rooms
--
-- Chat Messages:
-- - All authenticated users can view non-deleted messages
-- - Users can insert their own messages
-- - Users can update/delete their own messages
-- - Admins have full access
--
-- Room Members:
-- - All authenticated users can view members
-- - Users can manage their own membership
-- - Admins can manage all memberships
--
-- Reactions & Attachments:
-- - All authenticated users can view
-- - Users can manage their own reactions/attachments
--
-- ============================================================================
