-- ============================================================================
-- FIX CONVERT LEAD TO USER TRIGGER
-- ============================================================================
-- The convert_lead_to_user trigger references a non-existent user_id column
-- This script removes the broken trigger and creates a working one
-- ============================================================================

-- Step 1: Drop the broken trigger and function
DROP TRIGGER IF EXISTS convert_lead_to_user_trigger ON users;
DROP FUNCTION IF EXISTS convert_lead_to_user() CASCADE;

-- Step 2: Create a new working version that just marks leads as converted
-- (without trying to set a user_id that doesn't exist)
CREATE OR REPLACE FUNCTION convert_lead_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- When a user record is created with an email that matches a lead,
  -- mark the lead as converted
  UPDATE public.leads
  SET
    status = 'converted',
    converted_at = NOW(),
    updated_at = NOW()
  WHERE email = NEW.email
    AND status != 'converted';

  RETURN NEW;
END;
$$;

-- Step 3: Recreate the trigger
CREATE TRIGGER convert_lead_to_user_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION convert_lead_to_user();

-- Verify the trigger exists
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'convert_lead_to_user_trigger';
