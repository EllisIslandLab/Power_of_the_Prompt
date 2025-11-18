-- Add admin user for Matthew Ellis
-- This migration creates or updates the admin user

-- First, check if user exists and update to admin role
UPDATE users
SET
  role = 'admin',
  tier = 'vip',
  updated_at = NOW()
WHERE email = 'hello@weblaunchacademy.com';

-- If user doesn't exist, insert them
INSERT INTO users (
  email,
  full_name,
  email_verified,
  role,
  tier,
  payment_status,
  created_at,
  updated_at
)
SELECT
  'hello@weblaunchacademy.com',
  'Matthew Ellis',
  true,
  'admin',
  'vip',
  'paid',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'hello@weblaunchacademy.com'
);

-- Verify admin user was created/updated
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM users
  WHERE email = 'hello@weblaunchacademy.com' AND role = 'admin';

  IF admin_count = 0 THEN
    RAISE EXCEPTION 'Failed to create/update admin user';
  ELSE
    RAISE NOTICE 'Admin user verified: hello@weblaunchacademy.com';
  END IF;
END $$;
