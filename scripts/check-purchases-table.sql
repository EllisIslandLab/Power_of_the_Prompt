-- =========================================================
-- Check purchases table structure and permissions
-- =========================================================

-- 1. Check if table exists and what columns it has
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'purchases'
ORDER BY ordinal_position;

-- 2. Check RLS policies on purchases table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'purchases';

-- 3. Check if RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'purchases';

-- =========================================================
-- Expected columns for the webhook handler to work:
-- - id
-- - user_id
-- - product_id
-- - stripe_payment_intent
-- - amount_paid
-- - status
-- - access_granted
-- =========================================================
