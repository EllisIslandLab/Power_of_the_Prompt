# Fixing Your Test Purchase & Signup Flow

## 🚨 What Happened

You made a test purchase but the user wasn't created in `public.users`, preventing signin. This was likely caused by:

1. **Database trigger not installed** - The trigger that auto-creates public.users when auth users are created may not be set up
2. **Trigger failed silently** - The trigger exists but failed without alerting you
3. **Webhook didn't process correctly** - Stripe product metadata may have been missing/incorrect

## ✅ What I Fixed

### 1. Made Webhook Handler Bulletproof
- **Fallback creation**: If trigger fails, webhook manually creates public.users record
- **Verification**: After creating auth user, verifies public.users exists
- **Better logging**: Logs every step so we can see exactly what happened
- **Handles missing metadata**: Works even if Stripe product has no metadata

### 2. Added Error Alerts
- You'll now get emailed at `hello@weblaunchacademy.com` if:
  - Purchase processing fails
  - User creation fails
  - Trigger doesn't fire

### 3. Created Diagnostic Tools
- New SQL script: `/scripts/diagnose-purchase-flow.sql`
- Shows what went wrong with your test purchase
- Can fix orphaned users

---

## 🔧 Fix Your Test Purchase (Do This Now)

### Step 1: Run Diagnostic Script

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy and paste** the entire contents of `/scripts/diagnose-purchase-flow.sql`
3. **Run** the script

**Look for query #4 results** - "Find auth users WITHOUT public.users records"

This will show you:
```
id                                  | email                    | auth_created_at          | status
------------------------------------|--------------------------|--------------------------|---------------------------
abc-123-def-456                    | test@example.com         | 2025-11-02 20:30:00      | MISSING FROM public.users
```

### Step 2: Fix Your Test User

**If you found an orphaned auth user** (from Step 1), run this in Supabase SQL Editor:

```sql
-- Replace 'your-test-email@example.com' with your actual test email
INSERT INTO public.users (
  id,
  email,
  full_name,
  email_verified,
  role,
  tier,
  payment_status
)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', '') as full_name,
  true as email_verified,  -- They verified by paying
  'student' as role,
  'basic' as tier,
  'paid' as payment_status  -- They purchased, so mark as paid
FROM auth.users
WHERE email = 'your-test-email@example.com';
```

**What this does:**
- Creates the missing `public.users` record
- Links it to the existing auth user (same ID)
- Sets them as a paid student with basic tier

### Step 3: Verify the Fix

Run this query:
```sql
SELECT
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.tier,
  u.payment_status,
  u.email_verified
FROM public.users u
WHERE u.email = 'your-test-email@example.com';
```

You should see:
- ✅ email: your test email
- ✅ role: 'student'
- ✅ tier: 'basic'
- ✅ payment_status: 'paid'
- ✅ email_verified: true

### Step 4: Try Signing In

1. Go to `/signin`
2. Enter your test email
3. Enter the password you used when "purchasing"
4. **You should now be able to sign in!**

---

## 🔍 Prevent Future Issues

### Verify Trigger is Installed

Run this in Supabase SQL Editor:

```sql
-- Check if triggers exist
SELECT
  t.tgname as trigger_name,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname IN ('on_auth_user_created', 'on_auth_user_email_verified')
ORDER BY t.tgname;
```

**Expected result:**
```
trigger_name             | function_name           | enabled
-------------------------|------------------------|--------
on_auth_user_created    | handle_new_user        | O
on_auth_user_email_verified | handle_user_email_verified | O
```

(The 'O' means 'Origin' = enabled)

### If Trigger is Missing

Run this to install it:

```sql
-- Re-create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    email_verified,
    role,
    tier,
    payment_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    'student',
    'basic',
    'pending',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 🧪 Test the End-to-End Flow Again

Now that everything is fixed, test the complete flow:

### Test Purchase Flow

1. **Clear test data** (optional):
   ```sql
   -- Delete your test user (ONLY if you want to start fresh)
   DELETE FROM public.users WHERE email = 'your-test-email@example.com';
   DELETE FROM auth.users WHERE email = 'your-test-email@example.com';
   ```

2. **Make a test purchase**:
   - Go to your site
   - Purchase a course/product
   - Use Stripe test card: `4242 4242 4242 4242`

3. **Check webhook processed**:
   - Vercel Dashboard → Logs
   - Filter for "checkout"
   - Should see: "Created new auth user successfully"

4. **Check database**:
   ```sql
   -- Should see your new user in BOTH tables
   SELECT * FROM auth.users WHERE email = 'your-test-email@example.com';
   SELECT * FROM public.users WHERE email = 'your-test-email@example.com';
   ```

5. **Try signing in**:
   - Go to `/signin`
   - Use email and password
   - Should redirect to `/portal`

---

## 📊 Understanding the Flow

### What SHOULD Happen

```
1. User purchases on Stripe
   ↓
2. Stripe sends webhook to /api/webhooks/stripe
   ↓
3. CheckoutCompletedHandler processes webhook
   ↓
4. Creates auth user with supabase.auth.admin.createUser()
   ↓
5. Database trigger fires automatically
   ↓
6. public.users record created by trigger
   ↓
7. Webhook updates tier/payment_status to 'paid'
   ↓
8. User receives welcome email
   ↓
9. User can sign in at /signin
```

### What WAS Happening (Before Fix)

```
1-4: Same as above ✅
5: Trigger DIDN'T fire ❌
6: No public.users record created ❌
7-9: All failed because user doesn't exist ❌
```

### What Happens NOW (After Fix)

```
1-4: Same ✅
5: Trigger fires (hopefully) ✅
6: If trigger succeeds → great! ✅
   If trigger fails → webhook creates record manually ✅
7-9: Continue normally ✅
```

---

## 🚨 When to Get Concerned

You should check logs if:

1. **No welcome email after purchase** - Webhook may have failed
2. **Email alert at hello@weblaunchacademy.com** - Critical error occurred
3. **User can't sign in after purchase** - Run diagnostic script

---

## 📝 Stripe Product Setup (Important!)

For best results, configure your Stripe products with metadata:

### For Basic Course:
```
metadata:
  course_type: basic_course
  includes_lvl_ups: false
```

### For Premium Tier:
```
metadata:
  tier: premium
  total_lvl_ups: 3
```

### For VIP Tier:
```
metadata:
  tier: premium_vip
  total_lvl_ups: 12
```

**Where to set this:**
- Stripe Dashboard → Products → [Your Product] → Edit
- Scroll to "Metadata" section
- Add key-value pairs

**If metadata is missing:**
- Webhook will still work (now!)
- Will default to 'basic' tier
- Will log warning for you to fix

---

## ✅ Next Steps

1. **Run diagnostic script** to see what happened with your test purchase
2. **Fix your test user** with the SQL query above
3. **Verify trigger is installed** and enabled
4. **Test purchase flow again** end-to-end
5. **Set up Stripe product metadata** for proper tier assignment

---

## 💡 Pro Tips

**Always test purchases in this order:**
1. Test with basic course (no metadata) ← tests fallback
2. Test with premium tier (with metadata) ← tests metadata parsing
3. Test with existing user purchasing upgrade ← tests tier upgrade logic

**Monitor these logs:**
- Vercel → Logs → Filter: "checkout"
- Supabase → Logs → Filter: "handle_new_user"
- Email inbox: hello@weblaunchacademy.com

**Quick health check query:**
```sql
-- Show recent sign-ups and their payment status
SELECT
  u.email,
  u.tier,
  u.payment_status,
  u.created_at,
  COUNT(p.id) as purchases_made
FROM public.users u
LEFT JOIN purchases p ON p.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.id, u.email, u.tier, u.payment_status, u.created_at
ORDER BY u.created_at DESC;
```

This shows if users are actually being converted to paid status after purchase.
