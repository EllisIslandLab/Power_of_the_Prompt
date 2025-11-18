-- Migration: Add Scheduling System
-- Description: Creates tables for coach availability and session bookings
-- Date: 2025-11-07

-- =============================================
-- Table: availability_slots
-- Description: Stores coach availability (recurring weekly or specific dates)
-- =============================================
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Recurring availability (e.g., every Monday)
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday

  -- One-off availability (e.g., specific date)
  specific_date DATE,

  -- Time range
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints: must have either day_of_week OR specific_date, not both
  CONSTRAINT availability_type_check CHECK (
    (day_of_week IS NOT NULL AND specific_date IS NULL) OR
    (day_of_week IS NULL AND specific_date IS NOT NULL)
  ),

  -- Ensure end_time is after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes for performance
CREATE INDEX idx_availability_coach ON availability_slots(coach_id);
CREATE INDEX idx_availability_day ON availability_slots(day_of_week) WHERE day_of_week IS NOT NULL;
CREATE INDEX idx_availability_date ON availability_slots(specific_date) WHERE specific_date IS NOT NULL;
CREATE INDEX idx_availability_active ON availability_slots(is_active);

-- =============================================
-- Table: session_bookings
-- Description: Stores booked coaching sessions
-- =============================================
CREATE TABLE IF NOT EXISTS session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who's involved
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session details
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('check-in', 'lvl-up-session', 'group-coaching', 'custom')),
  booking_date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15 CHECK (duration_minutes > 0 AND duration_minutes % 15 = 0),

  -- Meeting info
  meeting_link TEXT, -- Jitsi room URL or name
  notes TEXT,

  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show')),

  -- Email confirmation tracking
  confirmation_email_sent BOOLEAN DEFAULT false,
  reminder_email_sent BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,

  -- Prevent double-booking
  CONSTRAINT unique_user_timeslot UNIQUE (user_id, start_time)
);

-- Indexes for performance
CREATE INDEX idx_bookings_user ON session_bookings(user_id);
CREATE INDEX idx_bookings_coach ON session_bookings(coach_id);
CREATE INDEX idx_bookings_date ON session_bookings(booking_date);
CREATE INDEX idx_bookings_start_time ON session_bookings(start_time);
CREATE INDEX idx_bookings_status ON session_bookings(status);
CREATE INDEX idx_bookings_type ON session_bookings(session_type);

-- Composite index for finding bookings by coach and date range
CREATE INDEX idx_bookings_coach_time ON session_bookings(coach_id, start_time) WHERE status != 'cancelled';

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;

-- availability_slots policies
-- Admins can manage all availability
CREATE POLICY "Admins can manage all availability"
  ON availability_slots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Everyone can view active availability
CREATE POLICY "Anyone can view active availability"
  ON availability_slots
  FOR SELECT
  USING (is_active = true);

-- session_bookings policies
-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
  ON session_bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
  ON session_bookings
  FOR SELECT
  USING (user_id = auth.uid() OR coach_id = auth.uid());

-- Users can create their own bookings
CREATE POLICY "Users can create bookings"
  ON session_bookings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own bookings (for cancellations)
CREATE POLICY "Users can update their own bookings"
  ON session_bookings
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- Helper Functions
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_bookings_updated_at
  BEFORE UPDATE ON session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to set cancelled_at when status changes to cancelled
CREATE OR REPLACE FUNCTION set_cancelled_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_cancelled_at
  BEFORE UPDATE ON session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_cancelled_at();

-- =============================================
-- Initial Data: Add default admin availability
-- =============================================

-- Add default availability for admin (Monday-Friday, 9 AM - 5 PM)
-- This is just example data, can be customized via admin interface
INSERT INTO availability_slots (coach_id, day_of_week, start_time, end_time)
SELECT
  id,
  day_num,
  '09:00:00'::TIME,
  '17:00:00'::TIME
FROM
  users,
  generate_series(1, 5) AS day_num  -- Monday (1) through Friday (5)
WHERE
  users.role = 'admin'
ON CONFLICT DO NOTHING;

-- =============================================
-- Comments for documentation
-- =============================================

COMMENT ON TABLE availability_slots IS 'Stores coach availability as recurring weekly slots or specific date slots';
COMMENT ON TABLE session_bookings IS 'Stores booked coaching sessions with 15-minute time slot granularity';

COMMENT ON COLUMN availability_slots.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday. Used for recurring weekly availability';
COMMENT ON COLUMN availability_slots.specific_date IS 'Specific date for one-off availability (e.g., special office hours)';
COMMENT ON COLUMN session_bookings.duration_minutes IS 'Duration in 15-minute increments (15, 30, 45, 60, etc.)';
COMMENT ON COLUMN session_bookings.meeting_link IS 'Generated Jitsi room name or URL for the session';
