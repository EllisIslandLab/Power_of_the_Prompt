-- Check what columns exist in the products table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Check the current product data
SELECT * FROM products WHERE slug = 'architecture-mastery-toolkit';
