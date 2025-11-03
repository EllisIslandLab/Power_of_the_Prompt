# Syncing Stripe Products to Database

## Overview

This guide helps you sync your Stripe products to the `public.products` table automatically. This ensures:
- ✅ All purchases are tracked in one place
- ✅ Webhooks can find products by Stripe ID
- ✅ Consistent pricing and product info
- ✅ Easy reporting and analytics

---

## Step 1: Prepare Database

First, add the required columns to your products table:

```bash
# In Supabase SQL Editor, run:
```

```sql
-- Add columns for Stripe sync
ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_product_id TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_products_stripe_id ON products(stripe_product_id);
```

Or simply run the script:
```sql
-- Copy/paste entire file: /scripts/add-product-columns.sql
```

---

## Step 2: Configure Stripe Products

Before syncing, make sure your Stripe products have the right metadata for tier assignment.

### Go to Stripe Dashboard → Products → Edit Each Product

#### A+ Guarantee Program (`prod_T7hC1OpapHdkKe`)
**Metadata:**
```
tier: premium_vip
total_lvl_ups: 12
```

**Lookup Key (on the Price):**
```
a_plus_guarantee_v1
```

---

#### Web Launch Academy Course (`prod_T7ZhOkdaZuD7O9`)
**Metadata:**
```
course_type: basic_course
includes_lvl_ups: false
```

**Lookup Key:**
```
web_launch_course_v1
```

---

#### Flex Package (`prod_TIuoc7syNmKmv1`)
**Metadata:**
```
course_type: basic_course
includes_lvl_ups: true
total_lvl_ups: 3
```

**Lookup Key:**
```
flex_package_v1
```

---

#### LVL UP Packages
These are add-on features. Set basic metadata:

**LVL UP Feature + Repo Setup (30-Day) (`prod_TJrlYGjxpUdr6y`)**
```
includes_lvl_ups: true
total_lvl_ups: 1
setup_included: true
```
Lookup Key: `lvl_up_30_day_v1`

**LVL UP Feature (Active Repo) (`prod_TJvBlPbha9ldwL`)**
```
includes_lvl_ups: true
total_lvl_ups: 1
```
Lookup Key: `lvl_up_active_repo_v1`

**LVL UP Triple Package (`prod_TJwrJVYTKEeaWK`)**
```
includes_lvl_ups: true
total_lvl_ups: 3
```
Lookup Key: `lvl_up_triple_v1`

---

## Step 3: Run Sync Script

```bash
# From your project root
npx tsx scripts/sync-stripe-products.ts
```

**Expected output:**
```
🔄 Starting Stripe product sync...

📦 Fetching prod_T7hC1OpapHdkKe from Stripe...
   Name: A+ Guarantee Program
   Price: $1997
   Lookup Key: a_plus_guarantee_v1
   Metadata: {"tier":"premium_vip","total_lvl_ups":"12"}
✅ Synced: A+ Guarantee Program

...

✅ Sync complete!

📋 Next Steps:
1. Check Stripe Dashboard and add lookup keys to products (if any were missing)
2. Add metadata to Stripe products for tier assignment
3. Verify products in Supabase: SELECT * FROM products;
```

---

## Step 4: Verify in Supabase

Run this query:
```sql
SELECT
  name,
  slug,
  price,
  stripe_product_id,
  stripe_lookup_key,
  metadata,
  status
FROM products
ORDER BY created_at DESC;
```

You should see all 6+ products:
- A+ Guarantee Program
- Web Launch Academy Website Development Course
- Flex Package
- LVL UP Feature + Repo Setup (30-Day Window)
- LVL UP Feature (Repo Setup Active)
- LVL UP Triple Package - 3 Features Bundle
- Architecture Mastery Toolkit (if previously created)

---

## Step 5: Test Purchase Flow

### Test with a Course Purchase:

1. **Purchase Web Launch Course** as a test user (use Stripe test card)
2. **Check webhook logs** in Vercel
3. **Verify in Supabase:**
   ```sql
   -- Should show your test user
   SELECT u.email, u.tier, u.payment_status
   FROM users u
   WHERE u.email = 'your-test-email@example.com';

   -- Should show the purchase
   SELECT p.amount_paid, pr.name
   FROM purchases p
   JOIN products pr ON p.product_id = pr.id
   JOIN users u ON p.user_id = u.id
   WHERE u.email = 'your-test-email@example.com';
   ```

4. **Try signing in** at `/signin`

---

## Webhook Handler Updates

The webhook handler (`CheckoutCompletedHandler`) now needs to handle these new products. It already checks for:
- `metadata.tier` → A+ Program
- `metadata.course_type === 'basic_course'` → Courses
- Defaults to 'basic' tier if no metadata

**This means:**
- ✅ A+ Program → `tier: vip`, 12 sessions
- ✅ Web Launch Course → `tier: basic`, 0 sessions
- ✅ Flex Package → `tier: basic`, 3 sessions
- ✅ LVL UP packages → Credit sessions only (no tier change)

---

## Maintenance

### Re-sync Products (After Changing Prices/Names in Stripe):

```bash
npx tsx scripts/sync-stripe-products.ts
```

The script uses `UPSERT` so it will update existing products without creating duplicates.

### Add a New Product:

1. Create product in Stripe
2. Add to `PRODUCTS_TO_SYNC` array in `scripts/sync-stripe-products.ts`
3. Run sync script

---

## Troubleshooting

### "Column stripe_product_id does not exist"

Run:
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_product_id TEXT UNIQUE;
```

### "Lookup key not found in Stripe"

The script will warn you:
```
⚠️  No lookup key found, will use: web-launch-course_v1
   You should add this to Stripe: Dashboard → Products → [Product] → Price → Add lookup key
```

Go to Stripe and add the lookup key manually.

### Product synced but purchases still fail

Check:
1. **Stripe webhook is configured** (`/api/webhooks/stripe`)
2. **Product has lookup key** in Stripe
3. **Metadata is correct** in Stripe product
4. **Check Vercel logs** for webhook errors

---

## Benefits of This Approach

**Before:** Products scattered across Stripe, hard to track purchases, manual SQL inserts

**After:**
- ✅ Single source of truth in database
- ✅ Easy to track all purchases
- ✅ Automatic sync from Stripe
- ✅ Consistent webhook handling
- ✅ Better reporting and analytics
- ✅ RLS policies work uniformly

**Now when someone purchases:**
1. Stripe sends webhook
2. Handler looks up product by Stripe Product ID
3. Finds product in database with metadata
4. Creates user with correct tier
5. Records purchase
6. User can sign in immediately

---

## Re-run Sync Anytime

Safe to run multiple times:
```bash
npx tsx scripts/sync-stripe-products.ts
```

Uses UPSERT so it won't create duplicates, just updates existing records.
