# Architecture Mastery Toolkit - Final Setup ✅

**All files updated with correct slug:** `architecture-mastery-toolkit`

---

## Step 1: Update Database Price (30 seconds)

Copy and paste this into Supabase SQL Editor:

```sql
-- Update price to $190
UPDATE products
SET price = 190
WHERE slug = 'architecture-mastery-toolkit';

-- Verify it worked
SELECT *
FROM products
WHERE slug = 'architecture-mastery-toolkit';
```

**Expected:** You should see the product with `price = 190`

✅ **That's it for database setup!**

---

## Step 2: Create $190 Price in Stripe (3 minutes)

### Go to your product:
https://dashboard.stripe.com/products/prod_TLpZ1AjXFUXzBT

### Add the $190 price:

1. Click **"Add another price"**
2. Enter:
   - Price: **$190.00**
   - Currency: **USD**
   - Billing: **One time**
3. Click **"Add price"**

### Add lookup key:

4. Click on the **new $190 price** you just created
5. Scroll down to **"Lookup key"** section
6. Click **"Add lookup key"**
7. Enter exactly: `architecture_toolkit_full_v1`
8. Click **"Add"**

### Archive old price (optional):

9. Go back to the product page
10. Find any old prices (like $497)
11. Click the **⋮** menu next to it
12. Select **"Archive"**

✅ **Done with Stripe price!**

---

## Step 3: Create $100 Off Coupon (2 minutes)

### Go to Stripe Coupons:
https://dashboard.stripe.com/coupons

### Create the coupon:

1. Click **"Create coupon"**
2. Fill in:
   ```
   Name: Toolkit $100 Off
   Coupon ID: TOOLKIT100
   Type: Amount off
   Amount: $100.00
   Currency: USD
   Duration: Once
   ```
3. Under **"Applies to"**:
   - Select **"Specific products"**
   - Search for: "Architecture Mastery Toolkit"
   - Check the box next to it
4. Click **"Create coupon"**

✅ **Coupon created!**

---

## Step 4: Test Everything (5 minutes)

**IMPORTANT:** Do this in Stripe TEST mode first!

1. Toggle Stripe to **TEST mode** (top-right corner)
2. Create a test price ($190) with lookup key
3. Create a test coupon (TOOLKIT100)

### Test the flow:

1. **Visit:** http://localhost:3000/portal/resources
   - Should show: "View Details - $190" ✅

2. **Click "View Details"**
   - Should go to: `/portal/products/architecture-toolkit`
   - Should show product page with price from database ✅

3. **Click "Unlock Toolkit - $190"**
   - Should redirect to Stripe Checkout
   - Should show **$190.00** ✅

4. **Apply coupon:**
   - Click **"Add promotion code"**
   - Enter: `TOOLKIT100`
   - Price should drop to **$90.00** ✅

5. **Complete purchase:**
   ```
   Card: 4242 4242 4242 4242
   Expiration: 12/34
   CVC: 123
   ZIP: 12345
   ```

6. **Verify access:**
   - Should redirect back to product page
   - Should see green banner: "You have full access to all X resources"
   - Click on categories to see resources ✅

### Check the database:

```sql
SELECT
  p.amount_paid,
  p.status,
  p.access_granted,
  pr.name as product_name
FROM purchases p
JOIN products pr ON p.product_id = pr.id
WHERE pr.slug = 'architecture-mastery-toolkit'
ORDER BY p.created_at DESC
LIMIT 1;
```

**Expected:**
- `amount_paid: 90.00` (if coupon was used)
- `status: completed`
- `access_granted: true`

✅ **If all checks pass, you're ready for production!**

---

## Step 5: Go Live (Optional - when ready)

1. **Toggle Stripe to LIVE mode**
2. **Repeat Steps 2-3 in LIVE mode:**
   - Add $190 price (with lookup key)
   - Create TOOLKIT100 coupon
3. **Update `.env` with live Stripe keys:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. **Restart your app**
5. **Test with real card** (then refund yourself)

---

## What's Updated ✅

All files now use the correct slug: `architecture-mastery-toolkit`

### Updated Files:
- ✅ `/src/app/portal/resources/page.tsx` - Shows $190 and correct URL
- ✅ `/src/app/portal/products/architecture-toolkit/page.tsx` - Uses correct slug in database queries
- ✅ `/src/webhooks/stripe/handlers/ToolkitPurchaseHandler.ts` - Checks for correct slug
- ✅ `/src/app/api/create-checkout/route.ts` - Has coupon support enabled
- ✅ `/scripts/quick-toolkit-update.sql` - Uses correct slug
- ✅ `/scripts/update-toolkit-price.sql` - Uses correct slug

### Key Details:
- **Database Slug:** `architecture-mastery-toolkit`
- **URL Path:** `/portal/products/architecture-toolkit` (folder name)
- **Stripe Product ID:** `prod_TLpZ1AjXFUXzBT`
- **Stripe Lookup Key:** `architecture_toolkit_full_v1`
- **Price:** $190
- **Coupon Code:** `TOOLKIT100` ($100 off)
- **Final Price with Coupon:** $90

---

## Summary

Your customer who paid $90 (with the coupon) will get access as soon as you:

1. ✅ Run the SQL update (30 seconds)
2. ✅ Add $190 price in Stripe (3 minutes)
3. ✅ Create TOOLKIT100 coupon (2 minutes)

**Total time:** ~5 minutes

Then they'll have instant access to all 30+ toolkit resources! 🎉

---

## Quick Links

- **Stripe Product:** https://dashboard.stripe.com/products/prod_TLpZ1AjXFUXzBT
- **Stripe Coupons:** https://dashboard.stripe.com/coupons
- **Stripe Webhooks:** https://dashboard.stripe.com/webhooks
- **Portal Resources:** http://localhost:3000/portal/resources
- **Product Page:** http://localhost:3000/portal/products/architecture-toolkit

---

## Need Help?

All the code is updated and ready. Just run the SQL update and configure Stripe!
