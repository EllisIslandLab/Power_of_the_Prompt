-- =========================================================
-- Setup Architecture Mastery Toolkit Product
-- =========================================================
-- This creates the product and fixes RLS policies

-- 1. Check if product already exists
SELECT * FROM products WHERE slug = 'architecture-mastery-toolkit';

-- 2. Make stripe_price_id nullable (temporary fix until Stripe price is created)
ALTER TABLE products ALTER COLUMN stripe_price_id DROP NOT NULL;

-- 3. Insert or update the product
INSERT INTO products (slug, name, description, price, stripe_price_id)
VALUES (
  'architecture-mastery-toolkit',
  'Architecture Mastery Toolkit',
  'Professional implementation patterns and architectural knowledge that typically takes years to accumulate. Get the exact solutions used by senior developers, pre-configured for your stack with ready-to-use commands.',
  190,
  NULL  -- Will be updated once you create the $190 price in Stripe
)
ON CONFLICT (slug) DO UPDATE
SET price = 190;

-- 4. Enable RLS on products table (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;

-- 6. Create policy to allow public read access
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
TO public
USING (true);

-- 7. Verify the product exists and is accessible
SELECT
  id,
  slug,
  name,
  price,
  created_at
FROM products
WHERE slug = 'architecture-mastery-toolkit';

-- 8. Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'products';

-- Expected results:
-- - Product should exist with price = 190
-- - stripe_price_id will be NULL until you create price in Stripe
-- - Policy "Products are viewable by everyone" should exist
-- - Policy should allow SELECT to public

-- =========================================================
-- IMPORTANT: After creating the $190 price in Stripe
-- =========================================================
-- Once you create the price in Stripe and get the price_id, update it:
--
-- UPDATE products
-- SET stripe_price_id = 'price_YOUR_PRICE_ID_HERE'
-- WHERE slug = 'architecture-mastery-toolkit';
--
-- =========================================================
-- Next: Visit http://localhost:3000/portal/products/architecture-mastery-toolkit
-- Should load without 406 error
-- =========================================================
