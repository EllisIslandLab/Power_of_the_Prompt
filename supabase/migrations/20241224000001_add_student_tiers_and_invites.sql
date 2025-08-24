-- Add student tiers and invite system to existing students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'full')),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'trial', 'expired')),
ADD COLUMN IF NOT EXISTS invited_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP;

-- Create invite tokens table for secure invite management
CREATE TABLE IF NOT EXISTS invite_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'full')),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_by VARCHAR(255), -- Admin who created the invite
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure email uniqueness for active tokens
  CONSTRAINT unique_active_email UNIQUE (email) DEFERRABLE INITIALLY DEFERRED
);

-- Create index for efficient token lookups
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_email ON invite_tokens(email);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires_at ON invite_tokens(expires_at);

-- Enable RLS on invite_tokens table
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view their own invite tokens
CREATE POLICY "Users can view their own invite tokens" ON invite_tokens
  FOR SELECT USING (email = auth.email());

-- Policy: Only service role can manage invite tokens (for API routes)
CREATE POLICY "Service role can manage invite tokens" ON invite_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- Function to clean up expired tokens (run this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_invite_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM invite_tokens 
  WHERE expires_at < NOW() AND used_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger for invite_tokens
CREATE OR REPLACE FUNCTION update_invite_tokens_updated_at()
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

-- Update existing students to have proper tier (can be run safely multiple times)
UPDATE students 
SET tier = 'free', payment_status = 'trial' 
WHERE tier IS NULL OR tier = '';

-- Add comments for documentation
COMMENT ON TABLE invite_tokens IS 'Secure invite tokens for student registration';
COMMENT ON COLUMN invite_tokens.tier IS 'Student access tier: free or full';
COMMENT ON COLUMN invite_tokens.expires_at IS 'Token expiration time (7 days from creation)';
COMMENT ON COLUMN invite_tokens.used_at IS 'When the token was used for signup';
COMMENT ON COLUMN students.tier IS 'Student access level: free (limited) or full (complete access)';
COMMENT ON COLUMN students.payment_status IS 'Payment status: pending, paid, trial, expired';