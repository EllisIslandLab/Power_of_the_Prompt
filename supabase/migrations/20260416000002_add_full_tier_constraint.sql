-- ============================================
-- FIX: Add 'full' to allowed tier values
-- ============================================
--
-- The invite tokens use tier='full' but the users
-- table constraint didn't allow it, causing signup failures
--
-- Date: 2026-04-16
-- ============================================

-- Drop and recreate constraint with invite tier values included
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tier_check;

ALTER TABLE users ADD CONSTRAINT users_tier_check
  CHECK (tier IN ('basic', 'premium', 'vip', 'enterprise', 'tier1', 'tier2', 'tier3', 'tier4', 'full', 'free', 'trial'));

-- Verify
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tier constraint updated';
  RAISE NOTICE '   Now allows: basic, premium, vip, enterprise, tier1-4, full, free, trial';
  RAISE NOTICE '';
END $$;
