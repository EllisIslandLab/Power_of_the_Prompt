-- Migration: Clean up unused tables and implement points/attendance system
-- Date: 2025-10-23

-- ============================================================
-- PART 1: CLEANUP - Remove unused/empty tables
-- ============================================================

-- Drop old unused tables
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS sessions_with_users CASCADE;
DROP TABLE IF EXISTS video_sessions CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS waitlist CASCADE;

-- ============================================================
-- PART 2: POINTS & GAMIFICATION SYSTEM
-- ============================================================

-- Student points tracking (separate from users table)
CREATE TABLE student_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Point categories
  attendance_points INTEGER DEFAULT 0,
  engagement_points INTEGER DEFAULT 0, -- social shares, etc.
  referral_signup_points INTEGER DEFAULT 0, -- 2500 per signup (discount only)
  referral_cash_points INTEGER DEFAULT 0, -- convertible to cash
  bonus_points INTEGER DEFAULT 0, -- from achievements

  -- Computed total
  total_points INTEGER GENERATED ALWAYS AS (
    attendance_points + engagement_points + referral_signup_points +
    referral_cash_points + bonus_points
  ) STORED,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Badges/achievements
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_name TEXT NOT NULL UNIQUE,
  badge_description TEXT,
  badge_category TEXT, -- 'testing', 'attendance', 'social', 'referral', 'quality'
  points_value INTEGER DEFAULT 0,
  badge_tier TEXT, -- 'bronze', 'silver', 'gold'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student badge awards
CREATE TABLE student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  awarded_by UUID REFERENCES users(id), -- admin who awarded it
  notes TEXT,

  UNIQUE(user_id, badge_id) -- Can't earn same badge twice
);

-- Course sessions (for attendance tracking)
CREATE TABLE course_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  session_code TEXT UNIQUE, -- Generated code for check-in
  code_expires_at TIMESTAMPTZ,
  recording_url TEXT,
  recording_available_until TIMESTAMPTZ,
  live_points INTEGER DEFAULT 10,
  recording_points INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance log
CREATE TABLE attendance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  attendance_type TEXT NOT NULL CHECK (attendance_type IN ('live', 'recording')),
  points_awarded INTEGER NOT NULL,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  watch_duration_minutes INTEGER, -- for recordings

  UNIQUE(user_id, session_id) -- Can't check in twice to same session
);

-- Social media shares
CREATE TABLE social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram', 'facebook', 'other')),
  post_url TEXT NOT NULL,
  screenshot_url TEXT, -- stored in Supabase storage
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  points_awarded INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  reviewer_notes TEXT
);

-- Referral tracking (enhanced from existing invited_by)
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referee_email TEXT NOT NULL,

  -- Status tracking
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'paid', 'processed', 'held')),

  -- Points tracking
  signup_points_awarded INTEGER DEFAULT 2500,
  cash_convertible_points INTEGER DEFAULT 0,
  points_held_until TIMESTAMPTZ, -- 30 day hold after payment

  -- Purchase details
  purchase_amount NUMERIC(10,2),
  purchase_date TIMESTAMPTZ,
  tier_at_referral TEXT,
  cap_bypassed BOOLEAN DEFAULT FALSE, -- for Guarantee purchases

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ
);

-- Affiliate tiers configuration
CREATE TABLE affiliate_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,
  tier_level INTEGER NOT NULL UNIQUE,
  max_cash_per_referral NUMERIC(10,2) NOT NULL,
  percentage_bonus NUMERIC(5,2) NOT NULL, -- 5.00 for 5%
  purchase_count_limit INTEGER, -- null means unlimited
  spend_cap_for_bonus NUMERIC(10,2),
  total_cap_percentage NUMERIC(5,2) NOT NULL, -- 10.00 for 10%
  requirements_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 3: SEED DEFAULT DATA
-- ============================================================

-- Insert default affiliate tiers
INSERT INTO affiliate_tiers (tier_name, tier_level, max_cash_per_referral, percentage_bonus, purchase_count_limit, spend_cap_for_bonus, total_cap_percentage, requirements_description) VALUES
('Tier 1', 1, 50.00, 5.00, 1, NULL, 10.00, 'Default tier for all affiliates'),
('Tier 2', 2, 75.00, 7.00, 2, 2400.00, 12.00, 'Unlocked after 5 successful referrals or survey participation')
ON CONFLICT (tier_name) DO NOTHING;

-- Insert some default badges
INSERT INTO badges (badge_name, badge_description, badge_category, points_value, badge_tier) VALUES
('Perfect Attendance', 'Attended all live sessions in a month', 'attendance', 500, 'gold'),
('Early Bird', 'Attended first 3 live sessions', 'attendance', 100, 'bronze'),
('Social Butterfly', 'Shared 5 posts on social media', 'social', 250, 'silver'),
('First Referral', 'Successfully referred your first student', 'referral', 100, 'bronze'),
('Super Referrer', 'Successfully referred 5+ students', 'referral', 1000, 'gold'),
('Quality Code', 'Submitted high-quality project', 'quality', 300, 'silver')
ON CONFLICT (badge_name) DO NOTHING;

-- ============================================================
-- PART 4: ADD AFFILIATE TIER TO USERS
-- ============================================================

-- Add affiliate tier to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS affiliate_tier_id UUID REFERENCES affiliate_tiers(id);

-- Set default tier for existing users
UPDATE users
SET affiliate_tier_id = (SELECT id FROM affiliate_tiers WHERE tier_name = 'Tier 1')
WHERE affiliate_tier_id IS NULL;

-- ============================================================
-- PART 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_student_points_user ON student_points(user_id);
CREATE INDEX IF NOT EXISTS idx_student_points_total ON student_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_user_session ON attendance_log(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_log(session_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_status ON social_shares(status, user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_course_sessions_date ON course_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_student_badges_user ON student_badges(user_id);

-- ============================================================
-- PART 6: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE student_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_tiers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 7: CREATE RLS POLICIES
-- ============================================================

-- Student Points: Users can view their own, admins can manage all
CREATE POLICY "Users can view own points" ON student_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all points" ON student_points
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Badges: Everyone can view, only admins can manage
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage badges" ON badges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Student Badges: Users can view their own, admins can manage all
CREATE POLICY "Users can view own badges" ON student_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can award badges" ON student_badges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Course Sessions: Everyone can view, admins can manage
CREATE POLICY "Anyone can view sessions" ON course_sessions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage sessions" ON course_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Attendance Log: Users can view their own and insert, admins can manage all
CREATE POLICY "Users can view own attendance" ON attendance_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can check in" ON attendance_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage attendance" ON attendance_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Social Shares: Users can view/submit their own, admins can manage all
CREATE POLICY "Users can view own shares" ON social_shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit shares" ON social_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage shares" ON social_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Referrals: Users can view their own referrals, admins can manage all
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage referrals" ON referrals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Affiliate Tiers: Everyone can view, only admins can manage
CREATE POLICY "Anyone can view tiers" ON affiliate_tiers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tiers" ON affiliate_tiers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================================
-- PART 8: CREATE TRIGGERS
-- ============================================================

-- Trigger for student_points updated_at
CREATE TRIGGER update_student_points_updated_at
  BEFORE UPDATE ON student_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for course_sessions updated_at
CREATE TRIGGER update_course_sessions_updated_at
  BEFORE UPDATE ON course_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PART 9: CREATE RPC FUNCTIONS FOR POINT MANAGEMENT
-- ============================================================

-- RPC function to add attendance points
CREATE OR REPLACE FUNCTION add_attendance_points(p_user_id UUID, p_points INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO student_points (user_id, attendance_points)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id)
  DO UPDATE SET
    attendance_points = student_points.attendance_points + p_points,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to add engagement points
CREATE OR REPLACE FUNCTION add_engagement_points(p_user_id UUID, p_points INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO student_points (user_id, engagement_points)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id)
  DO UPDATE SET
    engagement_points = student_points.engagement_points + p_points,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to add referral signup points
CREATE OR REPLACE FUNCTION add_referral_signup_points(p_user_id UUID, p_points INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO student_points (user_id, referral_signup_points)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id)
  DO UPDATE SET
    referral_signup_points = student_points.referral_signup_points + p_points,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to add referral cash points
CREATE OR REPLACE FUNCTION add_referral_cash_points(p_user_id UUID, p_points INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO student_points (user_id, referral_cash_points)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id)
  DO UPDATE SET
    referral_cash_points = student_points.referral_cash_points + p_points,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to add bonus points
CREATE OR REPLACE FUNCTION add_bonus_points(p_user_id UUID, p_points INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO student_points (user_id, bonus_points)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id)
  DO UPDATE SET
    bonus_points = student_points.bonus_points + p_points,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PART 10: INITIALIZE POINTS FOR EXISTING USERS
-- ============================================================

-- Initialize student_points for existing users
INSERT INTO student_points (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- PART 11: MIGRATE EXISTING REFERRAL DATA
-- ============================================================

-- Migrate existing invited_by data to referrals table
INSERT INTO referrals (referrer_id, referee_id, referee_email, status, created_at)
SELECT
  u1.id as referrer_id,
  u2.id as referee_id,
  u2.email as referee_email,
  CASE
    WHEN u2.payment_status = 'paid' THEN 'paid'
    ELSE 'lead'
  END as status,
  COALESCE(u2.invited_at, u2.created_at) as created_at
FROM users u2
JOIN users u1 ON u2.invited_by = u1.id
WHERE u2.invited_by IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================
-- PART 12: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE student_points IS 'Tracks points earned by students across different categories';
COMMENT ON TABLE badges IS 'Defines available badges/achievements that can be earned';
COMMENT ON TABLE student_badges IS 'Records which badges have been awarded to which students';
COMMENT ON TABLE course_sessions IS 'Course sessions for attendance tracking';
COMMENT ON TABLE attendance_log IS 'Records student attendance at live sessions or recording views';
COMMENT ON TABLE social_shares IS 'Tracks social media shares submitted by students for engagement points';
COMMENT ON TABLE referrals IS 'Enhanced referral tracking with points and status management';
COMMENT ON TABLE affiliate_tiers IS 'Configuration for different affiliate commission tiers';

COMMENT ON COLUMN student_points.attendance_points IS 'Points earned from attending sessions';
COMMENT ON COLUMN student_points.engagement_points IS 'Points earned from social shares and engagement';
COMMENT ON COLUMN student_points.referral_signup_points IS 'Points from referrals (discount only)';
COMMENT ON COLUMN student_points.referral_cash_points IS 'Points from referrals (convertible to cash)';
COMMENT ON COLUMN student_points.bonus_points IS 'Bonus points from achievements/badges';
