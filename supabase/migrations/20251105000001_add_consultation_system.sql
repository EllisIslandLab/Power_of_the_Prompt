-- Add consultation booking system with promo codes
-- This migration creates tables for managing consultations, promo codes, and time blocking

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  business_name VARCHAR(255),

  -- Consultation details
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  timezone VARCHAR(100) DEFAULT 'America/New_York',
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled')),

  -- Meeting details
  jitsi_room_id VARCHAR(255),
  jitsi_join_url TEXT,
  video_session_id UUID,

  -- Additional info
  website_description TEXT,
  notes TEXT,

  -- Cancellation/Rescheduling
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  rescheduled_from UUID REFERENCES consultations(id),

  -- Reminders
  reminder_24h_sent BOOLEAN DEFAULT FALSE,
  reminder_24h_sent_at TIMESTAMP WITH TIME ZONE,
  reminder_1h_sent BOOLEAN DEFAULT FALSE,
  reminder_1h_sent_at TIMESTAMP WITH TIME ZONE,
  confirmation_sent BOOLEAN DEFAULT FALSE,
  confirmation_sent_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo_codes table for tracking generated promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Code details
  code VARCHAR(100) UNIQUE NOT NULL,
  stripe_promo_code_id VARCHAR(255),
  stripe_coupon_id VARCHAR(255),

  -- Discount details
  product_id VARCHAR(100) NOT NULL, -- Stripe product ID
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_amount NUMERIC(10, 2) NOT NULL,

  -- Recipient
  user_email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Usage tracking
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_in_session_id VARCHAR(255), -- Stripe checkout session ID

  -- Campaign tracking
  campaign_type VARCHAR(100) DEFAULT 'welcome_series',
  sent_via_email_id UUID,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultation_blocks table for blocking out unavailable times
CREATE TABLE IF NOT EXISTS consultation_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Block details
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reason VARCHAR(255),
  block_type VARCHAR(50) DEFAULT 'manual' CHECK (block_type IN ('manual', 'holiday', 'vacation', 'booked')),

  -- Related consultation (if this is a booked slot)
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create federal_holidays table for automatic blocking
CREATE TABLE IF NOT EXISTS federal_holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Holiday details
  holiday_name VARCHAR(255) NOT NULL,
  holiday_date DATE NOT NULL UNIQUE,
  year INTEGER NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled_date ON consultations(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_consultations_email ON consultations(email);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_reminders_24h ON consultations(scheduled_date, reminder_24h_sent) WHERE status = 'scheduled' AND reminder_24h_sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_consultations_reminders_1h ON consultations(scheduled_date, reminder_1h_sent) WHERE status = 'scheduled' AND reminder_1h_sent = FALSE;

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_email ON promo_codes(user_email);
CREATE INDEX IF NOT EXISTS idx_promo_codes_expires_at ON promo_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_promo_codes_used ON promo_codes(used);

CREATE INDEX IF NOT EXISTS idx_consultation_blocks_time_range ON consultation_blocks(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_consultation_blocks_consultation_id ON consultation_blocks(consultation_id);

CREATE INDEX IF NOT EXISTS idx_federal_holidays_date ON federal_holidays(holiday_date);
CREATE INDEX IF NOT EXISTS idx_federal_holidays_year ON federal_holidays(year);

-- Enable RLS
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE federal_holidays ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Consultations: Users can view their own, service role can manage all
CREATE POLICY "Users can view their own consultations" ON consultations
  FOR SELECT USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

CREATE POLICY "Service role can manage consultations" ON consultations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own consultations" ON consultations
  FOR INSERT WITH CHECK (true); -- Anyone can book, we'll validate in the API

-- Promo codes: Users can view their own, service role can manage all
CREATE POLICY "Users can view their own promo codes" ON promo_codes
  FOR SELECT USING (auth.uid() = user_id OR user_email = auth.jwt()->>'email');

CREATE POLICY "Service role can manage promo codes" ON promo_codes
  FOR ALL USING (auth.role() = 'service_role');

-- Consultation blocks: Public read for availability, service role for management
CREATE POLICY "Anyone can view consultation blocks" ON consultation_blocks
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage consultation blocks" ON consultation_blocks
  FOR ALL USING (auth.role() = 'service_role');

-- Federal holidays: Public read
CREATE POLICY "Anyone can view federal holidays" ON federal_holidays
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage federal holidays" ON federal_holidays
  FOR ALL USING (auth.role() = 'service_role');

-- Add updated_at triggers
CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_blocks_updated_at
  BEFORE UPDATE ON consultation_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Automatically create consultation blocks when a consultation is booked
CREATE OR REPLACE FUNCTION create_consultation_block()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create block for scheduled/confirmed consultations
  IF NEW.status IN ('scheduled', 'confirmed') THEN
    -- Calculate end time based on duration
    INSERT INTO consultation_blocks (
      start_time,
      end_time,
      reason,
      block_type,
      consultation_id
    ) VALUES (
      NEW.scheduled_date,
      NEW.scheduled_date + (NEW.duration_minutes || ' minutes')::INTERVAL,
      'Booked consultation with ' || NEW.full_name,
      'booked',
      NEW.id
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_consultation_block
  AFTER INSERT OR UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION create_consultation_block();

-- Function to populate federal holidays for 2025-2027
CREATE OR REPLACE FUNCTION populate_federal_holidays()
RETURNS INTEGER AS $$
DECLARE
  holidays_added INTEGER := 0;
BEGIN
  -- 2025 Federal Holidays
  INSERT INTO federal_holidays (holiday_name, holiday_date, year) VALUES
    ('New Year''s Day', '2025-01-01', 2025),
    ('Martin Luther King Jr. Day', '2025-01-20', 2025),
    ('Presidents Day', '2025-02-17', 2025),
    ('Memorial Day', '2025-05-26', 2025),
    ('Juneteenth', '2025-06-19', 2025),
    ('Independence Day', '2025-07-04', 2025),
    ('Labor Day', '2025-09-01', 2025),
    ('Columbus Day', '2025-10-13', 2025),
    ('Veterans Day', '2025-11-11', 2025),
    ('Thanksgiving Day', '2025-11-27', 2025),
    ('Christmas Day', '2025-12-25', 2025)
  ON CONFLICT (holiday_date) DO NOTHING;

  GET DIAGNOSTICS holidays_added = ROW_COUNT;

  -- 2026 Federal Holidays
  INSERT INTO federal_holidays (holiday_name, holiday_date, year) VALUES
    ('New Year''s Day', '2026-01-01', 2026),
    ('Martin Luther King Jr. Day', '2026-01-19', 2026),
    ('Presidents Day', '2026-02-16', 2026),
    ('Memorial Day', '2026-05-25', 2026),
    ('Juneteenth', '2026-06-19', 2026),
    ('Independence Day', '2026-07-04', 2026),
    ('Labor Day', '2026-09-07', 2026),
    ('Columbus Day', '2026-10-12', 2026),
    ('Veterans Day', '2026-11-11', 2026),
    ('Thanksgiving Day', '2026-11-26', 2026),
    ('Christmas Day', '2026-12-25', 2026)
  ON CONFLICT (holiday_date) DO NOTHING;

  GET DIAGNOSTICS holidays_added = holidays_added + ROW_COUNT;

  -- 2027 Federal Holidays
  INSERT INTO federal_holidays (holiday_name, holiday_date, year) VALUES
    ('New Year''s Day', '2027-01-01', 2027),
    ('Martin Luther King Jr. Day', '2027-01-18', 2027),
    ('Presidents Day', '2027-02-15', 2027),
    ('Memorial Day', '2027-05-31', 2027),
    ('Juneteenth', '2027-06-19', 2027),
    ('Independence Day', '2027-07-04', 2027),
    ('Labor Day', '2027-09-06', 2027),
    ('Columbus Day', '2027-10-11', 2027),
    ('Veterans Day', '2027-11-11', 2027),
    ('Thanksgiving Day', '2027-11-25', 2027),
    ('Christmas Day', '2027-12-25', 2027)
  ON CONFLICT (holiday_date) DO NOTHING;

  GET DIAGNOSTICS holidays_added = holidays_added + ROW_COUNT;

  RETURN holidays_added;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Populate federal holidays
SELECT populate_federal_holidays();

-- Function to check if a date is a federal holiday
CREATE OR REPLACE FUNCTION is_federal_holiday(check_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM federal_holidays
    WHERE holiday_date = check_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available consultation slots
CREATE OR REPLACE FUNCTION get_available_slots(
  start_date DATE,
  end_date DATE,
  timezone_name TEXT DEFAULT 'America/New_York'
)
RETURNS TABLE(
  slot_time TIMESTAMP WITH TIME ZONE,
  is_available BOOLEAN,
  is_within_72h BOOLEAN
) AS $$
DECLARE
  current_slot TIMESTAMP WITH TIME ZONE;
  slot_end TIMESTAMP WITH TIME ZONE;
  min_booking_time TIMESTAMP WITH TIME ZONE;
  highlight_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate minimum booking time (current time + 0 buffer as per requirements)
  min_booking_time := NOW();

  -- Calculate 72 hour highlight period
  highlight_until := NOW() + INTERVAL '72 hours';

  -- Loop through each day in the range
  FOR day_offset IN 0..(end_date - start_date) LOOP
    DECLARE
      check_date DATE := start_date + day_offset;
      day_of_week INTEGER := EXTRACT(DOW FROM check_date);
    BEGIN
      -- Skip weekends (0 = Sunday, 6 = Saturday)
      IF day_of_week IN (0, 6) THEN
        CONTINUE;
      END IF;

      -- Skip federal holidays
      IF is_federal_holiday(check_date) THEN
        CONTINUE;
      END IF;

      -- Generate slots from 9 AM to 5 PM (60-minute slots)
      -- Slots at: 9:00, 10:00, 11:00, 12:00, 1:00, 2:00, 3:00, 4:00
      FOR hour IN 9..16 LOOP
        current_slot := (check_date || ' ' || hour || ':00:00')::TIMESTAMP AT TIME ZONE timezone_name;
        slot_end := current_slot + INTERVAL '60 minutes';

        -- Check if slot is in the future
        IF current_slot < min_booking_time THEN
          CONTINUE;
        END IF;

        -- Check if slot is blocked
        DECLARE
          is_blocked BOOLEAN;
        BEGIN
          SELECT EXISTS (
            SELECT 1 FROM consultation_blocks
            WHERE (
              (start_time <= current_slot AND end_time > current_slot) OR
              (start_time < slot_end AND end_time >= slot_end) OR
              (start_time >= current_slot AND end_time <= slot_end)
            )
          ) INTO is_blocked;

          RETURN QUERY SELECT
            current_slot,
            NOT is_blocked,
            current_slot <= highlight_until;
        END;
      END LOOP;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add email templates for consultation system
INSERT INTO email_templates (name, description, category, subject_template, content_template, variables)
SELECT
  'Consultation Confirmation',
  'Confirmation email sent when a consultation is booked',
  'consultation',
  'Your Web Launch Academy Consultation is Confirmed - {{formatted_date}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Your Consultation is Confirmed! 🎉</h2>

  <p>Hi {{name}},</p>

  <p>Great news! Your free 1-on-1 consultation with Matthew Ellis is confirmed.</p>

  <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2e7d32;">
    <h3 style="color: #2e7d32; margin: 0 0 10px 0;">📅 Your Appointment Details</h3>
    <p style="margin: 5px 0;"><strong>Date & Time:</strong> {{formatted_date}}</p>
    <p style="margin: 5px 0;"><strong>Duration:</strong> 60 minutes</p>
    <p style="margin: 5px 0;"><strong>Format:</strong> Video call via Jitsi</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{{join_url}}"
       style="background-color: #ffdb57; color: #11296b; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
      Join Your Consultation
    </a>
    <p style="font-size: 13px; color: #666; margin-top: 10px;">
      Save this link! You''ll need it to join your consultation.
    </p>
  </div>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3>What to Prepare:</h3>
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li>Any questions about Web Launch Academy</li>
      <li>Your website goals and vision</li>
      <li>Current website challenges (if applicable)</li>
      <li>Timeline and budget expectations</li>
    </ul>
  </div>

  <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
    <p style="margin: 0; color: #856404;">
      <strong>⏰ Reminders:</strong> We''ll send you reminder emails 24 hours and 1 hour before your consultation.
    </p>
  </div>

  <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af;">Need to Reschedule or Cancel?</h3>
    <p style="margin: 5px 0;">No problem! Just reply to this email or call me directly.</p>
    <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:4403549904">(440) 354-9904</a></p>
    <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:hello@weblaunchacademy.com">hello@weblaunchacademy.com</a></p>
  </div>

  <p>Looking forward to speaking with you!</p>

  <p>
    <strong>Matthew Ellis</strong><br>
    Founder, Web Launch Academy<br>
    <a href="tel:4403549904">(440) 354-9904</a>
  </p>

  <p style="text-align: center; font-style: italic; color: #11296b; font-weight: 600; margin-top: 30px;">
    - Build Once, Own Forever! -
  </p>
</div>',
  '["name", "formatted_date", "join_url"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Consultation Confirmation');

INSERT INTO email_templates (name, description, category, subject_template, content_template, variables)
SELECT
  'Consultation Reminder 24h',
  'Reminder email sent 24 hours before consultation',
  'consultation',
  'Reminder: Your Consultation Tomorrow at {{time}} EST',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Your Consultation is Tomorrow! ⏰</h2>

  <p>Hi {{name}},</p>

  <p>Just a friendly reminder that your free consultation with Matthew Ellis is coming up tomorrow.</p>

  <div style="background-color: #ffdb57; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <h3 style="color: #11296b; margin: 0 0 10px 0;">📅 Tomorrow at {{time}} EST</h3>
    <p style="color: #11296b; margin: 0;">Duration: 60 minutes</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{{join_url}}"
       style="background-color: #11296b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
      Join Your Consultation
    </a>
  </div>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3>Quick Prep Checklist:</h3>
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li>✅ Test your video and microphone</li>
      <li>✅ Find a quiet space</li>
      <li>✅ Have your questions ready</li>
      <li>✅ Think about your website goals</li>
    </ul>
  </div>

  <p>Need to reschedule? Just reply to this email or call me at <a href="tel:4403549904">(440) 354-9904</a>.</p>

  <p>See you tomorrow!</p>

  <p>
    <strong>Matthew Ellis</strong><br>
    Founder, Web Launch Academy
  </p>
</div>',
  '["name", "time", "join_url"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Consultation Reminder 24h');

INSERT INTO email_templates (name, description, category, subject_template, content_template, variables)
SELECT
  'Consultation Reminder 1h',
  'Reminder email sent 1 hour before consultation',
  'consultation',
  'Starting Soon: Your Consultation in 1 Hour',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Your Consultation Starts in 1 Hour! 🚀</h2>

  <p>Hi {{name}},</p>

  <p>This is your final reminder - your consultation starts in about an hour!</p>

  <div style="background-color: #e8f5e9; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; border: 2px solid #2e7d32;">
    <h3 style="color: #2e7d32; margin: 0 0 15px 0;">🎯 Starting at {{time}} EST</h3>
    <a href="{{join_url}}"
       style="background-color: #2e7d32; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 18px;">
      Click Here to Join Now
    </a>
  </div>

  <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
    <p style="margin: 0; color: #856404;">
      <strong>💡 Pro Tip:</strong> Join a few minutes early to make sure your audio and video are working properly.
    </p>
  </div>

  <p>Looking forward to meeting you!</p>

  <p>
    <strong>Matthew Ellis</strong><br>
    <a href="tel:4403549904">(440) 354-9904</a>
  </p>
</div>',
  '["name", "time", "join_url"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Consultation Reminder 1h');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Consultation system migration completed successfully';
END $$;
