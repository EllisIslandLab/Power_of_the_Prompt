-- ============================================================================
-- REMOVE ANNOUNCEMENTS CHAT ROOM
-- ============================================================================
-- Removes the Announcements room from chat
-- Announcements will be moved to a calendar/agenda page instead
-- ============================================================================

-- Delete the announcements room (CASCADE will delete related messages/members)
DELETE FROM chat_rooms
WHERE type = 'ANNOUNCEMENTS' OR name = 'Announcements';

-- Verify removal
SELECT id, name, type, description
FROM chat_rooms
ORDER BY created_at;
