-- Migration: AI-First Preview System
-- Adds support for component-based generation and email verification

-- Add new columns to demo_projects for component-based architecture
ALTER TABLE demo_projects
  ADD COLUMN IF NOT EXISTS generated_components JSONB,
  ADD COLUMN IF NOT EXISTS theme_settings JSONB,
  ADD COLUMN IF NOT EXISTS metadata JSONB,
  ADD COLUMN IF NOT EXISTS was_free_generation BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_credits_used INTEGER DEFAULT 0;

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  form_data JSONB,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups (removed NOW() from predicate as it's not immutable)
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_code
  ON verification_codes(email, code)
  WHERE NOT used;

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires
  ON verification_codes(expires_at);

-- Function to cleanup expired codes (run daily)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON TABLE verification_codes IS 'Email verification codes for AI preview generation gating';
COMMENT ON COLUMN demo_projects.generated_components IS 'JSON structure with header, hero, services, etc. components';
COMMENT ON COLUMN demo_projects.theme_settings IS 'Color scheme, fonts, and design tokens';
COMMENT ON COLUMN demo_projects.metadata IS 'Business name, headline, description from AI generation';
