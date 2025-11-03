# Stripe Setup for Architecture Mastery Toolkit

## What I Created

1. **Product Page:** `/portal/products/architecture-toolkit`
   - Shows sales page when not purchased
   - Shows all content when purchased
   - "Unlock Toolkit - $497" button

2. **Checkout API:** `/api/create-checkout`
   - Uses Stripe lookup keys (no hardcoded price IDs!)
   - Creates checkout session

3. **Webhook Handler:** Automatically records purchase when payment completes

---

## Stripe Setup (Do This Once)

### Step 1: Create Product in Stripe

1. Go to **Stripe Dashboard** → **Products** → **Add product**
2. Fill in:
   - **Name:** Architecture Mastery Toolkit
   - **Description:** (optional) Professional architectural patterns for web development
   - **Pricing:** One-time payment
   - **Price:** $497
   - **Product ID:** You said it's `prod_TLpZ1AjXFUXzBT` ✓

### Step 2: Add Lookup Key

1. Click on the **price** you just created (the $497 one)
2. Scroll to "Lookup key" section
3. Click **Add lookup key**
4. Enter exactly: `architecture_toolkit_full_v1`
5. **Save**

**Why?** This lets you change the price later without changing code. Just create a new price with the same lookup key!

### Step 3: Configure Webhook

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL:** `https://your-domain.com/api/webhooks/stripe`
4. **Events to send:** Select:
   - `checkout.session.completed`
5. **Save**
6. Copy the **Signing secret** (starts with `whsec_`)

### Step 4: Add to `.env.local`

```bash
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # from step 3
NEXT_PUBLIC_URL=https://your-domain.com # or http://localhost:3000 for dev
```

---

## Testing Purchase Flow

### Test Mode (Before Going Live)

1. Use Stripe **test mode** (toggle in top right of dashboard)
2. Use test card: `4242 4242 4242 4242`
   - Any future expiration date
   - Any 3-digit CVC
   - Any ZIP code

### Test Steps:

1. **Sign up as a student account** (not admin)
2. **Go to** `/portal/resources`
3. **Click** "View Details - $497"
4. Should see sales page with "Unlock Toolkit" button
5. **Click** "Unlock Toolkit"
6. Should redirect to Stripe Checkout
7. **Use test card** to complete payment
8. Should redirect back to product page
9. **Now should see** all 30 resources unlocked!

### Verify Purchase:

Check Supabase → `purchases` table → should see new row with:
- `user_id` = your student user ID
- `product_id` = Architecture Toolkit product ID
- `status` = 'completed'
- `access_granted` = true

---

## Going Live

### Checklist:

- [ ] Switch Stripe to **Live mode**
- [ ] Create live product (same setup as test)
- [ ] Add live lookup key: `architecture_toolkit_full_v1`
- [ ] Update webhook URL to production domain
- [ ] Update `.env` with live Stripe keys
- [ ] Test with real card (then refund yourself)

---

## Changing Price Later

Want to change from $497 to $697?

1. Go to **Stripe product page**
2. Click **Add another price**
3. Enter new price: $697
4. Add lookup key: `architecture_toolkit_full_v1` (same key!)
5. Archive the old $497 price

**Done!** Your app automatically uses the new price. No code changes needed.

---

## Troubleshooting

### "Failed to create checkout"
- Check `.env.local` has `STRIPE_SECRET_KEY`
- Check product has lookup key `architecture_toolkit_full_v1`

### Webhook not working
- Check webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Check webhook events include `checkout.session.completed`
- Check Stripe Dashboard → Webhooks → see event logs

### Purchase not showing up
- Check Supabase `purchases` table
- Check webhook logs in Stripe Dashboard
- Check your server logs for errors

---

## Security Notes

✅ **Good:**
- Content is protected by RLS - students can only see what they purchased
- Webhook signature is verified
- User authentication required before checkout

❌ **Never:**
- Never commit `.env` files to git
- Never share webhook secrets
- Never use live keys in development
