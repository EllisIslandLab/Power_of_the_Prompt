-- =========================================================
-- Debug why purchase record isn't being created
-- =========================================================

-- 1. Check if the user exists
SELECT id, email, full_name
FROM users
WHERE id = 'e400beb1-d57b-4e9a-9cb7-a8cdd0d80acc';

-- 2. Check if the product exists
SELECT id, slug, name, price
FROM products
WHERE slug = 'architecture-mastery-toolkit';

-- 3. Check foreign key constraints on purchases table
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'purchases'::regclass;

-- 4. Check RLS policies on purchases table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'purchases';

-- 5. Try to manually insert a test purchase (will fail if there's a constraint issue)
-- IMPORTANT: Only run this if you want to test the insert manually
-- This will help identify the exact error
INSERT INTO purchases (
  user_id,
  product_id,
  stripe_payment_intent,
  amount_paid,
  status,
  access_granted
) VALUES (
  'e400beb1-d57b-4e9a-9cb7-a8cdd0d80acc',  -- Your user_id from metadata
  (SELECT id FROM products WHERE slug = 'architecture-mastery-toolkit'),
  'cs_live_b1EwF98a9VzeWCCCWAy0T7FTeuhoeqeMXPGpS2zfhlHJkQFHfTn62h2rkF',  -- session.id
  0,  -- amount_paid (100% discount)
  'completed',
  true
) RETURNING *;

-- =========================================================
-- This manual insert will show you the EXACT error if there is one
-- If it succeeds, the webhook handler has a different issue
-- =========================================================
