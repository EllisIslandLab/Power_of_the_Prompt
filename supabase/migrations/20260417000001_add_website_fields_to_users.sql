-- ============================================
-- Add Website Building Fields to Users
-- ============================================
--
-- This migration adds fields to support individual
-- website building focus instead of cohort-based learning:
-- - website_url: The client's website they're working on
-- - youtube_playlist_id: ID for their custom video tutorials
-- - payment_method_id: Stripe payment method for billing
--
-- Date: 2026-04-17
-- ============================================

-- Add website_url column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS website_url text;

-- Add youtube_playlist_id column for custom client videos
ALTER TABLE users
ADD COLUMN IF NOT EXISTS youtube_playlist_id text;

-- Add payment_method_id for Stripe billing
ALTER TABLE users
ADD COLUMN IF NOT EXISTS payment_method_id text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_youtube_playlist_id
ON users(youtube_playlist_id)
WHERE youtube_playlist_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.website_url IS 'URL of the website the client is building';
COMMENT ON COLUMN users.youtube_playlist_id IS 'YouTube playlist ID containing custom tutorial videos for this client';
COMMENT ON COLUMN users.payment_method_id IS 'Stripe payment method ID for billing';

-- Verify
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Added website building fields to users table';
  RAISE NOTICE '   - website_url: Client website URL';
  RAISE NOTICE '   - youtube_playlist_id: Custom tutorial videos';
  RAISE NOTICE '   - payment_method_id: Stripe payment method';
  RAISE NOTICE '';
END $$;
