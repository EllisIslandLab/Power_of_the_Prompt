-- =========================================================
-- Add stripe_lookup_key column and fix the product
-- =========================================================

-- 1. Add stripe_lookup_key column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stripe_lookup_key TEXT;

-- 2. Update the toolkit product with the lookup key and clear the wrong product ID
UPDATE products
SET
  stripe_lookup_key = 'architecture_toolkit_full_v1',
  stripe_price_id = NULL  -- Clear the product ID (we need the PRICE ID instead)
WHERE slug = 'architecture-mastery-toolkit';

-- 3. Verify the update
SELECT
  slug,
  name,
  price,
  stripe_price_id,
  stripe_lookup_key
FROM products
WHERE slug = 'architecture-mastery-toolkit';

-- Expected output:
-- stripe_lookup_key: architecture_toolkit_full_v1
-- stripe_price_id: NULL (will be filled after you get the PRICE ID from Stripe)

-- =========================================================
-- IMPORTANT: Next steps
-- =========================================================
-- 1. In Stripe Dashboard, find the PRICE you created (not the product)
-- 2. The PRICE ID starts with "price_" (like price_1ABC123xyz...)
-- 3. Copy that PRICE ID
-- 4. Run this:
--
-- UPDATE products
-- SET stripe_price_id = 'price_YOUR_ACTUAL_PRICE_ID'
-- WHERE slug = 'architecture-mastery-toolkit';
--
-- NOTE: prod_TLpZ1AjXFUXzBT is the PRODUCT ID
--       You need the PRICE ID from the $190 price you created!
