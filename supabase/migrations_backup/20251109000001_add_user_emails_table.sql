-- Create user_emails table for managing multiple email addresses per user
CREATE TABLE IF NOT EXISTS user_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure email format
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_emails_user_id ON user_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_user_emails_email ON user_emails(email);
CREATE INDEX IF NOT EXISTS idx_user_emails_primary ON user_emails(user_id, is_primary);

-- Function to ensure only one primary email per user
CREATE OR REPLACE FUNCTION ensure_single_primary_email()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this email as primary, unset all other primary emails for this user
  IF NEW.is_primary = true THEN
    UPDATE user_emails
    SET is_primary = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain single primary email
DROP TRIGGER IF EXISTS ensure_single_primary_email_trigger ON user_emails;
CREATE TRIGGER ensure_single_primary_email_trigger
  BEFORE INSERT OR UPDATE ON user_emails
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_email();

-- Function to prevent deleting the last email if it's primary
CREATE OR REPLACE FUNCTION prevent_delete_last_email()
RETURNS TRIGGER AS $$
DECLARE
  email_count INTEGER;
BEGIN
  -- Count remaining emails for this user
  SELECT COUNT(*) INTO email_count
  FROM user_emails
  WHERE user_id = OLD.user_id;

  -- If this is the last email, prevent deletion
  IF email_count = 1 THEN
    RAISE EXCEPTION 'Cannot delete the last email address. Add another email before deleting this one.';
  END IF;

  -- If deleting a primary email, make another email primary
  IF OLD.is_primary = true THEN
    UPDATE user_emails
    SET is_primary = true
    WHERE id = (
      SELECT id
      FROM user_emails
      WHERE user_id = OLD.user_id
      AND id != OLD.id
      LIMIT 1
    );
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent deletion of last email
DROP TRIGGER IF EXISTS prevent_delete_last_email_trigger ON user_emails;
CREATE TRIGGER prevent_delete_last_email_trigger
  BEFORE DELETE ON user_emails
  FOR EACH ROW
  EXECUTE FUNCTION prevent_delete_last_email();

-- Enable RLS
ALTER TABLE user_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own emails
CREATE POLICY "Users can view own emails"
  ON user_emails
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own emails
CREATE POLICY "Users can add own emails"
  ON user_emails
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own emails
CREATE POLICY "Users can update own emails"
  ON user_emails
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own emails (trigger prevents last email deletion)
CREATE POLICY "Users can delete own emails"
  ON user_emails
  FOR DELETE
  USING (auth.uid() = user_id);

-- Migrate existing user emails from users table to user_emails table
INSERT INTO user_emails (user_id, email, is_primary, verified)
SELECT
  id,
  email,
  true, -- Set as primary
  email_verified
FROM users
WHERE email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_emails_updated_at ON user_emails;
CREATE TRIGGER update_user_emails_updated_at
  BEFORE UPDATE ON user_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
