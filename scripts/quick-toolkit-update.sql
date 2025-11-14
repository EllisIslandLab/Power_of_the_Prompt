-- =========================================================
-- QUICK UPDATE - Architecture Toolkit to $190
-- =========================================================
-- Just run this in Supabase SQL Editor - takes 5 seconds

-- 1. First, let's see what columns actually exist
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 2. Update price to $190
UPDATE products
SET price = 190
WHERE slug = 'architecture-mastery-toolkit';

-- 3. Verify the update
SELECT *
FROM products
WHERE slug = 'architecture-mastery-toolkit';

-- Expected output:
-- price should be: 190

-- Done! ✅
-- Next steps:
-- 1. Go to Stripe: https://dashboard.stripe.com/products/prod_TLpZ1AjXFUXzBT
-- 2. Add new price: $190.00 (one-time)
-- 3. Add lookup key to that price: architecture_toolkit_full_v1
-- 4. Create coupon TOOLKIT100 for $100 off
