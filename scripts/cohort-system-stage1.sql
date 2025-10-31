-- Cohort System - Stage 1: Core Cohort Management
-- Creates cohorts and cohort_members tables with RLS policies

-- Cohorts table
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- e.g., "Ramsey Preferred Coaching"
  title TEXT NOT NULL,                   -- e.g., "Financial Coaching Websites"
  description TEXT,                      -- Summary/description
  start_date DATE NOT NULL,              -- When cohort starts (e.g., 2025-11-03)
  end_date DATE,                         -- Calculated: start_date + duration_weeks
  duration_weeks INTEGER DEFAULT 8,      -- Default 8 weeks
  is_active BOOLEAN DEFAULT FALSE,       -- Only one active cohort at a time
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohort members (which students are in which cohort)
CREATE TABLE IF NOT EXISTS cohort_members (
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  completion_percentage INTEGER DEFAULT 0,
  PRIMARY KEY (cohort_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cohorts_active ON cohorts(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_cohorts_start_date ON cohorts(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_cohort_members_user_id ON cohort_members(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_cohort_id ON cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_status ON cohort_members(status);

-- Enable Row Level Security
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cohorts
CREATE POLICY "Anyone can view active cohorts"
  ON cohorts FOR SELECT
  USING (is_active = TRUE OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage cohorts"
  ON cohorts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for cohort_members
CREATE POLICY "Users can view their own cohort memberships"
  ON cohort_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all cohort memberships"
  ON cohort_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage cohort memberships"
  ON cohort_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to auto-calculate end_date when cohort is created/updated
CREATE OR REPLACE FUNCTION calculate_cohort_end_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_date IS NOT NULL AND NEW.duration_weeks IS NOT NULL THEN
    NEW.end_date := NEW.start_date + (NEW.duration_weeks * 7 || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate end_date
CREATE TRIGGER set_cohort_end_date
  BEFORE INSERT OR UPDATE ON cohorts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_cohort_end_date();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cohort_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_cohorts_updated_at
  BEFORE UPDATE ON cohorts
  FOR EACH ROW
  EXECUTE FUNCTION update_cohort_updated_at();

-- Function to ensure only one active cohort at a time
CREATE OR REPLACE FUNCTION ensure_single_active_cohort()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    -- Set all other cohorts to inactive
    UPDATE cohorts
    SET is_active = FALSE
    WHERE id != NEW.id AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one active cohort
CREATE TRIGGER enforce_single_active_cohort
  BEFORE INSERT OR UPDATE ON cohorts
  FOR EACH ROW
  WHEN (NEW.is_active = TRUE)
  EXECUTE FUNCTION ensure_single_active_cohort();

-- Grant permissions
GRANT ALL ON cohorts TO authenticated;
GRANT ALL ON cohort_members TO authenticated;

-- Insert initial "Ramsey Preferred Coaching" cohort (Nov 3, 2025)
INSERT INTO cohorts (name, title, description, start_date, duration_weeks, is_active)
VALUES (
  'Ramsey Preferred Coaching',
  'Financial Coaching Websites',
  'First cohort of Web Launch Academy students focusing on building financial coaching websites. Started November 3, 2025.',
  '2025-11-03',
  8,
  TRUE
)
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE cohorts IS 'Cohort groups for structured learning sessions';
COMMENT ON COLUMN cohorts.is_active IS 'Only one cohort can be active at a time - new signups auto-join active cohort';
COMMENT ON COLUMN cohorts.duration_weeks IS 'Typically 8 weeks, end_date auto-calculated';
COMMENT ON TABLE cohort_members IS 'Students enrolled in specific cohorts - students can be in multiple cohorts';
COMMENT ON COLUMN cohort_members.status IS 'active = currently learning, completed = finished all lessons, dropped = left cohort';
