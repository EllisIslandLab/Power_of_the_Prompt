-- Add campaign management tables for email marketing
-- Final clean version that handles all existing objects

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Service role can manage campaign sends" ON campaign_sends;
DROP POLICY IF EXISTS "Service role can manage email templates" ON email_templates;
DROP POLICY IF EXISTS "Service role can manage leads" ON leads;

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,

  -- Segmentation options
  target_audience JSONB DEFAULT '{}',

  -- Scheduling
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,

  -- Metadata
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create campaign_sends table for tracking individual sends
CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),

  -- Tracking
  sent_at TIMESTAMP DEFAULT NOW(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,

  -- Metadata
  send_error TEXT,
  email_client VARCHAR(100),
  user_agent TEXT
);

-- Create email_templates table for reusable templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  subject_template VARCHAR(255) NOT NULL,
  content_template TEXT NOT NULL,

  -- Template variables for personalization
  variables JSONB DEFAULT '[]',

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create leads table for storing email campaign recipients
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),

  -- Lead source and metadata
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',

  -- Segmentation data
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',

  -- Tracking
  signup_date TIMESTAMP DEFAULT NOW(),
  last_engagement TIMESTAMP,
  unsubscribed_at TIMESTAMP,

  -- Source tracking
  referrer_url TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign_id ON campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_email ON campaign_sends(recipient_email);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_sent_at ON campaign_sends(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns (recreate them)
CREATE POLICY "Service role can manage campaigns" ON campaigns
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage campaign sends" ON campaign_sends
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage email templates" ON email_templates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

-- Add updated_at triggers (recreate them)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some default email templates (avoid duplicates)
INSERT INTO email_templates (name, description, category, subject_template, content_template, variables)
SELECT 'Welcome Series - Email 1', 'Welcome new leads to Web Launch Academy', 'welcome', 'Welcome to Web Launch Academy, {{name}}!', '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Welcome to Web Launch Academy, {{name}}!</h2><p>Thank you for your interest in learning web development. You''re about to embark on an exciting journey to build your own professional website.</p><div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3>What''s Next?</h3><ul><li>🎯 Free website analysis (if you haven''t done it yet)</li><li>📚 Access to our comprehensive course materials</li><li>🤝 One-on-one coaching sessions</li><li>💼 Build a professional online presence</li></ul></div><div style="text-align: center; margin: 30px 0;"><a href="https://weblaunchacademy.com/portal" style="background-color: #ffdb57; color: #11296b; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Get Started Now</a></div><p>If you have any questions, simply reply to this email. I personally read and respond to every message.</p><p>Best regards,<br>Matthew Ellis<br>Web Launch Academy</p><hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;"><p style="color: #666; font-size: 12px;">You received this email because you signed up for Web Launch Academy.<a href="{{unsubscribe_url}}" style="color: #666;">Unsubscribe</a></p></div>', '["name", "unsubscribe_url"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name = 'Welcome Series - Email 1');

-- Function to migrate existing leads from Airtable (can be called via API)
CREATE OR REPLACE FUNCTION migrate_airtable_leads()
RETURNS TABLE(migrated_count INTEGER, error_count INTEGER) AS $$
DECLARE
  migrated INTEGER := 0;
  errors INTEGER := 0;
BEGIN
  RETURN QUERY SELECT migrated, errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to migrate waitlist to leads
CREATE OR REPLACE FUNCTION migrate_waitlist_to_leads()
RETURNS TABLE(migrated_count INTEGER, skipped_count INTEGER) AS $$
DECLARE
  migrated INTEGER := 0;
  skipped INTEGER := 0;
  waitlist_record RECORD;
BEGIN
  FOR waitlist_record IN
    SELECT email, created_at, source FROM waitlist
  LOOP
    IF NOT EXISTS (SELECT 1 FROM leads WHERE email = waitlist_record.email) THEN
      INSERT INTO leads (
        email,
        source,
        status,
        tags,
        signup_date,
        custom_fields
      ) VALUES (
        waitlist_record.email,
        waitlist_record.source || '_waitlist',
        'active',
        '["waitlist", "coming_soon"]'::jsonb,
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

-- Function to update waitlist notified status when emails are opened
CREATE OR REPLACE FUNCTION update_waitlist_notification(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE waitlist
  SET notified = TRUE
  WHERE email = email_address AND notified = FALSE;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;