-- ============================================
-- PHASE 1: Component-Based Demo Builder Schema
-- ============================================
-- Web Launch Academy - Revolutionary component-based website builder
-- with AI enhancement, contest gamification, and referral system

-- NOTE: The cleanup migration (20251113000001) should run first
-- to drop all existing tables. This migration creates them fresh.

-- ============================================
-- BOILERPLATE VERSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS boilerplate_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_number text NOT NULL,
  github_repo_url text NOT NULL,
  github_commit_sha text NOT NULL,
  nextjs_version text NOT NULL,
  release_notes text,
  is_current boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Seed initial version
INSERT INTO boilerplate_versions (version_number, github_repo_url, github_commit_sha, nextjs_version, is_current, release_notes)
VALUES ('1.0.0', 'https://github.com/weblaunchacademy/nextjs-boilerplate', 'main', '15.0.0', true, 'Initial boilerplate with Web Launch Academy badge')
ON CONFLICT DO NOTHING;

-- ============================================
-- BUSINESS CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS business_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  suggested_components jsonb,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- Seed initial category
INSERT INTO business_categories (name, slug, description, icon, suggested_components, display_order) VALUES
('Personal Finance', 'personal-finance', 'For financial coaches, advisors, and Ramsey Preferred Coaches', '💰',
 '["budget_calculator", "debt_tracker", "mortgage_calculator", "booking_calendar", "email_signup", "contact_form", "testimonials"]', 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMPONENT LIBRARY
-- ============================================

CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  component_name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  icon text NOT NULL,

  -- Categorization
  category text NOT NULL,
  business_category_tags text[],

  -- Current version (points to latest approved)
  current_version_id uuid,

  -- Metadata
  total_uses integer DEFAULT 0,
  average_rating decimal DEFAULT 0,

  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS component_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id uuid REFERENCES components(id) ON DELETE CASCADE,

  -- Version info
  version_number integer NOT NULL,
  created_by_email text NOT NULL,
  created_by_name text,

  -- What changed
  change_type text NOT NULL,
  change_description text,

  -- The actual component code
  component_code text NOT NULL,
  css_styles text,
  required_props jsonb,

  -- AI metadata
  was_ai_generated boolean DEFAULT false,
  ai_prompt_used text,
  ai_credits_spent integer DEFAULT 0,

  -- Preview assets
  preview_screenshot_url text,
  preview_html text,

  -- Review status
  status text DEFAULT 'pending',
  reviewed_by text,
  reviewed_at timestamp,
  quality_score integer,
  review_notes text,

  -- Contest entry
  is_contest_entry boolean DEFAULT false,

  -- Usage tracking
  times_used integer DEFAULT 0,

  created_at timestamp DEFAULT now(),

  UNIQUE(component_id, version_number)
);

CREATE TABLE IF NOT EXISTS component_ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_version_id uuid REFERENCES component_versions(id) ON DELETE CASCADE,
  rated_by_email text NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  feedback text,
  created_at timestamp DEFAULT now(),
  UNIQUE(component_version_id, rated_by_email)
);

-- ============================================
-- TEMPLATE SUBMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS template_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp DEFAULT now(),

  -- User info
  submitted_by_email text NOT NULL,
  submitted_by_name text,

  -- Template identity
  template_name text NOT NULL,
  business_category_id uuid REFERENCES business_categories(id),

  -- Component-based structure
  components jsonb NOT NULL,
  page_structure jsonb NOT NULL,
  metadata jsonb NOT NULL,

  -- Preview (static HTML for fast display)
  preview_html text NOT NULL,
  preview_screenshot_url text,

  -- Boilerplate version used
  boilerplate_version_id uuid REFERENCES boilerplate_versions(id),

  -- AI metadata
  was_ai_generated boolean DEFAULT false,
  ai_prompts_used jsonb,
  ai_credits_spent integer DEFAULT 0,

  -- Review status
  status text DEFAULT 'pending',
  reviewed_by text,
  reviewed_at timestamp,
  quality_score integer,
  review_notes text,

  -- Contest tracking
  is_contest_entry boolean DEFAULT false,
  contest_type text,

  -- Versioning
  version_number integer DEFAULT 1,
  replaces_template_id uuid REFERENCES template_submissions(id),

  is_featured boolean DEFAULT false
);

-- ============================================
-- DEMO SESSIONS (User Building Process)
-- ============================================

CREATE TABLE IF NOT EXISTS demo_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp DEFAULT now(),
  last_activity timestamp DEFAULT now(),

  -- User info
  user_email text NOT NULL,
  business_name text,

  -- Builder choice
  builder_type text NOT NULL,
  ai_premium_paid boolean DEFAULT false,
  ai_premium_payment_intent text,

  -- Form progress
  current_step integer DEFAULT 1,
  form_data jsonb,
  selected_components jsonb,

  -- AI tracking
  ai_credits_total integer DEFAULT 0,
  ai_credits_used integer DEFAULT 0,
  ai_interactions jsonb,

  -- Generated outputs
  generated_template_id uuid REFERENCES template_submissions(id),
  preview_html text,

  -- Payment tracking
  purchased_tier text,
  total_paid decimal DEFAULT 0,
  rollover_credit decimal DEFAULT 0,
  skip_discount_applied boolean DEFAULT false,

  -- State
  status text DEFAULT 'building'
);

-- ============================================
-- CONTEST ENTRIES
-- ============================================

CREATE TABLE IF NOT EXISTS contest_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text NOT NULL,
  contest_type text NOT NULL,
  contest_season text NOT NULL,

  -- Entry tracking
  total_entries integer DEFAULT 0,
  submissions jsonb,

  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  UNIQUE(user_email, contest_type, contest_season)
);

-- ============================================
-- REFERRAL SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text UNIQUE NOT NULL,
  referral_code text UNIQUE NOT NULL,

  -- Stats
  total_clicks integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  total_earnings decimal DEFAULT 0,
  pending_payout decimal DEFAULT 0,
  paid_out decimal DEFAULT 0,

  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_clicks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code text NOT NULL,

  clicked_at timestamp DEFAULT now(),
  source_domain text,
  user_ip text,
  user_agent text,

  converted boolean DEFAULT false,
  conversion_tier text,
  conversion_amount decimal,
  commission_earned decimal
);

CREATE TABLE IF NOT EXISTS referral_payouts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code text NOT NULL,

  amount decimal NOT NULL,
  payout_method text,
  payout_email text,

  status text DEFAULT 'pending',
  processed_at timestamp,

  created_at timestamp DEFAULT now()
);

-- ============================================
-- USER PURCHASES (Track Purchase Journey)
-- ============================================

CREATE TABLE IF NOT EXISTS user_purchases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text NOT NULL,

  -- Purchase details
  tier text NOT NULL,
  amount_paid decimal NOT NULL,
  stripe_payment_intent_id text,

  -- Rollover tracking
  previous_tier text,
  rollover_credit decimal DEFAULT 0,
  skip_discount_applied boolean DEFAULT false,

  -- Delivered assets
  demo_session_id uuid REFERENCES demo_sessions(id),
  referral_code text,

  created_at timestamp DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_components_category ON components(category);
CREATE INDEX IF NOT EXISTS idx_component_versions_status ON component_versions(status);
CREATE INDEX IF NOT EXISTS idx_component_versions_quality ON component_versions(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_template_submissions_status ON template_submissions(status);
CREATE INDEX IF NOT EXISTS idx_template_submissions_category ON template_submissions(business_category_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_email ON demo_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_status ON demo_sessions(status);
CREATE INDEX IF NOT EXISTS idx_contest_entries_lookup ON contest_entries(user_email, contest_season);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(referral_code);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE boilerplate_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin full access demo_sessions" ON demo_sessions;
DROP POLICY IF EXISTS "Admin full access templates" ON template_submissions;
DROP POLICY IF EXISTS "Anyone can create demo" ON demo_sessions;
DROP POLICY IF EXISTS "View own sessions" ON demo_sessions;
DROP POLICY IF EXISTS "Anyone can submit templates" ON template_submissions;
DROP POLICY IF EXISTS "View approved templates" ON template_submissions;

-- Admin full access
CREATE POLICY "Admin full access demo_sessions" ON demo_sessions
  FOR ALL USING (
    CASE
      WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
      ELSE false
    END
  );

CREATE POLICY "Admin full access templates" ON template_submissions
  FOR ALL USING (
    CASE
      WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
      ELSE false
    END
  );

-- Users can insert demo sessions (anonymous)
CREATE POLICY "Anyone can create demo" ON demo_sessions
  FOR INSERT WITH CHECK (true);

-- Users can view their own sessions
CREATE POLICY "View own sessions" ON demo_sessions
  FOR SELECT USING (
    user_email = COALESCE(auth.jwt() ->> 'email', user_email) OR
    auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
  );

-- Users can submit templates
CREATE POLICY "Anyone can submit templates" ON template_submissions
  FOR INSERT WITH CHECK (true);

-- Everyone can view approved templates
CREATE POLICY "View approved templates" ON template_submissions
  FOR SELECT USING (status = 'approved' OR auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com');

-- ============================================
-- Additional RLS Policies for Security
-- ============================================

-- Boilerplate versions - read-only for everyone, admin can modify
CREATE POLICY "Public read boilerplate" ON boilerplate_versions
  FOR SELECT USING (true);

CREATE POLICY "Admin manage boilerplate" ON boilerplate_versions
  FOR ALL USING (
    CASE
      WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
      ELSE false
    END
  );

-- Business categories - read-only for everyone, admin can modify
CREATE POLICY "Public read categories" ON business_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage categories" ON business_categories
  FOR ALL USING (
    CASE
      WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
      ELSE false
    END
  );

-- Components - everyone can read, anyone can create, admin can modify
CREATE POLICY "Public read components" ON components
  FOR SELECT USING (true);

CREATE POLICY "Anyone create components" ON components
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage components" ON components
  FOR UPDATE USING (
    CASE
      WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
      ELSE false
    END
  );

-- Component versions - everyone can read approved, anyone can create, admin reviews
CREATE POLICY "Public read approved component versions" ON component_versions
  FOR SELECT USING (status = 'approved' OR auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com');

CREATE POLICY "Anyone create component versions" ON component_versions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage component versions" ON component_versions
  FOR UPDATE USING (
    CASE
      WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
      ELSE false
    END
  );

-- Component ratings - users can create and view their own ratings
CREATE POLICY "Create component ratings" ON component_ratings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "View component ratings" ON component_ratings
  FOR SELECT USING (true);

-- Referrals - users can view their own, create their own
CREATE POLICY "View own referrals" ON referrals
  FOR SELECT USING (
    user_email = COALESCE(auth.jwt() ->> 'email', user_email) OR
    auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
  );

CREATE POLICY "Create referrals" ON referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage referrals" ON referrals
  FOR ALL USING (
    CASE
      WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
      ELSE false
    END
  );

-- Referral clicks - public insert, admin view
CREATE POLICY "Track referral clicks" ON referral_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin view clicks" ON referral_clicks
  FOR SELECT USING (
    CASE
      WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
      ELSE false
    END
  );

-- Referral payouts - admin only
CREATE POLICY "Admin manage payouts" ON referral_payouts
  FOR ALL USING (
    CASE
      WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
      ELSE false
    END
  );

-- User purchases - users can view their own, admin can view all
CREATE POLICY "View own purchases" ON user_purchases
  FOR SELECT USING (
    user_email = COALESCE(auth.jwt() ->> 'email', user_email) OR
    auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
  );

CREATE POLICY "Track purchases" ON user_purchases
  FOR INSERT WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to increment referral clicks
CREATE OR REPLACE FUNCTION increment_referral_clicks(code text)
RETURNS void AS $$
BEGIN
  UPDATE referrals
  SET total_clicks = total_clicks + 1
  WHERE referral_code = code;
END;
$$ LANGUAGE plpgsql;

-- Function to update demo session activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_activity
  BEFORE UPDATE ON demo_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();
