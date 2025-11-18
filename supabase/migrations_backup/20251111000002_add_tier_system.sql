-- Tier System and Download Magic Links Migration
-- This migration adds comprehensive tier-based access control

-- =======================
-- UPDATE USERS TABLE FOR NEW TIER SYSTEM
-- =======================

-- First, update the tier constraint to include new tiers
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tier_check;
ALTER TABLE users ADD CONSTRAINT users_tier_check CHECK (
  tier IN ('basic', 'premium', 'vip', 'enterprise', 'tier1', 'tier2', 'tier3', 'tier4')
);

-- Add modification tracking for AI customization limits
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_modifications_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_modifications_limit INTEGER DEFAULT 0;

-- Update tier mappings and limits
-- Tier 1: Code download, 20 AI mods, Textbook
-- Tier 2: Tier 1 + Recordings
-- Tier 3: Tier 2 + Group course, 1 LVL UP, Basic check-ins
-- Tier 4: Tier 3 + Guaranteed website, 10 LVL UPs lifetime, Master Architecture Toolkit

COMMENT ON COLUMN users.tier IS 'User tier: tier1 (Code+20 AI mods+Textbook), tier2 (+Recordings), tier3 (+Group+1 LVL UP), tier4 (+Website+10 LVL UPs+Toolkit)';
COMMENT ON COLUMN users.ai_modifications_used IS 'Number of AI modifications used';
COMMENT ON COLUMN users.ai_modifications_limit IS 'Maximum AI modifications allowed (20 for tier1+, unlimited for tier3+)';

-- =======================
-- MAGIC DOWNLOAD TOKENS TABLE
-- =======================

CREATE TABLE IF NOT EXISTS download_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  demo_project_id UUID NOT NULL REFERENCES demo_projects(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,

  -- Token metadata
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_token_format CHECK (length(token) >= 32)
);

CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_demo_project_id ON download_tokens(demo_project_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires_at ON download_tokens(expires_at);

COMMENT ON TABLE download_tokens IS 'Magic links for secure code downloads without authentication';
COMMENT ON COLUMN download_tokens.token IS 'Unique secure token for download URL';
COMMENT ON COLUMN download_tokens.expires_at IS 'Download links expire after 7 days';
COMMENT ON COLUMN download_tokens.download_count IS 'Track how many times code was downloaded';

-- =======================
-- DEMO PROJECT ENHANCEMENTS
-- =======================

-- Link demo projects to user accounts when they sign up
ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS tier TEXT;
ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS ai_modifications_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_demo_projects_user_id ON demo_projects(user_id);

COMMENT ON COLUMN demo_projects.user_id IS 'Links demo to user account after they sign up (optional)';
COMMENT ON COLUMN demo_projects.tier IS 'Tier purchased for this demo (tier1, tier2, tier3, tier4)';
COMMENT ON COLUMN demo_projects.ai_modifications_count IS 'Number of AI modifications made to this demo';

-- =======================
-- ROW LEVEL SECURITY FOR DOWNLOAD TOKENS
-- =======================

ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;

-- Anyone can use a valid token to download
CREATE POLICY "Anyone can use valid download tokens"
  ON download_tokens
  FOR SELECT
  USING (expires_at > now());

-- Service role can create tokens
CREATE POLICY "Service role can create download tokens"
  ON download_tokens
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Service role can update tokens (mark as used)
CREATE POLICY "Service role can update download tokens"
  ON download_tokens
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Admins can view all tokens
CREATE POLICY "Admins can view all download tokens"
  ON download_tokens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =======================
-- HELPER FUNCTIONS
-- =======================

-- Function to generate secure download token
CREATE OR REPLACE FUNCTION generate_download_token(
  p_demo_project_id UUID,
  p_user_email TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Generate a secure random token (32 chars)
  v_token := encode(gen_random_bytes(24), 'base64');
  v_token := replace(v_token, '/', '_');
  v_token := replace(v_token, '+', '-');

  -- Insert token
  INSERT INTO download_tokens (token, demo_project_id, user_email)
  VALUES (v_token, p_demo_project_id, p_user_email);

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and use download token
CREATE OR REPLACE FUNCTION use_download_token(p_token TEXT)
RETURNS TABLE (
  demo_project_id UUID,
  user_email TEXT,
  is_valid BOOLEAN
) AS $$
DECLARE
  v_token_record RECORD;
BEGIN
  -- Get token details
  SELECT * INTO v_token_record
  FROM download_tokens
  WHERE token = p_token;

  -- Check if token exists and is valid
  IF v_token_record IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, false;
    RETURN;
  END IF;

  IF v_token_record.expires_at < now() THEN
    RETURN QUERY SELECT v_token_record.demo_project_id, v_token_record.user_email, false;
    RETURN;
  END IF;

  -- Mark token as used and increment download count
  UPDATE download_tokens
  SET used_at = now(),
      download_count = download_count + 1
  WHERE token = p_token;

  RETURN QUERY SELECT v_token_record.demo_project_id, v_token_record.user_email, true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can modify demo (within limits)
CREATE OR REPLACE FUNCTION can_user_modify_demo(
  p_demo_project_id UUID,
  p_user_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_demo RECORD;
  v_user RECORD;
BEGIN
  -- Get demo details
  SELECT * INTO v_demo
  FROM demo_projects
  WHERE id = p_demo_project_id AND user_email = p_user_email;

  IF v_demo IS NULL THEN
    RETURN false;
  END IF;

  -- Check if linked to user account
  IF v_demo.user_id IS NOT NULL THEN
    SELECT * INTO v_user FROM users WHERE id = v_demo.user_id;

    -- Tier 3 and 4 have unlimited modifications
    IF v_user.tier IN ('tier3', 'tier4', 'vip', 'enterprise') THEN
      RETURN true;
    END IF;

    -- Tier 1 and 2 have 20 modification limit
    IF v_user.tier IN ('tier1', 'tier2', 'premium') THEN
      RETURN v_user.ai_modifications_used < v_user.ai_modifications_limit;
    END IF;
  END IF;

  -- For non-account users, check demo-level limit
  -- After purchase but before account creation
  IF v_demo.tier IN ('tier1', 'tier2') THEN
    RETURN v_demo.ai_modifications_count < 20;
  END IF;

  IF v_demo.tier IN ('tier3', 'tier4') THEN
    RETURN true;
  END IF;

  -- Default: no modifications allowed
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment modification count
CREATE OR REPLACE FUNCTION increment_modification_count(
  p_demo_project_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_demo RECORD;
BEGIN
  SELECT * INTO v_demo FROM demo_projects WHERE id = p_demo_project_id;

  -- Increment demo-level count
  UPDATE demo_projects
  SET ai_modifications_count = ai_modifications_count + 1
  WHERE id = p_demo_project_id;

  -- If linked to user, increment user count
  IF v_demo.user_id IS NOT NULL THEN
    UPDATE users
    SET ai_modifications_used = ai_modifications_used + 1
    WHERE id = v_demo.user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to link demo to user account
CREATE OR REPLACE FUNCTION link_demo_to_user(
  p_demo_project_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_demo RECORD;
  v_user RECORD;
BEGIN
  SELECT * INTO v_demo FROM demo_projects WHERE id = p_demo_project_id;
  SELECT * INTO v_user FROM users WHERE id = p_user_id;

  IF v_demo IS NULL OR v_user IS NULL THEN
    RETURN false;
  END IF;

  -- Link demo to user
  UPDATE demo_projects
  SET user_id = p_user_id
  WHERE id = p_demo_project_id;

  -- Transfer modification count to user
  UPDATE users
  SET
    ai_modifications_used = COALESCE(ai_modifications_used, 0) + COALESCE(v_demo.ai_modifications_count, 0),
    tier = COALESCE(v_demo.tier, tier)
  WHERE id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user tier permissions
CREATE OR REPLACE FUNCTION get_tier_permissions(p_tier TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN CASE p_tier
    WHEN 'tier1' THEN '{
      "code_download": true,
      "ai_modifications": 20,
      "textbook": true,
      "recordings": false,
      "group_course": false,
      "lvl_ups": 0,
      "guaranteed_website": false,
      "master_toolkit": false
    }'::jsonb
    WHEN p_tier IN ('tier2', 'premium') THEN '{
      "code_download": true,
      "ai_modifications": 20,
      "textbook": true,
      "recordings": true,
      "group_course": false,
      "lvl_ups": 0,
      "guaranteed_website": false,
      "master_toolkit": false
    }'::jsonb
    WHEN p_tier IN ('tier3', 'vip') THEN '{
      "code_download": true,
      "ai_modifications": -1,
      "textbook": true,
      "recordings": true,
      "group_course": true,
      "lvl_ups": 1,
      "guaranteed_website": false,
      "master_toolkit": false
    }'::jsonb
    WHEN p_tier IN ('tier4', 'enterprise') THEN '{
      "code_download": true,
      "ai_modifications": -1,
      "textbook": true,
      "recordings": true,
      "group_course": true,
      "lvl_ups": 10,
      "guaranteed_website": true,
      "master_toolkit": true
    }'::jsonb
    ELSE '{
      "code_download": false,
      "ai_modifications": 0,
      "textbook": false,
      "recordings": false,
      "group_course": false,
      "lvl_ups": 0,
      "guaranteed_website": false,
      "master_toolkit": false
    }'::jsonb
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =======================
-- TRIGGERS
-- =======================

-- Trigger to set AI modification limits when user tier changes
CREATE OR REPLACE FUNCTION set_ai_modification_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  v_permissions := get_tier_permissions(NEW.tier);

  -- Set limit (-1 means unlimited)
  IF (v_permissions->>'ai_modifications')::int = -1 THEN
    NEW.ai_modifications_limit := 999999; -- Effectively unlimited
  ELSE
    NEW.ai_modifications_limit := (v_permissions->>'ai_modifications')::int;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_ai_limits ON users;
CREATE TRIGGER trigger_set_ai_limits
  BEFORE INSERT OR UPDATE OF tier ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_ai_modification_limits();

-- =======================
-- COMMENTS
-- =======================

COMMENT ON FUNCTION generate_download_token(UUID, TEXT) IS 'Generate secure magic link token for code download';
COMMENT ON FUNCTION use_download_token(TEXT) IS 'Validate and mark download token as used';
COMMENT ON FUNCTION can_user_modify_demo(UUID, TEXT) IS 'Check if user has remaining AI modifications';
COMMENT ON FUNCTION increment_modification_count(UUID) IS 'Increment AI modification count for demo and user';
COMMENT ON FUNCTION link_demo_to_user(UUID, UUID) IS 'Link purchased demo to user account after signup';
COMMENT ON FUNCTION get_tier_permissions(TEXT) IS 'Get JSON object of permissions for a given tier';
