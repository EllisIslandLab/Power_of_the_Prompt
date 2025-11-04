-- ============================================================================
-- UPDATE EMAIL TEMPLATES
-- ============================================================================
-- Fix email templates to:
-- 1. Use hello@ instead of noreply@
-- 2. Fix localhost URLs to production
-- 3. Add better instructions
-- ============================================================================

-- Update the Welcome Series - Email 1 template
UPDATE email_templates
SET
  content_template = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Welcome to Web Launch Academy, {{name}}!</h2>

    <p>Thank you for your interest in learning web development. You''re about to embark on an exciting journey to build your own professional website.</p>

    <div style="background-color: #ffdb57; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center;">
      <h3 style="color: #11296b; font-size: 20px; margin-bottom: 15px;">🎁 Free 1-on-1 Introduction Session</h3>
      <p style="color: #11296b; margin-bottom: 15px; line-height: 1.6;">
        Want to learn more about what to expect in the course? Reply to this email or send a message to
        <a href="mailto:hello@weblaunchacademy.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">hello@weblaunchacademy.com</a>
        to schedule your free 1-on-1 session with Matthew!
      </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>What''s Next?</h3>
      <ul>
        <li>🎯 Free website analysis (if you haven''t done it yet)</li>
        <li>📚 Access to our comprehensive course materials</li>
        <li>🤝 One-on-one coaching sessions</li>
        <li>💼 Build a professional online presence</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://weblaunchacademy.com/portal"
         style="background-color: #ffdb57; color: #11296b; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Get Started Now
      </a>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
      <p style="color: #475569; font-size: 14px; margin-bottom: 10px;">
        Questions? Just reply to this email - I personally read and respond to every message.
      </p>
      <p style="color: #475569; font-size: 14px; margin: 0;">
        Best regards,<br>
        <strong>Matthew Ellis</strong><br>
        Founder, Web Launch Academy
      </p>
    </div>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

    <p style="color: #666; font-size: 12px; text-align: center;">
      You received this email because you signed up for Web Launch Academy.<br>
      Questions or feedback? Email us at <a href="mailto:hello@weblaunchacademy.com" style="color: #666;">hello@weblaunchacademy.com</a>
    </p>
  </div>',
  updated_at = NOW()
WHERE name = 'Welcome Series - Email 1';

-- Verify the update
SELECT
  name,
  description,
  subject_template,
  updated_at
FROM email_templates
WHERE name = 'Welcome Series - Email 1';
