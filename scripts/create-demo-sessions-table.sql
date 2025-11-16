-- =========================================================
-- Create demo_sessions table for website builder
-- =========================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS demo_sessions (
  id TEXT PRIMARY KEY,
  builder_type TEXT NOT NULL CHECK (builder_type IN ('free', 'ai_premium')),
  ai_premium_paid BOOLEAN DEFAULT false,
  ai_credits_total INTEGER DEFAULT 0,
  ai_credits_used INTEGER DEFAULT 0,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'building',
  user_email TEXT DEFAULT '',
  website_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_demo_sessions_stripe_session
  ON demo_sessions(stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_demo_sessions_user_email
  ON demo_sessions(user_email);

CREATE INDEX IF NOT EXISTS idx_demo_sessions_created_at
  ON demo_sessions(created_at DESC);

-- 3. Enable RLS
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Allow anyone to create a session (no auth required for demo)
DROP POLICY IF EXISTS "Anyone can create demo sessions" ON demo_sessions;
CREATE POLICY "Anyone can create demo sessions"
  ON demo_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to read their own session by ID
DROP POLICY IF EXISTS "Users can read their demo sessions" ON demo_sessions;
CREATE POLICY "Users can read their demo sessions"
  ON demo_sessions
  FOR SELECT
  TO public
  USING (true);  -- Allow reading any session if you have the ID

-- Allow anyone to update their session by ID
DROP POLICY IF EXISTS "Users can update their demo sessions" ON demo_sessions;
CREATE POLICY "Users can update their demo sessions"
  ON demo_sessions
  FOR UPDATE
  TO public
  USING (true);  -- Allow updating any session if you have the ID

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_demo_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS demo_sessions_updated_at ON demo_sessions;
CREATE TRIGGER demo_sessions_updated_at
  BEFORE UPDATE ON demo_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_demo_sessions_updated_at();

-- 6. Verify table was created
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'demo_sessions'
ORDER BY ordinal_position;

-- =========================================================
-- After running this, test by creating a session:
--
-- INSERT INTO demo_sessions (id, builder_type, ai_credits_total)
-- VALUES ('test-123', 'free', 0)
-- RETURNING *;
--
-- If successful, delete test:
-- DELETE FROM demo_sessions WHERE id = 'test-123';
-- =========================================================
