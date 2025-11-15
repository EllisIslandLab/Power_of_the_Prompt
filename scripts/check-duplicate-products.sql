-- =========================================================
-- Check for duplicate Architecture Mastery Toolkit products
-- =========================================================

-- 1. Show all Architecture Mastery Toolkit products
SELECT
  id,
  slug,
  name,
  price,
  stripe_price_id,
  stripe_lookup_key,
  created_at
FROM products
WHERE name ILIKE '%architecture%mastery%toolkit%'
   OR slug ILIKE '%architecture%toolkit%'
ORDER BY created_at;

-- 2. Check if any are referenced in product_contents
SELECT
  pc.id,
  pc.product_id,
  p.slug,
  p.name,
  COUNT(*) as content_count
FROM product_contents pc
JOIN products p ON p.id = pc.product_id
WHERE p.name ILIKE '%architecture%mastery%toolkit%'
   OR p.slug ILIKE '%architecture%toolkit%'
GROUP BY pc.id, pc.product_id, p.slug, p.name;

-- 3. Check if any are referenced in user_purchases
SELECT
  up.id,
  up.product_id,
  p.slug,
  p.name,
  up.user_id,
  up.purchased_at
FROM user_purchases up
JOIN products p ON p.id = up.product_id
WHERE p.name ILIKE '%architecture%mastery%toolkit%'
   OR p.slug ILIKE '%architecture%toolkit%';

-- =========================================================
-- Based on results above, the CORRECT product should have:
-- - slug: 'architecture-mastery-toolkit'
-- - price: 190
-- - stripe_lookup_key: 'architecture_toolkit_full_v1'
-- - stripe_price_id: either NULL or starts with 'price_'
--
-- Keep that one, delete the other
-- =========================================================
