# Architecture Mastery Toolkit - Setup Complete ✅

Your toolkit is now configured for the $190 sale with $100 coupon support!

---

## ✅ What I Just Fixed

### 1. **Display Price Updated**
- `/portal/resources` page now shows **$190** (was $497)
- Both the featured card and resource list updated

### 2. **Coupon Support Enabled**
- `/api/create-checkout` now has `allow_promotion_codes: true`
- Customers will see "Add promotion code" link in Stripe checkout

### 3. **Documentation Created**
Three comprehensive guides created:
- `TOOLKIT-PRICE-UPDATE.md` - Complete setup instructions
- `scripts/update-toolkit-price.sql` - Database update script
- `TOOLKIT-SETUP-SUMMARY.md` - This file

---

## 🚀 What You Need To Do (5 Steps)

### Step 1: Update Database Price (2 minutes)

Open Supabase SQL Editor and run:
```bash
scripts/update-toolkit-price.sql
```

Or just this one line:
```sql
UPDATE products SET price = 190 WHERE slug = 'architecture-toolkit';
```

**Verify:**
```sql
SELECT price FROM products WHERE slug = 'architecture-toolkit';
-- Should show: 190
```

---

### Step 2: Update Stripe Price (5 minutes)

1. Go to [Stripe Products](https://dashboard.stripe.com/products)
2. Find "Architecture Mastery Toolkit" (ID: `prod_TLpZ1AjXFUXzBT`)
3. Click **"Add another price"**
4. Set price: **$190.00**
5. Click on the new price
6. Add lookup key: `architecture_toolkit_full_v1`
7. Archive the old $497 price

**Why:** Code uses the lookup key, so it automatically uses the new price!

---

### Step 3: Create $100 Coupon (3 minutes)

1. Go to [Stripe Coupons](https://dashboard.stripe.com/coupons)
2. Click **"Create coupon"**
3. Settings:
   ```
   Name: TOOLKIT100
   Discount: $100.00 off
   Duration: Once
   Applies to: Architecture Mastery Toolkit
   ```
4. **Save**

**Test:** Use code `TOOLKIT100` in test mode first

---

### Step 4: Test Complete Flow (10 minutes)

**In Test Mode:**

1. **Sign in as a student** (http://localhost:3000/login)

2. **Go to Resources:**
   ```
   http://localhost:3000/portal/resources
   ```
   - ✅ Should show "View Details - $190"

3. **Click "View Details":**
   - ✅ Should show product page
   - ✅ Price from database: $190
   - ✅ "Unlock Toolkit - $190" button

4. **Click "Unlock Toolkit":**
   - ✅ Redirects to Stripe checkout
   - ✅ Shows $190.00
   - ✅ Has "Add promotion code" link

5. **Enter Coupon:**
   - Click "Add promotion code"
   - Enter: `TOOLKIT100`
   - ✅ Price drops to $90.00

6. **Complete Purchase:**
   ```
   Card: 4242 4242 4242 4242
   Exp: 12/34
   CVC: 123
   ```
   - ✅ Payment processes
   - ✅ Redirects to product page
   - ✅ Shows green "You have full access" banner
   - ✅ All resources unlocked

7. **Check Supabase:**
   ```sql
   SELECT amount_paid, status, access_granted
   FROM purchases
   WHERE user_id = '<your-test-user-id>';
   ```
   - ✅ `amount_paid: 90.00` (with coupon)
   - ✅ `status: completed`
   - ✅ `access_granted: true`

---

### Step 5: Go Live (5 minutes)

**Switch to Stripe Live Mode:**

1. Toggle Stripe to **Live mode**
2. Repeat Steps 2-3 (create live price + coupon)
3. Update `.env` with live keys:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_... # from live webhook
   ```
4. Test with a real card
5. Refund yourself in Stripe Dashboard

---

## 📊 How It Works Now

### Purchase Flow:

```
Student → /portal/resources ($190 displayed)
       ↓
/portal/products/architecture-toolkit (DB price: $190)
       ↓
Stripe Checkout ($190 + optional coupon)
       ↓
Apply TOOLKIT100 coupon → Price: $90
       ↓
Complete payment
       ↓
Webhook → ToolkitPurchaseHandler
       ↓
Creates purchase record (amount_paid: $90)
       ↓
access_granted: true
       ↓
Student sees all resources unlocked!
```

### Data Storage:

**Supabase `products` table:**
```sql
{
  slug: 'architecture-toolkit',
  price: 190,
  stripe_lookup_key: 'architecture_toolkit_full_v1'
}
```

**Supabase `product_contents` table:**
- 30+ resources organized by category
- Each with Claude CLI commands
- PDF guides in Storage bucket `toolkit-files`

**Supabase `purchases` table:**
```sql
{
  user_id: <student-id>,
  product_id: <toolkit-id>,
  amount_paid: 90.00,  -- Actual price paid (with coupon)
  status: 'completed',
  access_granted: true
}
```

---

## 🎯 What Your Customer Gets

When they purchase for $90 (with coupon):

1. **Instant Access** to all 30+ resources
2. **Professional Templates:**
   - Authentication patterns
   - Database schemas
   - Deployment configs
   - Security implementations
   - Performance optimizations
   - And more...

3. **Claude CLI Commands:**
   - Copy-paste ready
   - Works instantly in their projects
   - Saves 6-20 hours per pattern

4. **Implementation Guides:**
   - Step-by-step instructions
   - Best practices
   - Common pitfalls to avoid

5. **Lifetime Access:**
   - All future updates
   - New patterns added regularly
   - No recurring fees

---

## 💰 Pricing Breakdown

| Scenario | Price | Customer Pays | You Get |
|----------|-------|---------------|---------|
| **Full Price** | $190 | $190 | $190 (minus Stripe fees) |
| **With Coupon** | $190 - $100 | $90 | $90 (minus Stripe fees) |

**Stripe Fees:**
- 2.9% + $0.30 per transaction
- $190: You keep ~$184.29
- $90: You keep ~$86.89

---

## 🔍 Monitoring & Analytics

### Track Sales:

```sql
-- Total sales and revenue
SELECT
  COUNT(*) as total_sales,
  SUM(amount_paid) as total_revenue,
  AVG(amount_paid) as avg_sale_price
FROM purchases
WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit')
AND status = 'completed';
```

### Coupon Usage:

```sql
-- How many used the coupon?
SELECT
  COUNT(*) FILTER (WHERE amount_paid < 190) as coupon_count,
  COUNT(*) FILTER (WHERE amount_paid = 190) as full_price_count,
  COUNT(*) FILTER (WHERE amount_paid < 190)::float / COUNT(*) * 100 as coupon_percentage
FROM purchases
WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit')
AND status = 'completed';
```

---

## 🛡️ Security Features

✅ **Row Level Security (RLS):**
- Students can only see their own purchases
- Content only visible after purchase

✅ **Webhook Verification:**
- Stripe signature checked
- Prevents fraudulent access grants

✅ **Idempotency:**
- Duplicate webhook events handled gracefully
- No double-charging

✅ **Authentication Required:**
- Must be logged in to purchase
- User ID tracked in all purchases

---

## 📞 Troubleshooting

### "Failed to create checkout session"

**Check:**
1. `.env` has `STRIPE_SECRET_KEY`
2. Product has lookup key `architecture_toolkit_full_v1`
3. Stripe is in correct mode (test/live)

### Coupon not appearing in checkout

**Check:**
1. API has `allow_promotion_codes: true` (✅ Already added)
2. Coupon exists in Stripe
3. Coupon applies to correct product

### Resources not unlocking after purchase

**Check:**
```sql
SELECT * FROM purchases
WHERE user_id = '<user-id>'
AND product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit');
```

Should show `access_granted: true`

If missing, check Stripe webhook logs

---

## 📚 Reference Files

- **Setup Guide:** `TOOLKIT-PRICE-UPDATE.md` (detailed instructions)
- **Database Script:** `scripts/update-toolkit-price.sql`
- **Original Docs:** `docs/STRIPE_TOOLKIT_SETUP.md`
- **Webhook Handler:** `src/webhooks/stripe/handlers/ToolkitPurchaseHandler.ts`
- **Product Page:** `src/app/portal/products/architecture-toolkit/page.tsx`
- **Checkout API:** `src/app/api/create-checkout/route.ts` ✅ Updated

---

## ✅ Summary

**What's Ready:**
- ✅ Display price updated to $190
- ✅ Coupon entry enabled in checkout
- ✅ Webhook properly records actual amount paid
- ✅ Access control working
- ✅ Resources stored in Supabase
- ✅ Documentation complete

**What You Need:**
1. Update Supabase price (1 SQL query)
2. Update Stripe price ($190)
3. Create Stripe coupon (TOOLKIT100, $100 off)
4. Test the flow
5. Go live!

**Total Time:** ~25 minutes to go live

Your customer who paid $90 (with the $100 coupon) will get instant access to all 30+ toolkit resources as soon as you complete these steps!
