-- ============================================================================
-- CREATE DEFAULT CHAT ROOMS
-- ============================================================================
-- Creates default chat rooms for the student chat system:
-- 1. Announcements (admin-only posting)
-- 2. General Discussion (everyone can post)
-- 3. Help & Support (everyone can post)
-- ============================================================================

-- Insert default chat rooms if they don't exist
INSERT INTO chat_rooms (name, description, type, is_active)
VALUES
  (
    'Announcements',
    'Important updates and announcements from instructors',
    'ANNOUNCEMENTS',
    true
  ),
  (
    'General Discussion',
    'Chat with fellow students about web development, projects, and more',
    'GENERAL',
    true
  ),
  (
    'Help & Support',
    'Get help with course material, assignments, and technical questions',
    'HELP',
    true
  )
ON CONFLICT (name) DO NOTHING;

-- Verify rooms were created
SELECT id, name, type, description, is_active
FROM chat_rooms
WHERE name IN ('Announcements', 'General Discussion', 'Help & Support')
ORDER BY
  CASE type
    WHEN 'ANNOUNCEMENTS' THEN 1
    WHEN 'GENERAL' THEN 2
    WHEN 'HELP' THEN 3
    ELSE 4
  END;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Room Types:
-- - ANNOUNCEMENTS: Admin-only posting, students can read and copy
-- - GENERAL: Open discussion for all students
-- - HELP: Q&A and support channel
-- - CUSTOM: Admin can create additional custom rooms
--
-- The chat UI will automatically:
-- - Prevent students from posting in ANNOUNCEMENTS rooms
-- - Show a helpful message about copying to other rooms
-- - Allow admins to post in all rooms
--
-- ============================================================================
