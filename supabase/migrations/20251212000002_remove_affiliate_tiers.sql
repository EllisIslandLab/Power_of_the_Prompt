-- Drop the affiliate_tiers table (no longer storing in database)
-- Commission tiers are now hardcoded in the application
DROP TABLE IF EXISTS affiliate_tiers CASCADE;

-- Update the calculate_affiliate_commission function to use hardcoded tiered rates
-- Tier 1: 25% on first $200 ($0-$200)
-- Tier 2: 10% on next $1,000 ($200-$1,200)
-- Tier 3: 5% on next $2,000 ($1,200-$3,200)
-- Cap: $250 per referral
CREATE OR REPLACE FUNCTION calculate_affiliate_commission(
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
  -- This is for informational purposes only
  IF p_purchase_amount > 0 THEN
    commission_percentage := (commission_amount / p_purchase_amount) * 100;
  ELSE
    commission_percentage := 0;
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
