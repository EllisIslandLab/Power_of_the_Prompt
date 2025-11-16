-- =========================================================
-- Check if demo_sessions table exists
-- =========================================================

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'demo_sessions'
) as table_exists;

-- 2. If it exists, check the structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'demo_sessions'
ORDER BY ordinal_position;

-- 3. If it exists, check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'demo_sessions';

-- =========================================================
-- If table doesn't exist, we need to create it
-- Expected structure based on the API code:
-- - id (text/uuid)
-- - builder_type (text: 'free' or 'ai_premium')
-- - ai_premium_paid (boolean, nullable)
-- - ai_credits_total (integer)
-- - status (text)
-- - user_email (text)
-- - created_at (timestamp)
-- - updated_at (timestamp)
-- =========================================================
