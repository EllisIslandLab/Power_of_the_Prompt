-- =========================================================
-- Link all toolkit resources to the correct product
-- =========================================================

-- 1. Show all resources grouped by product_id (including NULL)
SELECT
  COALESCE(p.slug, 'NULL / No Product') as product,
  COUNT(*) as resource_count,
  pc.product_id
FROM product_contents pc
LEFT JOIN products p ON p.id = pc.product_id
GROUP BY pc.product_id, p.slug
ORDER BY resource_count DESC;

-- 2. Show resources that have NULL product_id
SELECT
  id,
  name,
  category,
  product_id
FROM product_contents
WHERE product_id IS NULL
ORDER BY category, sort_order;

-- 3. Show resources linked to OLD product (if any)
SELECT
  id,
  name,
  category,
  product_id
FROM product_contents
WHERE product_id = '6828fdcb-664b-4330-8cbf-7546a09281af'  -- Old duplicate product
ORDER BY category, sort_order;

-- 4. UPDATE: Link all toolkit resources to the correct product
-- This assumes ALL resources in product_contents are for the toolkit
-- If you have other products, be more specific in the WHERE clause

UPDATE product_contents
SET product_id = '92780671-c3d7-49f1-bb0e-1d3bae862e48'  -- Correct toolkit product ID
WHERE product_id IS NULL
   OR product_id = '6828fdcb-664b-4330-8cbf-7546a09281af';  -- Old duplicate

-- 5. Verify all resources are now linked
SELECT
  p.slug as product,
  COUNT(*) as resource_count
FROM product_contents pc
JOIN products p ON p.id = pc.product_id
GROUP BY p.slug;

-- 6. Show total resources for Architecture Mastery Toolkit
SELECT COUNT(*) as total_toolkit_resources
FROM product_contents
WHERE product_id = '92780671-c3d7-49f1-bb0e-1d3bae862e48';

-- =========================================================
-- Expected result after query #6: 30 resources
-- Then refresh the toolkit page to see all 30!
-- =========================================================
