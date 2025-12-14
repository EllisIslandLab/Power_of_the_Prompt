-- Create affiliate_badge_clicks table to track when users click on WLA badges
CREATE TABLE affiliate_badge_clicks (
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

-- Create affiliate_compensations table to track actual payouts
CREATE TABLE affiliate_compensations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referrer_email text NOT NULL,
  badge_click_id uuid REFERENCES affiliate_badge_clicks(id) ON DELETE SET NULL,
  purchase_id text NOT NULL, -- References the Stripe payment or internal purchase
  purchase_amount numeric NOT NULL,
  commission_percentage numeric NOT NULL,
  commission_amount numeric NOT NULL,
  status text DEFAULT 'earned' CHECK (status IN ('earned', 'held', 'processed', 'cancelled')),
  -- Holding period: commissions from badge clicks are held for 30 days before being paid
  held_until timestamp with time zone,
  paid_at timestamp with time zone,
  payout_method text, -- 'stripe', 'paypal', 'bank_transfer', etc
  payout_email text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE affiliate_badge_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_compensations ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_affiliate_badge_clicks_referrer_id ON affiliate_badge_clicks(referrer_id);
CREATE INDEX idx_affiliate_badge_clicks_referee_email ON affiliate_badge_clicks(referee_email);
CREATE INDEX idx_affiliate_badge_clicks_clicked_at ON affiliate_badge_clicks(clicked_at);
CREATE INDEX idx_affiliate_badge_clicks_session_id ON affiliate_badge_clicks(session_id);
CREATE INDEX idx_affiliate_badge_clicks_converted ON affiliate_badge_clicks(converted);

CREATE INDEX idx_affiliate_compensations_referrer_id ON affiliate_compensations(referrer_id);
CREATE INDEX idx_affiliate_compensations_status ON affiliate_compensations(status);
CREATE INDEX idx_affiliate_compensations_created_at ON affiliate_compensations(created_at);
CREATE INDEX idx_affiliate_compensations_held_until ON affiliate_compensations(held_until);
CREATE INDEX idx_affiliate_compensations_purchase_id ON affiliate_compensations(purchase_id);

-- Create RLS policies for affiliate_badge_clicks
-- Users can view their own badge clicks
CREATE POLICY "Users can view their own badge clicks" ON affiliate_badge_clicks
  FOR SELECT USING (auth.uid() = referrer_id OR auth.role() = 'service_role');

-- Service role can insert (from API)
CREATE POLICY "Service role can insert badge clicks" ON affiliate_badge_clicks
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Service role can update badge clicks
CREATE POLICY "Service role can update badge clicks" ON affiliate_badge_clicks
  FOR UPDATE USING (auth.role() = 'service_role');

-- Create RLS policies for affiliate_compensations
-- Users can view their own compensations
CREATE POLICY "Users can view their own compensations" ON affiliate_compensations
  FOR SELECT USING (auth.uid() = referrer_id OR auth.role() = 'service_role');

-- Service role can insert and update compensations
CREATE POLICY "Service role can insert compensations" ON affiliate_compensations
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update compensations" ON affiliate_compensations
  FOR UPDATE USING (auth.role() = 'service_role');

-- Create a function to calculate affiliate commission based on tier
CREATE OR REPLACE FUNCTION calculate_affiliate_commission(
  p_purchase_amount numeric,
  p_referrer_id uuid
)
RETURNS TABLE (
  commission_percentage numeric,
  commission_amount numeric
) AS $$
DECLARE
  v_tier_info record;
BEGIN
  -- Get referrer's current affiliate tier
  SELECT at.percentage_bonus, at.max_cash_per_referral
  INTO v_tier_info
  FROM users u
  LEFT JOIN affiliate_tiers at ON u.affiliate_tier_id = at.id
  WHERE u.id = p_referrer_id;

  -- Default to 5% if no tier assigned
  IF v_tier_info IS NULL THEN
    commission_percentage := 5;
  ELSE
    commission_percentage := COALESCE(v_tier_info.percentage_bonus, 5);
  END IF;

  -- Calculate the commission amount
  commission_amount := (p_purchase_amount * commission_percentage) / 100;

  -- Cap at $250 per referral (standard affiliate maximum)
  commission_amount := LEAST(commission_amount, 250);

  -- Cap at the tier's max if specified
  IF v_tier_info.max_cash_per_referral IS NOT NULL THEN
    commission_amount := LEAST(commission_amount, v_tier_info.max_cash_per_referral);
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update badge click conversion status
CREATE OR REPLACE FUNCTION mark_badge_click_converted(
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

COMMENT ON TABLE affiliate_badge_clicks IS 'Tracks when users click on WLA badge affiliate links and converts them to sales';
COMMENT ON TABLE affiliate_compensations IS 'Tracks affiliate compensation earned from referrals';
COMMENT ON FUNCTION calculate_affiliate_commission IS 'Calculates commission amount based on purchase and referrer tier';
COMMENT ON FUNCTION mark_badge_click_converted IS 'Marks a badge click as converted when the referred user makes a purchase';
