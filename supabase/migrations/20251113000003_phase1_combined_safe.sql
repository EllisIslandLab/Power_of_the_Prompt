-- ============================================
-- PHASE 1: Safe Combined Migration
-- ============================================
-- This migration safely recreates all Phase 1 tables
-- Run this instead of the split cleanup/phase1 migrations if you encounter errors

-- Disable RLS temporarily
ALTER TABLE IF EXISTS demo_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS template_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contest_entries DISABLE ROW LEVEL SECURITY;

-- Drop all policies (safely ignore if they don't exist)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Admin full access demo_sessions" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Admin full access templates" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can create demo" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "View own sessions" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can submit templates" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "View approved templates" ON ' || quote_ident(r.tablename);
    END LOOP;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Drop all triggers
DROP TRIGGER IF EXISTS trigger_reset_demo_expiry_on_update ON demo_projects CASCADE;
DROP TRIGGER IF EXISTS trigger_update_session_activity ON demo_sessions CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS reset_demo_expiry_on_update() CASCADE;
DROP FUNCTION IF EXISTS use_download_token(text) CASCADE;
DROP FUNCTION IF EXISTS generate_download_token(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS increment_referral_clicks(text) CASCADE;
DROP FUNCTION IF EXISTS update_session_activity() CASCADE;

-- Drop all Phase 1 tables
DROP TABLE IF EXISTS download_tokens CASCADE;
DROP TABLE IF EXISTS demo_projects CASCADE;
DROP TABLE IF EXISTS component_ratings CASCADE;
DROP TABLE IF EXISTS component_versions CASCADE;
DROP TABLE IF EXISTS components CASCADE;
DROP TABLE IF EXISTS template_submissions CASCADE;
DROP TABLE IF EXISTS demo_sessions CASCADE;
DROP TABLE IF EXISTS contest_entries CASCADE;
DROP TABLE IF EXISTS referral_clicks CASCADE;
DROP TABLE IF EXISTS referral_payouts CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS user_purchases CASCADE;
DROP TABLE IF EXISTS business_categories CASCADE;
DROP TABLE IF EXISTS boilerplate_versions CASCADE;

-- Now create everything fresh (no IF NOT EXISTS needed since we just dropped everything)

-- ============================================
-- CREATE TABLES
-- ============================================

CREATE TABLE boilerplate_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_number text NOT NULL,
  github_repo_url text NOT NULL,
  github_commit_sha text NOT NULL,
  nextjs_version text NOT NULL,
  release_notes text,
  is_current boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

CREATE TABLE business_categories (
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

CREATE TABLE components (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  business_category_tags text[],
  current_version_id uuid,
  total_uses integer DEFAULT 0,
  average_rating decimal DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE TABLE component_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id uuid REFERENCES components(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  created_by_email text NOT NULL,
  created_by_name text,
  change_type text NOT NULL,
  change_description text,
  component_code text NOT NULL,
  css_styles text,
  required_props jsonb,
  was_ai_generated boolean DEFAULT false,
  ai_prompt_used text,
  ai_credits_spent integer DEFAULT 0,
  preview_screenshot_url text,
  preview_html text,
  status text DEFAULT 'pending',
  reviewed_by text,
  reviewed_at timestamp,
  quality_score integer,
  review_notes text,
  is_contest_entry boolean DEFAULT false,
  times_used integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  UNIQUE(component_id, version_number)
);

CREATE TABLE component_ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_version_id uuid REFERENCES component_versions(id) ON DELETE CASCADE,
  rated_by_email text NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  feedback text,
  created_at timestamp DEFAULT now(),
  UNIQUE(component_version_id, rated_by_email)
);

CREATE TABLE template_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp DEFAULT now(),
  submitted_by_email text NOT NULL,
  submitted_by_name text,
  template_name text NOT NULL,
  business_category_id uuid REFERENCES business_categories(id),
  components jsonb NOT NULL,
  page_structure jsonb NOT NULL,
  metadata jsonb NOT NULL,
  preview_html text NOT NULL,
  preview_screenshot_url text,
  boilerplate_version_id uuid REFERENCES boilerplate_versions(id),
  was_ai_generated boolean DEFAULT false,
  ai_prompts_used jsonb,
  ai_credits_spent integer DEFAULT 0,
  status text DEFAULT 'pending',
  reviewed_by text,
  reviewed_at timestamp,
  quality_score integer,
  review_notes text,
  is_contest_entry boolean DEFAULT false,
  contest_type text,
  version_number integer DEFAULT 1,
  replaces_template_id uuid REFERENCES template_submissions(id),
  is_featured boolean DEFAULT false
);

CREATE TABLE demo_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp DEFAULT now(),
  last_activity timestamp DEFAULT now(),
  user_email text NOT NULL,
  business_name text,
  builder_type text NOT NULL,
  ai_premium_paid boolean DEFAULT false,
  ai_premium_payment_intent text,
  current_step integer DEFAULT 1,
  form_data jsonb,
  selected_components jsonb,
  ai_credits_total integer DEFAULT 0,
  ai_credits_used integer DEFAULT 0,
  ai_interactions jsonb,
  generated_template_id uuid REFERENCES template_submissions(id),
  preview_html text,
  purchased_tier text,
  total_paid decimal DEFAULT 0,
  rollover_credit decimal DEFAULT 0,
  skip_discount_applied boolean DEFAULT false,
  status text DEFAULT 'building'
);

CREATE TABLE contest_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text NOT NULL,
  contest_type text NOT NULL,
  contest_season text NOT NULL,
  total_entries integer DEFAULT 0,
  submissions jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_email, contest_type, contest_season)
);

CREATE TABLE referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text UNIQUE NOT NULL,
  referral_code text UNIQUE NOT NULL,
  total_clicks integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  total_earnings decimal DEFAULT 0,
  pending_payout decimal DEFAULT 0,
  paid_out decimal DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

CREATE TABLE referral_clicks (
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

CREATE TABLE referral_payouts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code text NOT NULL,
  amount decimal NOT NULL,
  payout_method text,
  payout_email text,
  status text DEFAULT 'pending',
  processed_at timestamp,
  created_at timestamp DEFAULT now()
);

CREATE TABLE user_purchases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text NOT NULL,
  tier text NOT NULL,
  amount_paid decimal NOT NULL,
  stripe_payment_intent_id text,
  previous_tier text,
  rollover_credit decimal DEFAULT 0,
  skip_discount_applied boolean DEFAULT false,
  demo_session_id uuid REFERENCES demo_sessions(id),
  referral_code text,
  created_at timestamp DEFAULT now()
);

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO boilerplate_versions (version_number, github_repo_url, github_commit_sha, nextjs_version, is_current, release_notes)
VALUES ('1.0.0', 'https://github.com/weblaunchacademy/nextjs-boilerplate', 'main', '15.0.0', true, 'Initial boilerplate with Web Launch Academy badge');

INSERT INTO business_categories (name, slug, description, icon, suggested_components, display_order) VALUES
('Personal Finance', 'personal-finance', 'For financial coaches, advisors, and Ramsey Preferred Coaches', '💰',
 '["budget_calculator", "debt_tracker", "mortgage_calculator", "booking_calendar", "email_signup", "contact_form", "testimonials"]', 1);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_components_category ON components(category);
CREATE INDEX idx_component_versions_status ON component_versions(status);
CREATE INDEX idx_component_versions_quality ON component_versions(quality_score DESC);
CREATE INDEX idx_template_submissions_status ON template_submissions(status);
CREATE INDEX idx_template_submissions_category ON template_submissions(business_category_id);
CREATE INDEX idx_demo_sessions_email ON demo_sessions(user_email);
CREATE INDEX idx_demo_sessions_status ON demo_sessions(status);
CREATE INDEX idx_contest_entries_lookup ON contest_entries(user_email, contest_season);
CREATE INDEX idx_referral_clicks_code ON referral_clicks(referral_code);

-- ============================================
-- ENABLE RLS
-- ============================================

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

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Boilerplate versions
CREATE POLICY "Public read boilerplate" ON boilerplate_versions FOR SELECT USING (true);
CREATE POLICY "Admin manage boilerplate" ON boilerplate_versions FOR ALL USING (
  CASE WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com' ELSE false END
);

-- Business categories
CREATE POLICY "Public read categories" ON business_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage categories" ON business_categories FOR ALL USING (
  CASE WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com' ELSE false END
);

-- Components
CREATE POLICY "Public read components" ON components FOR SELECT USING (true);
CREATE POLICY "Anyone create components" ON components FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage components" ON components FOR UPDATE USING (
  CASE WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com' ELSE false END
);

-- Component versions
CREATE POLICY "Public read approved component versions" ON component_versions FOR SELECT
  USING (status = 'approved' OR auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com');
CREATE POLICY "Anyone create component versions" ON component_versions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage component versions" ON component_versions FOR UPDATE USING (
  CASE WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com' ELSE false END
);

-- Component ratings
CREATE POLICY "Create component ratings" ON component_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "View component ratings" ON component_ratings FOR SELECT USING (true);

-- Template submissions
CREATE POLICY "Admin full access templates" ON template_submissions FOR ALL USING (
  CASE WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com' ELSE false END
);
CREATE POLICY "Anyone can submit templates" ON template_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "View approved templates" ON template_submissions FOR SELECT
  USING (status = 'approved' OR auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com');

-- Demo sessions
CREATE POLICY "Admin full access demo_sessions" ON demo_sessions FOR ALL USING (
  CASE WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com' ELSE false END
);
CREATE POLICY "Anyone can create demo" ON demo_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "View own sessions" ON demo_sessions FOR SELECT USING (
  user_email = COALESCE(auth.jwt() ->> 'email', user_email) OR
  auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
);

-- Referrals
CREATE POLICY "View own referrals" ON referrals FOR SELECT USING (
  user_email = COALESCE(auth.jwt() ->> 'email', user_email) OR
  auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
);
CREATE POLICY "Create referrals" ON referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage referrals" ON referrals FOR ALL USING (
  CASE WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com' ELSE false END
);

-- Referral clicks
CREATE POLICY "Track referral clicks" ON referral_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin view clicks" ON referral_clicks FOR SELECT USING (
  CASE WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com' ELSE false END
);

-- Referral payouts
CREATE POLICY "Admin manage payouts" ON referral_payouts FOR ALL USING (
  CASE WHEN auth.jwt() IS NOT NULL THEN auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com' ELSE false END
);

-- User purchases
CREATE POLICY "View own purchases" ON user_purchases FOR SELECT USING (
  user_email = COALESCE(auth.jwt() ->> 'email', user_email) OR
  auth.jwt() ->> 'email' = 'hello@weblaunchacademy.com'
);
CREATE POLICY "Track purchases" ON user_purchases FOR INSERT WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION increment_referral_clicks(code text)
RETURNS void AS $$
BEGIN
  UPDATE referrals SET total_clicks = total_clicks + 1 WHERE referral_code = code;
END;
$$ LANGUAGE plpgsql;

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
