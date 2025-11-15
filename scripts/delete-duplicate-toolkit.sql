-- =========================================================
-- Safely Delete Duplicate Architecture Toolkit Product
-- =========================================================
-- Delete ID: 6828fdcb-664b-4330-8cbf-7546a09281af (old wrong one)
-- Keep ID: 92780671-c3d7-49f1-bb0e-1d3bae862e48 (correct one)

-- Step 1: Check if old product has any user purchases
SELECT
  COUNT(*) as purchase_count,
  'WARNING: Product has purchases, need to migrate them first!' as warning
FROM user_purchases
WHERE product_id = '6828fdcb-664b-4330-8cbf-7546a09281af';

-- Step 2: Check if old product has any content
SELECT
  COUNT(*) as content_count,
  'WARNING: Product has content, need to migrate it first!' as warning
FROM product_contents
WHERE product_id = '6828fdcb-664b-4330-8cbf-7546a09281af';

-- Step 3: If both counts above are 0, it's safe to delete
-- ONLY RUN THIS IF BOTH COUNTS ABOVE ARE 0:

DELETE FROM products
WHERE id = '6828fdcb-664b-4330-8cbf-7546a09281af'
  AND slug = 'architecture-toolkit'
  AND price = 497;

-- Step 4: Verify deletion (should return 0 rows)
SELECT
  id,
  slug,
  name,
  price
FROM products
WHERE id = '6828fdcb-664b-4330-8cbf-7546a09281af';

-- Step 5: Verify correct product still exists (should return 1 row)
SELECT
  id,
  slug,
  name,
  price,
  stripe_price_id,
  stripe_lookup_key
FROM products
WHERE id = '92780671-c3d7-49f1-bb0e-1d3bae862e48';

-- =========================================================
-- SUCCESS CRITERIA:
-- - Step 1 & 2 counts should be 0
-- - Step 4 should return 0 rows (deleted successfully)
-- - Step 5 should return the correct product with:
--   - slug: architecture-mastery-toolkit
--   - price: 190
--   - stripe_lookup_key: architecture_toolkit_full_v1
-- =========================================================
