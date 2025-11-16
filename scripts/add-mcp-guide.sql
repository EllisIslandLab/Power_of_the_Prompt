-- =========================================================
-- Add MCP Installation & Configuration Guide
-- =========================================================

-- 1. First, check the structure to see what fields we need
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'product_contents'
ORDER BY ordinal_position;

-- 2. Look at an example existing resource to match the format
SELECT *
FROM product_contents
LIMIT 1;

-- 3. Get the toolkit product_id
SELECT id, slug, name
FROM products
WHERE slug = 'architecture-mastery-toolkit';

-- 4. Insert the MCP guide (we'll populate this after seeing the structure)
-- This is a placeholder - I'll create the actual INSERT after seeing the structure

-- =========================================================
-- Will create content for:
-- TIER 1 (Simplest): GitHub, Airtable
-- TIER 2 (Moderate): Supabase/PostgreSQL
-- TIER 3 (Advanced): Custom API integrations (Stripe, Resend, Vercel, Square)
-- =========================================================
