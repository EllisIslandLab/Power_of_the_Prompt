-- ============================================================
-- CREATE INVITE TOKENS TABLE
-- ============================================================
-- This table is required for invite-based signups at /signup?token=xxx
-- It enables the /api/auth/generate-invite endpoint used by the admin panel

CREATE TABLE IF NOT EXISTS invite_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  tier VARCHAR(20) DEFAULT 'basic' CHECK (tier IN ('basic', 'full')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_email ON invite_tokens(email);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires_at ON invite_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_created_by ON invite_tokens(created_by);

-- Enable Row Level Security
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own invite tokens" ON invite_tokens;
DROP POLICY IF EXISTS "Service role can manage invite tokens" ON invite_tokens;
DROP POLICY IF EXISTS "Admins can manage all invite tokens" ON invite_tokens;

-- Policy: Only admins can manage invite tokens
CREATE POLICY "Admins can manage all invite tokens" ON invite_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add trigger for updated_at
-- Drop existing function and trigger first to avoid conflicts
DROP FUNCTION IF EXISTS update_invite_tokens_updated_at() CASCADE;

CREATE FUNCTION update_invite_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invite_tokens_updated_at
  BEFORE UPDATE ON invite_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_invite_tokens_updated_at();

-- Add helper function to clean up expired tokens
-- Drop existing function first to handle return type changes
DROP FUNCTION IF EXISTS cleanup_expired_invite_tokens();

CREATE FUNCTION cleanup_expired_invite_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM invite_tokens
  WHERE expires_at < NOW()
    AND used_at IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE invite_tokens IS 'Secure invite tokens for student registration via /signup?token=xxx';
COMMENT ON COLUMN invite_tokens.tier IS 'Student access tier: basic (free) or full (paid access)';
COMMENT ON COLUMN invite_tokens.expires_at IS 'Token expiration time (typically 7 days from creation)';
COMMENT ON COLUMN invite_tokens.used_at IS 'When the token was used for signup';
COMMENT ON COLUMN invite_tokens.created_by IS 'Admin user who created the invite';
