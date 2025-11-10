-- Add expiry timestamp to demo_projects for 24-hour code access limit
-- This creates urgency for users to purchase the walkthrough guide

-- Add expires_at column (defaults to 24 hours after creation)
ALTER TABLE demo_projects
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Set default value for new records (24 hours from creation)
ALTER TABLE demo_projects
ALTER COLUMN expires_at SET DEFAULT (now() + interval '24 hours');

-- Update existing records to expire 24 hours from creation
UPDATE demo_projects
SET expires_at = created_at + interval '24 hours'
WHERE expires_at IS NULL;

-- Make it NOT NULL after setting defaults
ALTER TABLE demo_projects
ALTER COLUMN expires_at SET NOT NULL;

-- Add index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_demo_projects_expires_at
ON demo_projects(expires_at);

-- Function to automatically delete expired demo projects
CREATE OR REPLACE FUNCTION cleanup_expired_demos()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete demos that have expired
  DELETE FROM demo_projects
  WHERE expires_at < now()
  RETURNING count(*) INTO deleted_count;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a demo is expired
CREATE OR REPLACE FUNCTION is_demo_expired(demo_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  demo_expires_at TIMESTAMPTZ;
BEGIN
  SELECT expires_at INTO demo_expires_at
  FROM demo_projects
  WHERE id = demo_id;

  IF demo_expires_at IS NULL THEN
    RETURN true; -- If not found, consider expired
  END IF;

  RETURN demo_expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to get time remaining before expiry
CREATE OR REPLACE FUNCTION demo_time_remaining(demo_id UUID)
RETURNS INTERVAL AS $$
DECLARE
  demo_expires_at TIMESTAMPTZ;
BEGIN
  SELECT expires_at INTO demo_expires_at
  FROM demo_projects
  WHERE id = demo_id;

  IF demo_expires_at IS NULL THEN
    RETURN interval '0';
  END IF;

  -- Return time remaining (will be negative if expired)
  RETURN demo_expires_at - now();
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON COLUMN demo_projects.expires_at IS 'Demo code expires 24 hours after creation to create urgency for purchase';
COMMENT ON FUNCTION cleanup_expired_demos() IS 'Deletes expired demo projects to free up storage. Call this via cron or manually.';
COMMENT ON FUNCTION is_demo_expired(UUID) IS 'Check if a specific demo has expired';
COMMENT ON FUNCTION demo_time_remaining(UUID) IS 'Get remaining time before demo expires (negative if already expired)';
