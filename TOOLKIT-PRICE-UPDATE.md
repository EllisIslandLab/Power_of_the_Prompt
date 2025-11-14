# Architecture Mastery Toolkit - Price Update to $190

This guide will help you update the toolkit price from $497 to $190 and enable the $100 coupon system.

---

## ✅ What I Just Fixed

1. **Resources Page Display** - Updated both locations to show $190
   - `/portal/resources` - Featured card
   - `/portal/resources` - Resource list

---

## 🔧 Step 1: Update Supabase Product Price

Run this SQL in your Supabase SQL Editor:

```sql
-- Update the Architecture Toolkit product price
UPDATE products
SET price = 190
WHERE slug = 'architecture-toolkit';

-- Verify the update
SELECT id, name, slug, price
FROM products
WHERE slug = 'architecture-toolkit';
```

**Expected Result:** Should show `price: 190`

---

## 💳 Step 2: Update Stripe Product Price

### Option A: Create New Price with Same Lookup Key (Recommended)

This is the cleanest approach - it preserves the old price for records but uses the new one going forward.

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Find "Architecture Mastery Toolkit" (product ID: `prod_TLpZ1AjXFUXzBT`)
3. Click on the product
4. Under "Pricing", click **"Add another price"**
5. Fill in:
   ```
   Price: $190.00 USD
   Billing: One time
   ```
6. After creating, click on the new $190 price
7. Scroll to **"Lookup key"**
8. Add lookup key: `architecture_toolkit_full_v1`
9. **Archive the old $497 price:**
   - Go back to product
   - Click the 3 dots next to $497 price
   - Select "Archive"

**Why this works:** The code uses the lookup key, not the price ID. When you add the lookup key to the $190 price, it automatically uses that one!

### Option B: Edit Existing Price (Not Recommended)

You can't edit a Stripe price after creation. You'd need to create a new product entirely.

---

## 🎟️ Step 3: Create $100 Off Coupon in Stripe

### Create the Coupon:

1. Go to [Stripe Dashboard → Products → Coupons](https://dashboard.stripe.com/coupons)
2. Click **"Create coupon"**
3. Fill in:
   ```
   Name: TOOLKIT100
   ID: TOOLKIT100 (or let Stripe generate)
   Discount type: Amount off
   Amount: $100.00
   Currency: USD
   Duration: Once
   ```
4. Optional settings:
   - Max redemptions: (leave blank for unlimited)
   - Expiration date: (set if needed)
   - Applies to: Select "Architecture Mastery Toolkit" product
5. Click **"Create coupon"**

### Testing the Coupon:

Use Stripe's test mode:
1. Toggle to Test mode
2. Create a test coupon with same settings
3. Test checkout flow (instructions below)

---

## 🛒 Step 4: Enable Coupon Entry in Checkout

The checkout is created via `/api/create-checkout`. Update it to allow coupons:

### Update Create Checkout API:

Find `/src/app/api/create-checkout/route.ts` and ensure it includes:

```typescript
const session = await stripe.checkout.sessions.create({
  // ... other settings ...
  allow_promotion_codes: true, // ← Add this line!
  // ... rest of checkout config ...
})
```

This adds a "Have a promo code?" link in the Stripe checkout.

---

## 🧪 Step 5: Test the Complete Flow

### Test in Stripe Test Mode:

1. **Sign in as a student** (not admin)
   - Use a test account or create one

2. **Navigate to Resources:**
   ```
   http://localhost:3000/portal/resources
   ```
   - Should see "View Details - $190"

3. **Click "View Details":**
   - Should redirect to `/portal/products/architecture-toolkit`
   - Should show sales page
   - Price should show $190 (from Supabase)

4. **Click "Unlock Toolkit - $190":**
   - Should redirect to Stripe Checkout
   - Should show **$190.00** price

5. **Apply Coupon:**
   - Click "Add promotion code" in Stripe checkout
   - Enter: `TOOLKIT100`
   - Should see price drop to **$90.00** ($190 - $100)

6. **Complete Test Purchase:**
   ```
   Card: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
   ZIP: Any ZIP
   ```

7. **Verify Access:**
   - Should redirect back to product page
   - Should see green "You have full access" banner
   - Should see all toolkit resources unlocked

### Verify in Supabase:

Check the `purchases` table:

```sql
SELECT
  p.id,
  p.user_id,
  p.amount_paid,
  p.status,
  p.access_granted,
  pr.name as product_name
FROM purchases p
JOIN products pr ON p.product_id = pr.id
WHERE pr.slug = 'architecture-toolkit'
ORDER BY p.created_at DESC
LIMIT 5;
```

**Expected for coupon purchase:**
- `amount_paid: 90.00` (if they used $100 coupon)
- `status: completed`
- `access_granted: true`

---

## 📊 How the System Works

### Architecture Overview:

```
[Student] → [Resources Page] → [Product Page] → [Stripe Checkout]
              Shows $190           Shows DB price     Shows Stripe price
                                                      + Coupon option
                                   ↓
[Stripe Webhook] → [ToolkitPurchaseHandler] → [Supabase Purchase Record]
  Confirms payment   Records in DB                 Grants access
```

### What Happens When User Purchases:

1. **User clicks "Unlock Toolkit"**
   - Calls `/api/create-checkout`
   - API checks Supabase for product (`slug: 'architecture-toolkit'`)
   - Creates Stripe checkout session with lookup key
   - Returns Stripe checkout URL

2. **User completes payment in Stripe**
   - Can apply coupon code if they have one
   - Stripe processes payment

3. **Stripe sends webhook to your server**
   - Event: `checkout.session.completed`
   - Handler: `ToolkitPurchaseHandler`
   - Verifies product via `metadata.product_slug`

4. **Handler grants access:**
   - Creates record in `purchases` table:
     ```sql
     {
       user_id: <user's ID>,
       product_id: <toolkit product ID>,
       amount_paid: <actual amount paid (with coupon)>,
       status: 'completed',
       access_granted: true
     }
     ```

5. **User sees unlocked content:**
   - Product page checks `purchases` table
   - If `access_granted = true`, shows all resources
   - Resources loaded from `product_contents` table
   - Files downloadable from `toolkit-files` storage bucket

---

## 🗄️ Data Storage Structure

### Supabase Tables:

**`products`**
```sql
{
  id: uuid,
  slug: 'architecture-toolkit',
  name: 'Architecture Mastery Toolkit',
  price: 190,  -- Updated to $190
  stripe_lookup_key: 'architecture_toolkit_full_v1'
}
```

**`product_contents`**
```sql
{
  id: uuid,
  product_id: <toolkit product ID>,
  category: 'Authentication',  -- or other categories
  name: 'JWT Authentication Pattern',
  description: '...',
  claude_command: 'claude add jwt-auth-pattern',
  file_urls: ['authentication/jwt-pattern.pdf'],
  time_saved_min: 6,
  time_saved_max: 12,
  difficulty: 'Intermediate',
  sort_order: 1
}
```

**`purchases`**
```sql
{
  id: uuid,
  user_id: <student's user ID>,
  product_id: <toolkit product ID>,
  stripe_payment_intent: 'pi_...',
  amount_paid: 90.00,  -- If they used $100 coupon
  status: 'completed',
  access_granted: true,
  created_at: timestamp
}
```

### Supabase Storage:

**Bucket: `toolkit-files`**
```
/authentication/
  jwt-pattern.pdf
  oauth-flow.pdf
/database/
  schema-design.pdf
  rls-patterns.pdf
/deployment/
  vercel-setup.pdf
  ci-cd-pipeline.pdf
... (all your toolkit files)
```

---

## 🔒 Security & Access Control

### Row Level Security (RLS):

The `purchases` table has RLS policies that ensure:
- Users can only see their own purchases
- Purchases can only be created by webhooks (server-side)
- Admin can see all purchases

### Webhook Verification:

The webhook handler (`ToolkitPurchaseHandler`) verifies:
1. Stripe signature (ensures it's from Stripe)
2. User ID in metadata (ensures user is authenticated)
3. Product slug matches (ensures it's the toolkit)
4. Idempotency (prevents duplicate purchases)

---

## 🚀 Going to Production

### Checklist:

1. **Switch Stripe to Live Mode:**
   - [ ] Create live version of product
   - [ ] Add price: $190
   - [ ] Add lookup key: `architecture_toolkit_full_v1`
   - [ ] Create coupon: `TOOLKIT100` ($100 off)
   - [ ] Update webhook to production URL

2. **Update Environment Variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_...  # Not sk_test_
   STRIPE_WEBHOOK_SECRET=whsec_... # From live webhook
   NEXT_PUBLIC_URL=https://www.weblaunchacademy.com
   ```

3. **Update Supabase Product:**
   ```sql
   UPDATE products
   SET
     price = 190,
     stripe_product_id = 'prod_LIVE...'  -- Live product ID
   WHERE slug = 'architecture-toolkit';
   ```

4. **Test with Real Card:**
   - Make a real purchase
   - Apply coupon
   - Verify you get access
   - **THEN REFUND YOURSELF** in Stripe Dashboard

---

## 📞 Troubleshooting

### Issue: Price still shows $497

**Check:**
```sql
SELECT price FROM products WHERE slug = 'architecture-toolkit';
```
Should show `190`, not `497`

**Fix:** Run the UPDATE query from Step 1

---

### Issue: Coupon not working in checkout

**Check:**
1. Stripe Dashboard → Coupons → Verify `TOOLKIT100` exists
2. Check coupon applies to correct product
3. Verify checkout API has `allow_promotion_codes: true`

**Fix:** Add to `/api/create-checkout/route.ts`:
```typescript
allow_promotion_codes: true,
```

---

### Issue: Student can't see resources after purchase

**Check:**
```sql
SELECT * FROM purchases
WHERE user_id = '<user-id>'
AND product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit');
```

Should show `access_granted: true`

**Fix:** If missing, check webhook logs in Stripe Dashboard

---

### Issue: Wrong amount recorded in purchases table

**This is expected!** The `amount_paid` field records what the customer **actually paid**, including discounts:
- Without coupon: `$190.00`
- With $100 coupon: `$90.00`

This is correct behavior - you want to track what they paid, not the list price.

---

## 📧 Customer Communication

When a customer purchases with the coupon, they should see:

**Stripe Receipt Email:**
- Charge amount: $90.00 (or $190 without coupon)
- Discount applied: $100.00 (if coupon used)
- Description: Architecture Mastery Toolkit

**In Portal:**
- "You have full access to all X resources"
- No mention of what they paid (keep it simple)

---

## 📊 Analytics & Tracking

### Track Sales by Price Point:

```sql
-- How many people used the coupon?
SELECT
  COUNT(*) as total_sales,
  COUNT(*) FILTER (WHERE amount_paid < 190) as coupon_sales,
  COUNT(*) FILTER (WHERE amount_paid = 190) as full_price_sales,
  SUM(amount_paid) as total_revenue
FROM purchases
WHERE product_id = (SELECT id FROM products WHERE slug = 'architecture-toolkit')
AND status = 'completed';
```

### Most Popular Resources:

```sql
-- Track which resources are most viewed/downloaded
-- (You'd need to add tracking code for this)
```

---

## ✅ Summary

**What's Updated:**
- ✅ Resources page now shows $190
- ✅ SQL query ready to update Supabase price
- ✅ Instructions for Stripe price update
- ✅ Instructions for $100 coupon creation
- ✅ Complete testing guide

**What You Need To Do:**
1. Run the SQL query in Supabase (Step 1)
2. Update Stripe price (Step 2)
3. Create $100 coupon (Step 3)
4. Test the flow (Step 5)
5. Go live when ready (Step 6)

**Customer Gets:**
- Full access to all toolkit resources
- Downloadable PDFs and guides
- Claude CLI commands
- Implementation roadmap
- Lifetime access to updates

The toolkit content is already in your Supabase database - you just need to update the pricing!
