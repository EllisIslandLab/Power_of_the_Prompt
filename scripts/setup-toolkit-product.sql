-- =========================================================
-- Setup Architecture Mastery Toolkit Product
-- =========================================================
-- This creates the product and fixes RLS policies

-- 1. Check if product already exists
SELECT * FROM products WHERE slug = 'architecture-mastery-toolkit';

-- 2. If it doesn't exist, create it
INSERT INTO products (slug, name, description, price)
VALUES (
  'architecture-mastery-toolkit',
  'Architecture Mastery Toolkit',
  'Professional implementation patterns and architectural knowledge that typically takes years to accumulate. Get the exact solutions used by senior developers, pre-configured for your stack with ready-to-use commands.',
  190
)
ON CONFLICT (slug) DO UPDATE
SET price = 190;

-- 3. Enable RLS on products table (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;

-- 5. Create policy to allow public read access
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
TO public
USING (true);

-- 6. Verify the product exists and is accessible
SELECT
  id,
  slug,
  name,
  price,
  created_at
FROM products
WHERE slug = 'architecture-mastery-toolkit';

-- 7. Check RLS policies
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
-- - Policy "Products are viewable by everyone" should exist
-- - Policy should allow SELECT to public

-- =========================================================
-- Next: Visit http://localhost:3000/portal/products/architecture-mastery-toolkit
-- Should load without 406 error
-- =========================================================
