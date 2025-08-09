-- Manually confirm email for testing (replace with your email)
-- Run this in Supabase SQL Editor

UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email = 'your-email@example.com';

-- Check if it worked
SELECT email, email_confirmed_at, confirmed_at 
FROM auth.users 
WHERE email = 'your-email@example.com';