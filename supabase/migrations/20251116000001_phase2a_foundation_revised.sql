-- ============================================
-- WEB LAUNCH ACADEMY - PHASE 2A MIGRATION (REVISED)
-- Foundation: Payments, AI, Emails
-- ============================================
--
-- This migration:
-- 1. Creates new tables (ai_interaction_logs, email_logs, stripe_checkout_sessions)
-- 2. Adds missing columns to existing tables
-- 3. Migrates AI credits from session-level to user-level
-- 4. Creates functions for credit management
-- 5. Sets up triggers for automation
--
-- SAFE: Uses IF NOT EXISTS and ADD COLUMN IF NOT EXISTS
-- CONFLICTS RESOLVED:
-- - AI credits moved to user-level (from session-level)
-- - Removed redundant demo_sessions columns (use ai_interaction_logs instead)
-- - Properly links demo_sessions to users via user_id
-- ============================================

-- ============================================
-- STEP 1: CREATE NEW TABLES
-- ============================================

-- AI Interaction Logs (Global tracking across sessions)
CREATE TABLE IF NOT EXISTS ai_interaction_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User tracking
  user_email text NOT NULL,
  user_id uuid REFERENCES users(id),

  -- Interaction details
  interaction_type text NOT NULL, -- 'question', 'component_generation', 'improvement', 'clarification'
  prompt_sent text NOT NULL,
  response_received text,
  credits_used integer DEFAULT 1,

  -- Context
  demo_session_id uuid REFERENCES demo_sessions(id),
  component_id uuid REFERENCES components(id),

  -- Feedback
  was_helpful boolean,
  user_feedback text,

  -- Timestamps
  created_at timestamp DEFAULT now()
);

-- Email Logs (Track all emails sent)
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Recipient
  recipient_email text NOT NULL,
  recipient_user_id uuid REFERENCES users(id),

  -- Email details
  email_type text NOT NULL, -- 'preview_ready', 'payment_confirmed', 'submission_reviewed', etc.
  subject text,

  -- Resend data
  resend_id text,
  resend_status text,

  -- Status tracking
  status text DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'bounced', 'failed'

  -- Context
  demo_session_id uuid REFERENCES demo_sessions(id),
  related_purchase_id uuid REFERENCES user_purchases(id),

  -- Metadata
  metadata jsonb,

  -- Timestamps
  sent_at timestamp DEFAULT now(),
  delivered_at timestamp,
  opened_at timestamp
);

-- Stripe Checkout Sessions (Track payment state for return flow)
CREATE TABLE IF NOT EXISTS stripe_checkout_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Stripe data
  stripe_session_id text UNIQUE NOT NULL,
  stripe_customer_id text,

  -- User
  user_email text NOT NULL,
  user_id uuid REFERENCES users(id),

  -- Purchase details
  tier text NOT NULL,
  product_id text,
  price_id text,
  amount_total decimal NOT NULL,
  rollover_credit decimal DEFAULT 0,
  skip_discount decimal DEFAULT 0,

  -- Return state (for mid-build purchases)
  return_state jsonb,
  -- Example: { "sessionId": "abc", "currentStep": 3, "scrollPosition": 500 }

  -- Status
  status text DEFAULT 'pending', -- 'pending', 'completed', 'expired', 'canceled'
  payment_intent_id text,

  -- Timestamps
  created_at timestamp DEFAULT now(),
  completed_at timestamp,
  expires_at timestamp
);

-- ============================================
-- STEP 2: UPDATE USERS TABLE (AI Credits & Purchase Tracking)
-- ============================================

DO $$
BEGIN
  -- Total AI credits purchased (USER-LEVEL, not session-level)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='total_ai_credits'
  ) THEN
    ALTER TABLE users ADD COLUMN total_ai_credits integer DEFAULT 0;
  END IF;

  -- AI credits used (across all sessions)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='used_ai_credits'
  ) THEN
    ALTER TABLE users ADD COLUMN used_ai_credits integer DEFAULT 0;
  END IF;

  -- Available credits (computed column)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='available_ai_credits'
  ) THEN
    ALTER TABLE users ADD COLUMN available_ai_credits integer GENERATED ALWAYS AS (total_ai_credits - used_ai_credits) STORED;
  END IF;

  -- Total spent (for rollover calculations)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='total_spent'
  ) THEN
    ALTER TABLE users ADD COLUMN total_spent decimal DEFAULT 0;
  END IF;

  -- Highest tier purchased
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='highest_tier_purchased'
  ) THEN
    ALTER TABLE users ADD COLUMN highest_tier_purchased text;
  END IF;

  -- Referral code (if not exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='referral_code'
  ) THEN
    ALTER TABLE users ADD COLUMN referral_code text UNIQUE;
  END IF;

  -- Referred by code
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='referred_by_code'
  ) THEN
    ALTER TABLE users ADD COLUMN referred_by_code text;
  END IF;
END $$;

-- ============================================
-- STEP 3: UPDATE DEMO_SESSIONS TABLE
-- ============================================

DO $$
BEGIN
  -- Add user_id to link demo sessions to users table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='demo_sessions' AND column_name='user_id'
  ) THEN
    ALTER TABLE demo_sessions ADD COLUMN user_id uuid REFERENCES users(id);
    RAISE NOTICE 'Added user_id to demo_sessions';
  END IF;
END $$;

-- ============================================
-- STEP 4: UPDATE OTHER TABLES
-- ============================================

-- Add auto-approval fields to template_submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='template_submissions' AND column_name='auto_approval_eligible'
  ) THEN
    ALTER TABLE template_submissions ADD COLUMN auto_approval_eligible boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='template_submissions' AND column_name='auto_approval_reason'
  ) THEN
    ALTER TABLE template_submissions ADD COLUMN auto_approval_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='template_submissions' AND column_name='quality_checks'
  ) THEN
    ALTER TABLE template_submissions ADD COLUMN quality_checks jsonb;
  END IF;
END $$;

-- Add season dates to contest_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='contest_entries' AND column_name='season_start_date'
  ) THEN
    ALTER TABLE contest_entries ADD COLUMN season_start_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='contest_entries' AND column_name='season_end_date'
  ) THEN
    ALTER TABLE contest_entries ADD COLUMN season_end_date date;
  END IF;
END $$;

-- Add commission rate to referrals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='referrals' AND column_name='commission_rate'
  ) THEN
    ALTER TABLE referrals ADD COLUMN commission_rate decimal DEFAULT 0.10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='referrals' AND column_name='minimum_payout'
  ) THEN
    ALTER TABLE referrals ADD COLUMN minimum_payout decimal DEFAULT 100.00;
  END IF;
END $$;

-- ============================================
-- STEP 5: MIGRATE AI CREDITS FROM SESSION TO USER LEVEL
-- ============================================

-- Migrate existing session-level AI credits to user-level
DO $$
DECLARE
  session_record RECORD;
  user_id_var uuid;
BEGIN
  RAISE NOTICE 'Migrating AI credits from session-level to user-level...';

  -- Loop through all demo_sessions with AI credits
  FOR session_record IN
    SELECT
      user_email,
      ai_credits_total,
      ai_credits_used
    FROM demo_sessions
    WHERE user_email IS NOT NULL
    AND (ai_credits_total > 0 OR ai_credits_used > 0)
  LOOP
    -- Get or create user
    INSERT INTO users (email, total_ai_credits, used_ai_credits)
    VALUES (
      session_record.user_email,
      COALESCE(session_record.ai_credits_total, 0),
      COALESCE(session_record.ai_credits_used, 0)
    )
    ON CONFLICT (email) DO UPDATE SET
      total_ai_credits = users.total_ai_credits + COALESCE(session_record.ai_credits_total, 0),
      used_ai_credits = users.used_ai_credits + COALESCE(session_record.ai_credits_used, 0),
      updated_at = now();
  END LOOP;

  RAISE NOTICE 'AI credits migration complete';
END $$;

-- ============================================
-- STEP 6: BACKFILL EXISTING DATA
-- ============================================

-- Link existing demo_sessions to users via user_id
UPDATE demo_sessions
SET user_id = (
  SELECT id FROM users WHERE email = demo_sessions.user_email
)
WHERE user_email IS NOT NULL
AND user_id IS NULL;

-- Generate referral codes for existing users who don't have them
UPDATE users
SET referral_code = upper(substring(md5(email || random()::text) from 1 for 8))
WHERE referral_code IS NULL
AND email IS NOT NULL;

-- Create referral entries for users with codes
INSERT INTO referrals (user_email, referral_code, commission_rate, minimum_payout)
SELECT
  email,
  referral_code,
  0.10,
  100.00
FROM users
WHERE referral_code IS NOT NULL
ON CONFLICT (referral_code) DO NOTHING;

-- Update users.total_spent from user_purchases
UPDATE users
SET total_spent = (
  SELECT COALESCE(SUM(amount_paid), 0)
  FROM user_purchases
  WHERE user_purchases.user_email = users.email
)
WHERE EXISTS (
  SELECT 1 FROM user_purchases WHERE user_purchases.user_email = users.email
);

-- ============================================
-- STEP 7: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ai_logs_user_email ON ai_interaction_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_session ON ai_interaction_logs(demo_session_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_interaction_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_interaction_logs(interaction_type);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_session ON email_logs(demo_session_id);

CREATE INDEX IF NOT EXISTS idx_stripe_sessions_stripe_id ON stripe_checkout_sessions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_user_email ON stripe_checkout_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_user_id ON stripe_checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_status ON stripe_checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_created ON stripe_checkout_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_user_id ON demo_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_user_email ON demo_sessions(user_email);

-- ============================================
-- STEP 8: CREATE FUNCTIONS
-- ============================================

-- Function: Update user AI credits
CREATE OR REPLACE FUNCTION update_user_ai_credits(
  user_email_param text,
  credits_to_add integer
)
RETURNS void AS $$
DECLARE
  user_id_var uuid;
BEGIN
  -- Get or create user
  INSERT INTO users (email, total_ai_credits)
  VALUES (user_email_param, credits_to_add)
  ON CONFLICT (email)
  DO UPDATE SET
    total_ai_credits = users.total_ai_credits + credits_to_add,
    updated_at = now()
  RETURNING id INTO user_id_var;

  -- Log the credit addition
  RAISE NOTICE 'Added % AI credits to user %', credits_to_add, user_email_param;
END;
$$ LANGUAGE plpgsql;

-- Function: Use AI credits (USER-LEVEL)
CREATE OR REPLACE FUNCTION use_ai_credit(
  user_email_param text,
  credits_to_use integer DEFAULT 1
)
RETURNS boolean AS $$
DECLARE
  available_credits integer;
  user_id_var uuid;
BEGIN
  -- Get user and check credits
  SELECT id, available_ai_credits
  INTO user_id_var, available_credits
  FROM users
  WHERE email = user_email_param;

  -- User doesn't exist - no credits
  IF user_id_var IS NULL THEN
    RETURN false;
  END IF;

  -- Not enough credits
  IF available_credits < credits_to_use THEN
    RETURN false;
  END IF;

  -- Deduct credits
  UPDATE users
  SET
    used_ai_credits = used_ai_credits + credits_to_use,
    updated_at = now()
  WHERE id = user_id_var;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function: Get user AI credits
CREATE OR REPLACE FUNCTION get_user_ai_credits(user_email_param text)
RETURNS TABLE(
  total integer,
  used integer,
  available integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    total_ai_credits,
    used_ai_credits,
    available_ai_credits
  FROM users
  WHERE email = user_email_param;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate referral commission
CREATE OR REPLACE FUNCTION calculate_referral_commission(
  purchase_amount decimal,
  referral_code_param text
)
RETURNS decimal AS $$
DECLARE
  commission_rate_val decimal;
  commission_amount decimal;
BEGIN
  -- Get commission rate (default 10%)
  SELECT COALESCE(commission_rate, 0.10) INTO commission_rate_val
  FROM referrals
  WHERE referral_code = referral_code_param;

  -- If referral code not found, return 0
  IF commission_rate_val IS NULL THEN
    RETURN 0;
  END IF;

  -- Calculate commission
  commission_amount := purchase_amount * commission_rate_val;

  RETURN commission_amount;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_email text)
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate code from email hash + random
    code := upper(substring(md5(user_email || random()::text) from 1 for 8));

    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;

    EXIT WHEN NOT exists;
  END LOOP;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function: Update user total spent
CREATE OR REPLACE FUNCTION update_user_total_spent(
  user_email_param text,
  amount_param decimal
)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET
    total_spent = total_spent + amount_param,
    updated_at = now()
  WHERE email = user_email_param;
END;
$$ LANGUAGE plpgsql;

-- Function: Log AI interaction
CREATE OR REPLACE FUNCTION log_ai_interaction(
  p_user_email text,
  p_interaction_type text,
  p_prompt text,
  p_response text DEFAULT NULL,
  p_credits_used integer DEFAULT 1,
  p_demo_session_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  interaction_id uuid;
  user_id_var uuid;
BEGIN
  -- Get user_id
  SELECT id INTO user_id_var FROM users WHERE email = p_user_email;

  -- Insert log
  INSERT INTO ai_interaction_logs (
    user_email,
    user_id,
    interaction_type,
    prompt_sent,
    response_received,
    credits_used,
    demo_session_id
  ) VALUES (
    p_user_email,
    user_id_var,
    p_interaction_type,
    p_prompt,
    p_response,
    p_credits_used,
    p_demo_session_id
  ) RETURNING id INTO interaction_id;

  RETURN interaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 9: CREATE TRIGGERS
-- ============================================

-- Trigger: Auto-create user from demo session and link via user_id
CREATE OR REPLACE FUNCTION ensure_user_from_session()
RETURNS trigger AS $$
DECLARE
  user_id_var uuid;
BEGIN
  -- Create or get user
  INSERT INTO users (email, full_name)
  VALUES (NEW.user_email, NEW.business_name)
  ON CONFLICT (email) DO UPDATE
  SET updated_at = now()
  RETURNING id INTO user_id_var;

  -- Link session to user
  NEW.user_id := user_id_var;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_user_from_session ON demo_sessions;
CREATE TRIGGER create_user_from_session
  BEFORE INSERT ON demo_sessions
  FOR EACH ROW
  WHEN (NEW.user_email IS NOT NULL)
  EXECUTE FUNCTION ensure_user_from_session();

-- Trigger: Generate referral code on first purchase
CREATE OR REPLACE FUNCTION generate_referral_code_on_purchase()
RETURNS trigger AS $$
DECLARE
  new_code text;
BEGIN
  -- Generate referral code if user doesn't have one
  UPDATE users
  SET referral_code = generate_referral_code(NEW.user_email)
  WHERE email = NEW.user_email
  AND referral_code IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_generate_referral_code ON user_purchases;
CREATE TRIGGER auto_generate_referral_code
  AFTER INSERT ON user_purchases
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code_on_purchase();

-- Trigger: Update user total_spent on purchase
CREATE OR REPLACE FUNCTION update_total_spent_on_purchase()
RETURNS trigger AS $$
BEGIN
  UPDATE users
  SET
    total_spent = total_spent + NEW.amount_paid,
    updated_at = now()
  WHERE email = NEW.user_email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_update_total_spent ON user_purchases;
CREATE TRIGGER auto_update_total_spent
  AFTER INSERT ON user_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_total_spent_on_purchase();

-- ============================================
-- STEP 10: VERIFY MIGRATION
-- ============================================

DO $$
DECLARE
  ai_logs_count integer;
  email_logs_count integer;
  stripe_sessions_count integer;
  users_with_credits integer;
BEGIN
  -- Check new tables exist
  ASSERT (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='ai_interaction_logs')),
    'ai_interaction_logs table not created';
  ASSERT (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='email_logs')),
    'email_logs table not created';
  ASSERT (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='stripe_checkout_sessions')),
    'stripe_checkout_sessions table not created';

  -- Check users table has new columns
  ASSERT (SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='total_ai_credits')),
    'users.total_ai_credits not added';
  ASSERT (SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='used_ai_credits')),
    'users.used_ai_credits not added';
  ASSERT (SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referral_code')),
    'users.referral_code not added';

  -- Count migrated credits
  SELECT COUNT(*) INTO users_with_credits
  FROM users
  WHERE total_ai_credits > 0 OR used_ai_credits > 0;

  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'New tables created: 3';
  RAISE NOTICE '  • ai_interaction_logs';
  RAISE NOTICE '  • email_logs';
  RAISE NOTICE '  • stripe_checkout_sessions';
  RAISE NOTICE '';
  RAISE NOTICE 'Updated tables: 5';
  RAISE NOTICE '  • users (AI credits, referrals, spending)';
  RAISE NOTICE '  • demo_sessions (user_id link)';
  RAISE NOTICE '  • template_submissions (auto-approval)';
  RAISE NOTICE '  • contest_entries (season dates)';
  RAISE NOTICE '  • referrals (commission settings)';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions created: 8';
  RAISE NOTICE 'Triggers created: 3';
  RAISE NOTICE '';
  RAISE NOTICE 'Users with AI credits: %', users_with_credits;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================
-- MIGRATION COMPLETE! 🎉
-- ============================================
--
-- Key changes from original Phase 2A:
-- ✓ AI credits moved to user-level (not session-level)
-- ✓ Existing session credits migrated to users
-- ✓ Removed redundant demo_sessions AI tracking columns
-- ✓ Use ai_interaction_logs for detailed tracking
-- ✓ Properly links demo_sessions.user_id to users.id
--
-- Next steps:
-- 1. Update application code to use user-level AI credits
-- 2. Add environment variables:
--    - ANTHROPIC_API_KEY (already set)
--    - RESEND_API_KEY (already set)
--    - STRIPE_PRODUCT_* and STRIPE_PRICE_* IDs
-- 3. Test payment flow with new stripe_checkout_sessions
-- 4. Test AI credit tracking with ai_interaction_logs
--
-- ============================================
