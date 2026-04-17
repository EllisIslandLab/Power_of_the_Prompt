-- ============================================
-- Create Progress Tracking System
-- ============================================
--
-- This migration creates tables for tracking:
-- - Project milestones/checkpoints
-- - Tutorial video completion
--
-- Date: 2026-04-17
-- ============================================

-- Project Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Milestone details
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,

  -- Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  completed_at timestamp,

  -- Metadata
  category text, -- e.g., 'setup', 'design', 'development', 'deployment'
  estimated_hours integer,
  actual_hours integer,

  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Tutorial Video Progress
CREATE TABLE IF NOT EXISTS video_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Video details
  video_id text NOT NULL, -- YouTube video ID
  video_title text,
  playlist_id text,

  -- Progress tracking
  watched boolean DEFAULT false,
  watch_percentage integer DEFAULT 0 CHECK (watch_percentage >= 0 AND watch_percentage <= 100),
  last_watched_at timestamp,
  completed_at timestamp,

  -- Notes
  notes text,

  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  -- Ensure one record per user per video
  UNIQUE(user_id, video_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_milestones_user_id ON project_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_playlist_id ON video_progress(playlist_id);

-- RLS Policies
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own milestones
CREATE POLICY "Users can view own milestones"
  ON project_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON project_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON project_milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones"
  ON project_milestones FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all milestones
CREATE POLICY "Admins can manage all milestones"
  ON project_milestones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can only see their own video progress
CREATE POLICY "Users can view own video progress"
  ON video_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video progress"
  ON video_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video progress"
  ON video_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all video progress
CREATE POLICY "Admins can view all video progress"
  ON video_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_project_milestones_updated_at ON project_milestones;
CREATE TRIGGER update_project_milestones_updated_at
  BEFORE UPDATE ON project_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_progress_updated_at ON video_progress;
CREATE TRIGGER update_video_progress_updated_at
  BEFORE UPDATE ON video_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE project_milestones IS 'Tracks project milestones and checkpoints for each client website';
COMMENT ON TABLE video_progress IS 'Tracks which tutorial videos clients have watched';

-- Verify
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Created progress tracking tables';
  RAISE NOTICE '   - project_milestones: Track website project progress';
  RAISE NOTICE '   - video_progress: Track tutorial video completion';
  RAISE NOTICE '';
END $$;
