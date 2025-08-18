-- Create admin profile for existing user
INSERT INTO admin_users (user_id, full_name, email, role, permissions)
VALUES (
  'c91e87c1-4293-40b2-aae5-8b4e91274356',
  'Matt Ellis', 
  'mattjellis1@gmail.com',
  'Super Admin',
  ARRAY['all']
);