-- =========================================================
-- Setup Access Policies for Architecture Mastery Toolkit
-- =========================================================

-- 1. First, verify which product_id the 30 resources are linked to
SELECT DISTINCT
  pc.product_id,
  p.slug,
  p.name,
  COUNT(*) as resource_count
FROM product_contents pc
LEFT JOIN products p ON p.id = pc.product_id
GROUP BY pc.product_id, p.slug, p.name;

-- 2. Enable RLS on product_contents (if not already enabled)
ALTER TABLE product_contents ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any
DROP POLICY IF EXISTS "Users can view contents of purchased products" ON product_contents;
DROP POLICY IF EXISTS "Public can view all product contents" ON product_contents;

-- 4. Create policy: Users who purchased can see product contents
CREATE POLICY "Users can view contents of purchased products"
ON product_contents
FOR SELECT
TO authenticated
USING (
  product_id IN (
    SELECT product_id
    FROM purchases
    WHERE user_id = auth.uid()
      AND access_granted = true
  )
);

-- 5. Create storage policies for toolkit-files bucket
-- Allow authenticated users who purchased to download files
DROP POLICY IF EXISTS "Users can download purchased toolkit files" ON storage.objects;

CREATE POLICY "Users can download purchased toolkit files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'toolkit-files'
  AND auth.uid() IN (
    SELECT user_id
    FROM purchases p
    JOIN products prod ON prod.id = p.product_id
    WHERE p.access_granted = true
      AND prod.slug = 'architecture-mastery-toolkit'
  )
);

-- 6. Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('product_contents', 'objects')
ORDER BY tablename, policyname;

-- =========================================================
-- After running this:
-- 1. Users who purchased can see product_contents
-- 2. Users who purchased can download files from toolkit-files bucket
-- 3. Refresh the toolkit page to see all 30 resources!
-- =========================================================
