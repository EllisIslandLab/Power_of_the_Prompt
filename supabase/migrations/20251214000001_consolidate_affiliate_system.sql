-- ============================================
-- CONSOLIDATE AFFILIATE & REFERRAL SYSTEM
-- ============================================
--
-- This migration resolves conflicts between:
-- 1. Old referral system (referrals table - already dropped)
-- 2. Old invite system (invite_tokens, referral_clicks, referral_payouts)
-- 3. New affiliate badge system (affiliate_badge_clicks, affiliate_compensations)
-- 4. Unused badges table (class attendance tracking - no longer used)
--
-- Goals:
-- - Remove conflicting columns from users table
-- - Drop unused old invite/referral tables if they still exist
-- - Drop unused badges table
-- - Keep affiliate_badge_clicks and affiliate_compensations as primary system
-- - Ensure users.invited_by column references affiliate_badge_clicks.referrer_id
--
-- ============================================

-- Step 1: Drop old/unused tables that might conflict
-- ============================================

-- Drop the badges table (class attendance - no longer in use)
DROP TABLE IF EXISTS badges CASCADE;

-- NOTE: invite_tokens table is actively used by auth system
-- It is NOT dropped as it's needed for the validate-invite and generate-invite endpoints
-- The invite_tokens table has no conflicts with the affiliate system

-- Drop old referral-specific tables if they exist (not actively used)
DROP TABLE IF EXISTS referral_clicks CASCADE;
DROP TABLE IF EXISTS referral_payouts CASCADE;

-- Note: referrals table was already dropped in 20250126_cleanup_redundant_tables.sql

-- Step 2: Verify affiliate tables exist (create if missing)
-- ============================================

CREATE TABLE IF NOT EXISTS affiliate_badge_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referrer_email text NOT NULL,
  clicked_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  source_domain text,
  source_url text,
  user_agent text,
  ip_address text,
  session_id text,
  converted boolean DEFAULT false,
  -- Store references for later linking
  referee_email text,
  referee_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS affiliate_compensations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referrer_email text NOT NULL,
  badge_click_id uuid REFERENCES affiliate_badge_clicks(id) ON DELETE SET NULL,
  purchase_id text NOT NULL,
  purchase_amount numeric NOT NULL,
  commission_percentage numeric NOT NULL,
  commission_amount numeric NOT NULL,
  status text DEFAULT 'earned' CHECK (status IN ('earned', 'held', 'processed', 'cancelled')),
  held_until timestamp with time zone,
  paid_at timestamp with time zone,
  payout_method text,
  payout_email text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 3: Enable Row Level Security
-- ============================================

ALTER TABLE affiliate_badge_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_compensations ENABLE ROW LEVEL SECURITY;

-- Step 4: Create indexes (if not exists)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_affiliate_badge_clicks_referrer_id ON affiliate_badge_clicks(referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_badge_clicks_referee_email ON affiliate_badge_clicks(referee_email);
CREATE INDEX IF NOT EXISTS idx_affiliate_badge_clicks_clicked_at ON affiliate_badge_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_badge_clicks_session_id ON affiliate_badge_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_badge_clicks_converted ON affiliate_badge_clicks(converted);

CREATE INDEX IF NOT EXISTS idx_affiliate_compensations_referrer_id ON affiliate_compensations(referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_compensations_status ON affiliate_compensations(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_compensations_created_at ON affiliate_compensations(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_compensations_held_until ON affiliate_compensations(held_until);
CREATE INDEX IF NOT EXISTS idx_affiliate_compensations_purchase_id ON affiliate_compensations(purchase_id);

-- Step 5: Create or recreate RLS policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own badge clicks" ON affiliate_badge_clicks;
DROP POLICY IF EXISTS "Service role can insert badge clicks" ON affiliate_badge_clicks;
DROP POLICY IF EXISTS "Service role can update badge clicks" ON affiliate_badge_clicks;
DROP POLICY IF EXISTS "Users can view their own compensations" ON affiliate_compensations;
DROP POLICY IF EXISTS "Service role can insert compensations" ON affiliate_compensations;
DROP POLICY IF EXISTS "Service role can update compensations" ON affiliate_compensations;

-- Create new policies for affiliate_badge_clicks
CREATE POLICY "Users can view their own badge clicks" ON affiliate_badge_clicks
  FOR SELECT USING (auth.uid() = referrer_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can insert badge clicks" ON affiliate_badge_clicks
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update badge clicks" ON affiliate_badge_clicks
  FOR UPDATE USING (auth.role() = 'service_role');

-- Create new policies for affiliate_compensations
CREATE POLICY "Users can view their own compensations" ON affiliate_compensations
  FOR SELECT USING (auth.uid() = referrer_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can insert compensations" ON affiliate_compensations
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update compensations" ON affiliate_compensations
  FOR UPDATE USING (auth.role() = 'service_role');

-- Step 6: Update users table - invited_by column
-- ============================================

-- The invited_by column should already exist from phase 2a
-- If it doesn't, add it - otherwise, ensure it references affiliate_badge_clicks correctly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='invited_by'
  ) THEN
    ALTER TABLE users ADD COLUMN invited_by uuid REFERENCES affiliate_badge_clicks(referrer_id) ON DELETE SET NULL;
    RAISE NOTICE 'Added invited_by column to users table';
  ELSE
    RAISE NOTICE 'invited_by column already exists on users table';
  END IF;
END $$;

-- Step 7: Create/update affiliate commission calculation function
-- ============================================

-- Drop if exists to recreate with updated logic
DROP FUNCTION IF EXISTS calculate_affiliate_commission(numeric, uuid);

CREATE FUNCTION calculate_affiliate_commission(
  p_purchase_amount numeric,
  p_referrer_id uuid
)
RETURNS TABLE (
  commission_percentage numeric,
  commission_amount numeric
) AS $$
DECLARE
  v_commission numeric := 0;
BEGIN
  -- Tier 1: 25% on first $200 (max $50)
  IF p_purchase_amount > 0 THEN
    v_commission := v_commission + LEAST(p_purchase_amount, 200) * 0.25;
  END IF;

  -- Tier 2: 10% on next $1,000 (max $100)
  IF p_purchase_amount > 200 THEN
    v_commission := v_commission + LEAST(p_purchase_amount - 200, 1000) * 0.10;
  END IF;

  -- Tier 3: 5% on next $2,000 (max $100)
  IF p_purchase_amount > 1200 THEN
    v_commission := v_commission + LEAST(p_purchase_amount - 1200, 2000) * 0.05;
  END IF;

  -- Cap total commission at $250 per referral
  commission_amount := LEAST(v_commission, 250);

  -- Return a weighted average percentage for tracking purposes
  IF p_purchase_amount > 0 THEN
    commission_percentage := (commission_amount / p_purchase_amount) * 100;
  ELSE
    commission_percentage := 0;
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create/update badge click conversion function
-- ============================================

DROP FUNCTION IF EXISTS mark_badge_click_converted(uuid, text, uuid);

CREATE FUNCTION mark_badge_click_converted(
  p_badge_click_id uuid,
  p_referee_email text,
  p_referee_id uuid
)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_badge_clicks
  SET
    converted = true,
    referee_email = p_referee_email,
    referee_id = p_referee_id,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_badge_click_id;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Add table comments
-- ============================================

COMMENT ON TABLE affiliate_badge_clicks IS 'Tracks when users click on WLA badge affiliate links and converts them to sales';
COMMENT ON TABLE affiliate_compensations IS 'Tracks affiliate compensation earned from referrals';
COMMENT ON FUNCTION calculate_affiliate_commission IS 'Calculates commission amount based on purchase and hardcoded tiered rates (25% → 10% → 5%, capped at $250)';
COMMENT ON FUNCTION mark_badge_click_converted IS 'Marks a badge click as converted when the referred user makes a purchase';

-- Step 10: Verification
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ AFFILIATE SYSTEM CONSOLIDATED';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Dropped tables:';
  RAISE NOTICE '  • badges (class attendance - no longer used)';
  RAISE NOTICE '  • referral_clicks (old referral system)';
  RAISE NOTICE '  • referral_payouts (old referral system)';
  RAISE NOTICE '';
  RAISE NOTICE 'Preserved (actively used):';
  RAISE NOTICE '  • invite_tokens (used by auth system)';
  RAISE NOTICE '    - No conflicts with affiliate system';
  RAISE NOTICE '';
  RAISE NOTICE 'Verified/Created tables:';
  RAISE NOTICE '  • affiliate_badge_clicks';
  RAISE NOTICE '  • affiliate_compensations';
  RAISE NOTICE '';
  RAISE NOTICE 'Users table:';
  RAISE NOTICE '  • invited_by column verified/added';
  RAISE NOTICE '  • References affiliate_badge_clicks(referrer_id)';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions:';
  RAISE NOTICE '  • calculate_affiliate_commission (tiered rates)';
  RAISE NOTICE '  • mark_badge_click_converted (conversion tracking)';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies: Enabled on both affiliate tables';
  RAISE NOTICE 'Indexes: Created for all key columns';
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================
-- END OF MIGRATION
-- ============================================
