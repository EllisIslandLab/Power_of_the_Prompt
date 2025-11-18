-- Web Launch Academy Database Restructure Migration
-- This migration cleans up the database structure for better organization

-- STEP 1: CREATE NEW USERS TABLE (renamed from students)
-- First create the new table with improved structure
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,

  -- User classification
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  tier VARCHAR(20) DEFAULT 'basic' CHECK (tier IN ('basic', 'premium', 'vip', 'enterprise')),

  -- Payment and status
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'trial', 'expired')),

  -- Invitation system
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- STEP 2: MIGRATE DATA from students to users
-- First check what columns exist in students table and migrate accordingly
-- Safely migrate data from students table, handling missing columns
DO $$
DECLARE
  has_role_column BOOLEAN;
  has_tier_column BOOLEAN;
BEGIN
  -- Check if role column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'role'
  ) INTO has_role_column;

  -- Check if tier column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'tier'
  ) INTO has_tier_column;

  -- Insert with appropriate columns
  IF has_role_column THEN
    INSERT INTO users (id, email, full_name, email_verified, role, payment_status, created_at, updated_at)
    SELECT
      id, email, full_name, email_verified,
      COALESCE(role, 'student') as role,
      LOWER(payment_status) as payment_status, -- Normalize to lowercase
      created_at, updated_at
    FROM students
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.id = students.id);
  ELSE
    INSERT INTO users (id, email, full_name, email_verified, role, payment_status, created_at, updated_at)
    SELECT
      id, email, full_name, email_verified,
      'student' as role,
      LOWER(payment_status) as payment_status, -- Normalize to lowercase
      created_at, updated_at
    FROM students
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.id = students.id);
  END IF;
END $$;

-- Update invited_by and invited_at if those columns exist in students table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'invited_by'
  ) THEN
    UPDATE users SET
      invited_by = students.invited_by,
      invited_at = students.invited_at
    FROM students
    WHERE users.id = students.id;
  END IF;
END $$;

-- STEP 3: CREATE NEW CONSOLIDATED LEADS TABLE
-- Drop existing leads table if it exists
DROP TABLE IF EXISTS leads CASCADE;

CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),

  -- Lead classification
  status VARCHAR(20) DEFAULT 'waitlist' CHECK (status IN ('waitlist', 'interested', 'nurturing', 'converted')),
  source VARCHAR(50), -- 'website_analyzer', 'consultation', 'waitlist', 'content_download', etc.

  -- Additional data
  notes TEXT,
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',

  -- Tracking
  signup_date TIMESTAMP DEFAULT NOW(),
  last_engagement TIMESTAMP,
  converted_at TIMESTAMP,

  -- UTM tracking
  referrer_url TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- STEP 4: MIGRATE WAITLIST DATA to leads table
-- Only migrate columns that actually exist in waitlist table
DO $$
DECLARE
  has_source BOOLEAN;
  has_referrer_url BOOLEAN;
  has_utm_columns BOOLEAN;
BEGIN
  -- Check what columns exist in waitlist table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'waitlist' AND column_name = 'source'
  ) INTO has_source;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'waitlist' AND column_name = 'referrer_url'
  ) INTO has_referrer_url;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'waitlist' AND column_name = 'utm_source'
  ) INTO has_utm_columns;

  -- Insert with basic columns that should exist
  IF has_source AND has_referrer_url AND has_utm_columns THEN
    -- Full migration with all columns
    INSERT INTO leads (email, status, source, signup_date, referrer_url, utm_source, utm_medium, utm_campaign, created_at)
    SELECT
      email,
      'waitlist' as status,
      COALESCE(source, 'waitlist') as source,
      created_at as signup_date,
      referrer_url,
      utm_source,
      utm_medium,
      utm_campaign,
      created_at
    FROM waitlist
    WHERE NOT EXISTS (SELECT 1 FROM leads WHERE leads.email = waitlist.email);
  ELSIF has_source THEN
    -- Migration with source but no UTM tracking
    INSERT INTO leads (email, status, source, signup_date, created_at)
    SELECT
      email,
      'waitlist' as status,
      COALESCE(source, 'waitlist') as source,
      created_at as signup_date,
      created_at
    FROM waitlist
    WHERE NOT EXISTS (SELECT 1 FROM leads WHERE leads.email = waitlist.email);
  ELSE
    -- Basic migration with minimal columns
    INSERT INTO leads (email, status, source, signup_date, created_at)
    SELECT
      email,
      'waitlist' as status,
      'waitlist' as source,
      created_at as signup_date,
      created_at
    FROM waitlist
    WHERE NOT EXISTS (SELECT 1 FROM leads WHERE leads.email = waitlist.email);
  END IF;
END $$;

-- STEP 5: CREATE INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_payment_status ON users(payment_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_last_engagement ON leads(last_engagement);

-- STEP 6: ENABLE ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- STEP 7: CREATE RLS POLICIES for users table
CREATE POLICY "Service role and admins can manage users" ON users
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- STEP 8: UPDATE EXISTING RLS POLICIES to use users table
-- Drop old student-based policies
DROP POLICY IF EXISTS "Service role and admins can manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Service role and admins can manage campaign sends" ON campaign_sends;
DROP POLICY IF EXISTS "Service role and admins can manage email templates" ON email_templates;

-- Recreate with users table reference
CREATE POLICY "Service role and admins can manage campaigns" ON campaigns
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Service role and admins can manage campaign sends" ON campaign_sends
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Service role and admins can manage email templates" ON email_templates
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create policies for leads table
CREATE POLICY "Service role and admins can manage leads" ON leads
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- STEP 9: UPDATE TRIGGERS for updated_at columns
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- STEP 10: UPDATE FUNCTIONS to use new table names
CREATE OR REPLACE FUNCTION migrate_waitlist_to_leads()
RETURNS TABLE(migrated_count INTEGER, skipped_count INTEGER) AS $$
DECLARE
  migrated INTEGER := 0;
  skipped INTEGER := 0;
  waitlist_record RECORD;
BEGIN
  -- This function now works with the new leads table structure
  FOR waitlist_record IN
    SELECT email, created_at, source FROM waitlist
  LOOP
    IF NOT EXISTS (SELECT 1 FROM leads WHERE email = waitlist_record.email) THEN
      INSERT INTO leads (
        email,
        status,
        source,
        signup_date,
        custom_fields
      ) VALUES (
        waitlist_record.email,
        'waitlist',
        COALESCE(waitlist_record.source, 'waitlist'),
        waitlist_record.created_at,
        '{"migrated_from": "waitlist"}'::jsonb
      );
      migrated := migrated + 1;
    ELSE
      skipped := skipped + 1;
    END IF;
  END LOOP;
  RETURN QUERY SELECT migrated, skipped;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert lead to user
CREATE OR REPLACE FUNCTION convert_lead_to_user(lead_email TEXT, user_tier TEXT DEFAULT 'basic')
RETURNS BOOLEAN AS $$
DECLARE
  lead_record RECORD;
BEGIN
  -- Get lead information
  SELECT * INTO lead_record FROM leads WHERE email = lead_email;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Create user account
  INSERT INTO users (email, full_name, tier, payment_status)
  VALUES (
    lead_record.email,
    lead_record.name,
    user_tier,
    'pending'
  );

  -- Update lead status
  UPDATE leads
  SET status = 'converted', converted_at = NOW()
  WHERE email = lead_email;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, just update lead status
    UPDATE leads
    SET status = 'converted', converted_at = NOW()
    WHERE email = lead_email;
    RETURN TRUE;
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 11: ADD COMMENTS for documentation
COMMENT ON TABLE users IS 'User accounts for Web Launch Academy students and admins';
COMMENT ON TABLE leads IS 'Consolidated leads from all sources (waitlist, downloads, etc.)';
COMMENT ON COLUMN users.tier IS 'User subscription tier: basic, premium, vip, enterprise';
COMMENT ON COLUMN leads.status IS 'Lead progression: waitlist → interested → nurturing → converted';

-- STEP 12: CLEAN UP - Drop old students table (uncomment when ready)
-- WARNING: Only run this after verifying all data migrated successfully!
-- DROP TABLE students CASCADE;

-- STEP 13: UPDATE invite_tokens table to reference users instead of students
-- First add the constraint if it doesn't exist
DO $$
BEGIN
    -- Check if the foreign key constraint exists and add it if not
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'invite_tokens'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%invited_by%'
    ) THEN
        -- No foreign key exists, we can add it
        -- But first ensure the column exists and has compatible data
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invite_tokens' AND column_name = 'invited_by') THEN
            -- Column exists, add foreign key if all values are valid
            ALTER TABLE invite_tokens
            ADD CONSTRAINT fk_invite_tokens_invited_by
            FOREIGN KEY (invited_by) REFERENCES users(id);
        END IF;
    END IF;
END $$;