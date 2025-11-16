-- =========================================================
-- Check product_contents table structure and data
-- =========================================================

-- 1. Check what columns exist in product_contents table
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'product_contents'
ORDER BY ordinal_position;

-- 2. Check if there are ANY contents in the table
SELECT COUNT(*) as total_contents
FROM product_contents;

-- 3. Check what product_ids are in product_contents
SELECT DISTINCT
  pc.product_id,
  p.slug,
  p.name
FROM product_contents pc
LEFT JOIN products p ON p.id = pc.product_id;

-- 4. Check specifically for Architecture Mastery Toolkit contents
-- Using the CORRECT product ID: 92780671-c3d7-49f1-bb0e-1d3bae862e48
SELECT
  pc.*
FROM product_contents pc
WHERE pc.product_id = '92780671-c3d7-49f1-bb0e-1d3bae862e48';

-- 5. Check if there's a different column name for product reference
SELECT
  table_name,
  column_name
FROM information_schema.columns
WHERE table_name = 'product_contents'
  AND column_name LIKE '%product%';

-- =========================================================
-- The product page expects product_contents to have:
-- - product_id (UUID reference to products table)
-- - category (text)
-- - name (text)
-- - description (text)
-- - claude_command (text)
-- - file_urls (array)
-- - sort_order (integer)
-- =========================================================
