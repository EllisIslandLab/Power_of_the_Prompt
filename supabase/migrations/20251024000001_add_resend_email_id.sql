-- Add resend_email_id to campaign_sends for webhook tracking
-- This allows us to match webhook events from Resend to our records

ALTER TABLE campaign_sends
ADD COLUMN IF NOT EXISTS resend_email_id VARCHAR(255);

-- Create index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_campaign_sends_resend_email_id
ON campaign_sends(resend_email_id);

-- Add comments for documentation
COMMENT ON COLUMN campaign_sends.resend_email_id IS 'Email ID from Resend API for webhook event matching';
