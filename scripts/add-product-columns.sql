-- Add missing columns to products table for Stripe sync
-- Run this BEFORE running the sync script

-- Add stripe_product_id column (for tracking Stripe Product ID)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_product_id TEXT UNIQUE;

-- Add metadata column (for storing Stripe product metadata)
ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_stripe_id ON products(stripe_product_id);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
  AND table_schema = 'public'
ORDER BY ordinal_position;
