-- =========================================================
-- Check for Toolkit Purchase in Database
-- =========================================================

-- 1. Get your user ID (you'll need this)
SELECT id, email, full_name
FROM users
WHERE email = 'YOUR_EMAIL_HERE'  -- Replace with your test email
LIMIT 1;

-- 2. Get the product ID for Architecture Mastery Toolkit
SELECT id, slug, name, price
FROM products
WHERE slug = 'architecture-mastery-toolkit';

-- 3. Check if purchase exists for your user
-- (Replace USER_ID with the ID from query 1)
SELECT
  p.id,
  p.user_id,
  p.product_id,
  p.stripe_payment_intent,
  p.amount_paid,
  p.status,
  p.access_granted,
  prod.name as product_name
FROM purchases p
JOIN products prod ON prod.id = p.product_id
WHERE p.user_id = 'YOUR_USER_ID_HERE'  -- Replace with your user ID
  AND prod.slug = 'architecture-mastery-toolkit';

-- 4. Show ALL purchases for the toolkit
SELECT
  p.id,
  p.user_id,
  u.email,
  prod.name as product_name,
  p.amount_paid,
  p.status,
  p.access_granted
FROM purchases p
JOIN products prod ON prod.id = p.product_id
JOIN users u ON u.id = p.user_id
WHERE prod.slug = 'architecture-mastery-toolkit';

-- =========================================================
-- If query 3 returns 0 rows, the webhook hasn't processed yet
-- Check Stripe Dashboard → Webhooks → Events to see if it fired
-- =========================================================
