# Stripe Quick Setup - Architecture Toolkit ($190 + Coupon)

**Your Stripe Product ID:** `prod_TLpZ1AjXFUXzBT`

---

## Step 1: Update Database (30 seconds)

Run in Supabase SQL Editor:
```bash
scripts/quick-toolkit-update.sql
```

Or copy-paste this:
```sql
UPDATE products
SET price = 190, stripe_product_id = 'prod_TLpZ1AjXFUXzBT'
WHERE slug = 'architecture-toolkit';
```

✅ **Verify:** Should see `price: 190` when you query the table

---

## Step 2: Update Stripe Price (3 minutes)

### Go to your Stripe product:
https://dashboard.stripe.com/products/prod_TLpZ1AjXFUXzBT

### Add new price:

1. Click **"Add another price"**
2. Fill in:
   - **Price:** `190.00`
   - **Currency:** USD
   - **Billing:** One time
3. Click **"Add price"**

### Add lookup key to new price:

4. Click on the **new $190 price** you just created
5. Scroll to **"Lookup key"**
6. Click **"Add lookup key"**
7. Enter: `architecture_toolkit_full_v1`
8. Click **"Add"**

### Archive old price:

9. Go back to product page
10. Find the old $497 price
11. Click the **⋮** menu
12. Select **"Archive"**

✅ **Done!** Your code will now use the $190 price automatically.

---

## Step 3: Create $100 Coupon (2 minutes)

### Create coupon:

1. Go to: https://dashboard.stripe.com/coupons
2. Click **"Create coupon"**
3. Fill in:
   ```
   Name: Toolkit $100 Off
   Coupon ID: TOOLKIT100
   Type: Amount off
   Amount: $100.00
   Currency: USD
   Duration: Once
   ```
4. Under **"Applies to"**, select:
   - **Specific products**
   - Search for: "Architecture Mastery Toolkit"
   - Select it
5. Click **"Create coupon"**

✅ **Test code:** `TOOLKIT100` (customers enter this at checkout)

---

## Step 4: Test It! (5 minutes)

### Test in Stripe Test Mode:

1. **Make sure Stripe is in TEST mode** (toggle in top-right)
2. **Create test coupon** with same settings as above
3. **Create test price** ($190 with lookup key)

### Test the flow:

1. Sign in to your portal as a student
2. Go to: http://localhost:3000/portal/resources
3. Click **"View Details - $190"**
4. Click **"Unlock Toolkit - $190"**
5. In Stripe checkout:
   - Click **"Add promotion code"**
   - Enter: `TOOLKIT100`
   - Price should drop to **$90.00**
6. Use test card: `4242 4242 4242 4242`
7. Complete purchase
8. Should redirect to product page
9. Should see: **"You have full access to all X resources"**

### Verify in Supabase:

```sql
SELECT amount_paid, status, access_granted
FROM purchases
ORDER BY created_at DESC
LIMIT 1;
```

Should show:
- `amount_paid: 90.00` (if coupon used)
- `status: completed`
- `access_granted: true`

✅ **If all checks pass, you're ready for production!**

---

## Step 5: Go Live (5 minutes)

### Switch to Live Mode:

1. **Toggle Stripe to LIVE mode** (top-right)
2. **Repeat Steps 2-3 in LIVE mode:**
   - Add $190 price to LIVE product
   - Add lookup key: `architecture_toolkit_full_v1`
   - Create LIVE coupon: `TOOLKIT100`
3. **Update environment variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_...  # Your LIVE key
   STRIPE_WEBHOOK_SECRET=whsec_... # From LIVE webhook
   ```
4. **Restart your server**
5. **Test with real card** (then refund yourself)

---

## Quick Reference

### Your Stripe Details:
- **Product ID:** `prod_TLpZ1AjXFUXzBT`
- **Lookup Key:** `architecture_toolkit_full_v1`
- **Price:** $190.00 (one-time)
- **Coupon Code:** `TOOLKIT100` ($100 off)
- **Final Price with Coupon:** $90.00

### URLs:
- **Product:** https://dashboard.stripe.com/products/prod_TLpZ1AjXFUXzBT
- **Coupons:** https://dashboard.stripe.com/coupons
- **Webhooks:** https://dashboard.stripe.com/webhooks

---

## Troubleshooting

### Price not updating in checkout?
**Check:**
- New $190 price has lookup key `architecture_toolkit_full_v1`
- Old $497 price is archived
- You're in the right Stripe mode (test vs live)

### Coupon not working?
**Check:**
- Coupon code is `TOOLKIT100` (case sensitive)
- Coupon applies to "Architecture Mastery Toolkit" product
- Coupon hasn't expired
- You're using the test coupon in test mode (or live in live mode)

### Webhook not firing?
**Check:**
- Webhook URL: `https://your-domain.com/api/webhooks/stripe`
- Events selected: `checkout.session.completed`
- Signing secret in `.env` matches webhook secret in Stripe

---

## Summary

✅ **Database:** Updated to $190 with product ID
✅ **Stripe Price:** $190 with lookup key
✅ **Coupon:** TOOLKIT100 for $100 off
✅ **Checkout:** Coupon entry enabled
✅ **Webhook:** Records actual amount paid
✅ **Access:** Granted instantly after purchase

**Customer pays:** $90 (with coupon) or $190 (without)
**Customer gets:** All 30+ toolkit resources immediately
**You get:** Passive income from professional templates! 🎉
