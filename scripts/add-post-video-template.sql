-- Add Post-Video Session Follow-Up Email Template
-- Run this in Supabase SQL Editor or via psql

INSERT INTO email_templates (
  name,
  description,
  category,
  subject_template,
  content_template,
  variables,
  is_active,
  created_by
) VALUES (
  'Post-Video Session Follow-Up',
  'Conclusory email sent to students after a 1-on-1 video consultation session',
  'follow-up',
  'Thanks for your time, {{name}}!',
  'Thanks so much for your time, {{name}},

It was great meeting with you! Here''s everything you need to move forward:

Pricing & Discount Codes:
Visit www.weblaunchacademy.com/pricing and use these codes:

• FIRSTFORFREE - 100% off the core course (Web Launch Academy - Website Development Course)
• TOOLTIME240 - $240 off the A+ Guarantee Program (single payment)
• TOOLS240 - $20 off per month for 12 months (A+ Guarantee Program monthly payment)

What You Get:
The Core Course (FREE with code):
You''ll learn the exact methods I used to build my own site, my wife''s site (www.mechescreations.com), and my brother''s practice site (www.winchestertherapyservices.com - still under construction). This foundational course gives you everything you need to build a professional website you own completely.

Optional Paid Supplements:

LVL UPs (1-on-1 Sessions) - Personalized sessions where we tackle specific goals, fixes, or upgrades for your site. I''ll work directly with your code through a one-time repo setup, allowing me to submit code change requests that you can review and accept. Each session guarantees at least one meaningful improvement or fix.

The A+ Guarantee Program - Everything you need for a guaranteed, fully functional website with no hidden costs. This includes:

• Complete repo setup and ongoing support
• Prompt templates, style guides, animations, and form collection modals
• Code editor recommendations and optimization tools
• Updated recordings and bonus content
• Future course additions (payment processing with Stripe, Square, or other platforms you request)
• Most importantly: Learn without frustration, getting stuck, or paying for extra sessions

Deadline: Must purchase by November 3rd (unless you choose the Flex Package below)

The Flex Package - Acts as a down payment toward any Web Launch Academy service. Includes 100% credit toward repo setup when applied to LVL UPs, plus a 2-week extension if you''re still considering the Guarantee Program.

Why This Works For You:
With your excellent PC setup, you''re in a fantastic position to take full advantage of what Web Launch Academy offers. Unlike traditional website builders, you''ll learn to build AND own your site completely - with the option to follow personalized 1-on-1 guidance tailored to your unique needs as an RPC (Registered Professional Counselor).

In class, I''ll be building a financial coaching site as the primary example, but all students so far are RPCs, so you''re in excellent company! AI has fundamentally changed website development, giving us a powerful new option that lets you retain complete control. I believe this is the best path forward, and I''m excited to prove it.

Next Steps:

• Class starts November 3rd at 7 AM EST
• Live attendance is ideal, but recordings will be available after each session
• I''ll provide whatever resources you need to build a fully functional website you own and love

Thank you again for your time and consideration. It''s been wonderful meeting you! If you have any questions, don''t hesitate to reach out by email or phone.

Web Launch Academy LLC
Matthew Ellis
Founder and Web Coach
(440) 354-9904
- Build Once, Own Forever! -',
  '["name"]'::jsonb,
  true,
  'admin'
);

-- Verify the insert
SELECT id, name, category, created_at
FROM email_templates
WHERE name = 'Post-Video Session Follow-Up';
