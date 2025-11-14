-- =========================================================
-- Architecture Mastery Toolkit - Price Update to $190
-- =========================================================
-- Run this in your Supabase SQL Editor
-- This updates the price and verifies the product is set up correctly

-- 1. Update the product price to $190
UPDATE products
SET price = 190
WHERE slug = 'architecture-mastery-toolkit';

-- 2. Verify the update worked
SELECT
  id,
  name,
  slug,
  price,
  stripe_lookup_key,
  created_at
FROM products
WHERE slug = 'architecture-mastery-toolkit';

-- Expected result:
-- price should be: 190
-- stripe_lookup_key should be: architecture_toolkit_full_v1
-- Note: Your Stripe product ID is prod_TLpZ1AjXFUXzBT (used in Stripe Dashboard)

-- 3. Check how many resources are available
SELECT
  COUNT(*) as total_resources,
  COUNT(DISTINCT category) as total_categories
FROM product_contents
WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-mastery-toolkit');

-- Expected result:
-- Should show your total number of toolkit resources (30+)

-- 4. List all categories with resource counts
SELECT
  category,
  COUNT(*) as resource_count,
  SUM(time_saved_min) as min_hours_saved,
  SUM(time_saved_max) as max_hours_saved
FROM product_contents
WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit')
GROUP BY category
ORDER BY resource_count DESC;

-- 5. Check if anyone has purchased (should be empty before going live)
SELECT
  p.id,
  p.created_at,
  p.amount_paid,
  p.status,
  p.access_granted,
  u.email as customer_email
FROM purchases p
JOIN users u ON p.user_id = u.id
WHERE p.product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit')
ORDER BY p.created_at DESC
LIMIT 10;

-- 6. Verify the products table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 7. Verify the purchases table has correct columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'purchases'
ORDER BY ordinal_position;

-- =========================================================
-- SUCCESS CHECKS
-- =========================================================
-- ✅ Product price should be 190
-- ✅ stripe_lookup_key should be 'architecture_toolkit_full_v1'
-- ✅ Should see all your toolkit resources
-- ✅ Categories should be organized
-- ✅ Purchases table should be ready

-- =========================================================
-- NEXT STEPS
-- =========================================================
-- After running this:
-- 1. Update Stripe product price to $190
-- 2. Create coupon TOOLKIT100 for $100 off
-- 3. Test the complete flow
-- 4. Go live!
--
-- See TOOLKIT-PRICE-UPDATE.md for detailed instructions
