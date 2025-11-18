-- Reset demo expiration to 24 hours whenever it's modified
-- This creates a rolling 24-hour window that resets on every modification

-- Function to reset expires_at on every update
CREATE OR REPLACE FUNCTION reset_demo_expiry_on_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset expires_at to 24 hours from now whenever the demo is updated
  NEW.expires_at := now() + interval '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_reset_demo_expiry_on_update ON demo_projects;

-- Create trigger that fires before any update to demo_projects
CREATE TRIGGER trigger_reset_demo_expiry_on_update
  BEFORE UPDATE ON demo_projects
  FOR EACH ROW
  EXECUTE FUNCTION reset_demo_expiry_on_update();

-- Update the comment to reflect the rolling expiration behavior
COMMENT ON COLUMN demo_projects.expires_at IS 'Demo code expires 24 hours after last modification (rolling window)';
COMMENT ON FUNCTION reset_demo_expiry_on_update() IS 'Automatically resets expires_at to 24 hours from now on every demo update';
COMMENT ON TRIGGER trigger_reset_demo_expiry_on_update ON demo_projects IS 'Resets expiration timer whenever demo is modified';
