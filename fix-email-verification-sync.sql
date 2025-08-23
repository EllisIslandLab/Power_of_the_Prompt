-- Fix email verification sync between auth.users and students table
-- Run this in Supabase SQL Editor

-- Create function to sync email verification status
CREATE OR REPLACE FUNCTION public.sync_email_verification()
RETURNS trigger AS $$
BEGIN
  -- Update students table when auth.users email_confirmed_at changes
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Email just got verified
    UPDATE public.students 
    SET email_verified = true, updated_at = NOW()
    WHERE id = NEW.id;
    
    RAISE LOG 'Email verified for user %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users for email verification changes
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.sync_email_verification();

-- Also update the existing user creation function to set email_verified correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.students (id, full_name, email, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL  -- Set based on actual verification status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix existing unverified users (run this to sync current data)
UPDATE public.students 
SET email_verified = true, updated_at = NOW()
FROM auth.users 
WHERE students.id = auth.users.id 
  AND auth.users.email_confirmed_at IS NOT NULL 
  AND students.email_verified = false;

-- Check the sync worked
SELECT 
  s.email,
  s.email_verified as "students.email_verified",
  (u.email_confirmed_at IS NOT NULL) as "auth.email_confirmed"
FROM public.students s
JOIN auth.users u ON s.id = u.id
ORDER BY s.created_at DESC
LIMIT 5;