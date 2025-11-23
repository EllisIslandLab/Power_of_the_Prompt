-- ============================================
-- FIX DEMO PROJECT TRIGGER
-- ============================================
-- This script fixes the trigger that creates users from demo projects
-- by making it SECURITY DEFINER to bypass RLS on the users table.
-- ============================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS create_user_from_project ON demo_projects;
DROP FUNCTION IF EXISTS ensure_user_from_project();

-- Recreate function with SECURITY DEFINER
-- This allows the trigger to insert into users table even with restrictive RLS
CREATE OR REPLACE FUNCTION ensure_user_from_project()
RETURNS trigger AS $$
DECLARE
  user_id_var uuid;
BEGIN
  -- Skip if user_email looks like a placeholder
  -- (temporary emails are used before user enters real email)
  IF NEW.user_email LIKE 'temp_%@placeholder.local' THEN
    RETURN NEW;
  END IF;

  -- Create or get user
  INSERT INTO users (email, full_name)
  VALUES (NEW.user_email, NEW.business_name)
  ON CONFLICT (email) DO UPDATE
  SET updated_at = now()
  RETURNING id INTO user_id_var;

  -- Link project to user
  NEW.user_id := user_id_var;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER create_user_from_project
  BEFORE INSERT ON demo_projects
  FOR EACH ROW
  WHEN (NEW.user_email IS NOT NULL AND NEW.user_email != '')
  EXECUTE FUNCTION ensure_user_from_project();

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger fixed successfully!';
  RAISE NOTICE 'The trigger now:';
  RAISE NOTICE '  • Uses SECURITY DEFINER to bypass RLS';
  RAISE NOTICE '  • Skips placeholder emails (temp_*@placeholder.local)';
  RAISE NOTICE '  • Only fires for non-empty user_email';
END $$;
