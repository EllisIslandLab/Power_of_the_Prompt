-- ============================================================================
-- ROW LEVEL SECURITY POLICIES FOR PRODUCTS
-- ============================================================================
-- Ensures only purchasers can access secret content
-- ============================================================================

-- Enable RLS on all tables
-- ============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Products Policies
-- ============================================================================

-- Anyone authenticated can view active products
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products"
ON products
FOR SELECT
TO authenticated
USING (status = 'active');

-- Admins can manage all products
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
ON products
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Content Types Policies
-- ============================================================================

-- Anyone authenticated can view content types
DROP POLICY IF EXISTS "Anyone can view content types" ON content_types;
CREATE POLICY "Anyone can view content types"
ON content_types
FOR SELECT
TO authenticated
USING (true);

-- Admins can manage content types
DROP POLICY IF EXISTS "Admins can manage content types" ON content_types;
CREATE POLICY "Admins can manage content types"
ON content_types
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Product Contents Policies (SECRET - main security layer)
-- ============================================================================

-- Users can ONLY see content for products they've purchased
DROP POLICY IF EXISTS "Users can view purchased content" ON product_contents;
CREATE POLICY "Users can view purchased content"
ON product_contents
FOR SELECT
TO authenticated
USING (
  -- User has purchased this product
  product_id IN (
    SELECT product_id FROM purchases
    WHERE user_id = auth.uid()
    AND access_granted = true
    AND status = 'completed'
  )
  OR
  -- OR user is an admin
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Admins can manage all product contents
DROP POLICY IF EXISTS "Admins can manage content" ON product_contents;
CREATE POLICY "Admins can manage content"
ON product_contents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Purchases Policies
-- ============================================================================

-- Users can view their own purchases
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
CREATE POLICY "Users can view own purchases"
ON purchases
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Service role can insert purchases (for webhook)
DROP POLICY IF EXISTS "Service can create purchases" ON purchases;
CREATE POLICY "Service can create purchases"
ON purchases
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins can view all purchases
DROP POLICY IF EXISTS "Admins can view all purchases" ON purchases;
CREATE POLICY "Admins can view all purchases"
ON purchases
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Verify RLS is enabled and policies are created
-- ============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('products', 'content_types', 'product_contents', 'purchases')
ORDER BY tablename, cmd, policyname;
