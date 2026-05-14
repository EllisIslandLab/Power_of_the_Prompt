-- Create database_backups table for automatic backup functionality
CREATE TABLE database_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_id VARCHAR UNIQUE NOT NULL,
  table_name VARCHAR NOT NULL,
  backup_data JSONB NOT NULL,
  record_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP DEFAULT now() + interval '30 days',
  is_restorable BOOLEAN DEFAULT true,
  restored_by_user_at TIMESTAMP,
  metadata JSONB
);

-- Create indexes for better query performance
CREATE INDEX idx_database_backups_user_id ON database_backups(user_id);
CREATE INDEX idx_database_backups_created_at ON database_backups(created_at);
CREATE INDEX idx_database_backups_backup_id ON database_backups(backup_id);

-- Enable Row Level Security
ALTER TABLE database_backups ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own backups
CREATE POLICY "Users can view own backups"
  ON database_backups
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own backups
CREATE POLICY "Users can create own backups"
  ON database_backups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own backups (for restore tracking)
CREATE POLICY "Users can update own backups"
  ON database_backups
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own backups
CREATE POLICY "Users can delete own backups"
  ON database_backups
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically clean up expired backups
CREATE OR REPLACE FUNCTION clean_expired_backups()
RETURNS void AS $$
BEGIN
  UPDATE database_backups
  SET is_restorable = false
  WHERE expires_at < now() AND is_restorable = true;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('clean-expired-backups', '0 2 * * *', 'SELECT clean_expired_backups()');
