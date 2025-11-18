-- Create functions to increment campaign open and click counts
-- These functions are called by the email tracking endpoints

-- Function to increment opened_count when an email is opened for the first time
CREATE OR REPLACE FUNCTION increment_campaign_opens(campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE campaigns
  SET opened_count = opened_count + 1
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment clicked_count when a link is clicked for the first time
CREATE OR REPLACE FUNCTION increment_campaign_clicks(campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE campaigns
  SET clicked_count = clicked_count + 1
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION increment_campaign_opens IS 'Increments the opened_count for a campaign when an email is opened';
COMMENT ON FUNCTION increment_campaign_clicks IS 'Increments the clicked_count for a campaign when a link is clicked';
