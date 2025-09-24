-- Add admin role to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin'));

-- Create admin login page access policy
CREATE POLICY "Admins can access admin functions" ON campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = auth.uid()
      AND students.role = 'admin'
    )
  );

-- Update existing service role policies to also allow admin users
DROP POLICY IF EXISTS "Service role can manage campaigns" ON campaigns;
CREATE POLICY "Service role and admins can manage campaigns" ON campaigns
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = auth.uid()
      AND students.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role can manage campaign sends" ON campaign_sends;
CREATE POLICY "Service role and admins can manage campaign sends" ON campaign_sends
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = auth.uid()
      AND students.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role can manage email templates" ON email_templates;
CREATE POLICY "Service role and admins can manage email templates" ON email_templates
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = auth.uid()
      AND students.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role can manage leads" ON leads;
CREATE POLICY "Service role and admins can manage leads" ON leads
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = auth.uid()
      AND students.role = 'admin'
    )
  );

-- Create your admin user (replace with your actual email)
-- You'll need to sign up through the regular flow first, then run this
-- UPDATE students SET role = 'admin' WHERE email = 'your-admin-email@example.com';