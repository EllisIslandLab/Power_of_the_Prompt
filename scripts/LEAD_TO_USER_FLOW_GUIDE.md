# Lead to User Conversion Flow - Complete Guide

## Overview

This guide explains the complete flow from lead signup to paid user account creation.

## The Complete Flow

### Step 1: User Signs Up for Updates

**What Happens:**
1. User fills out signup form with name and email
   - Example: Name: "Matthew Ellis", Email: "mattjellis1@gmail.com"
2. System splits name into `first_name` and `last_name`
   - `first_name`: "Matthew"
   - `last_name`: "Ellis"
   - `name`: "Matthew Ellis" (full name preserved)
3. Lead created in `public.leads` table with status: `'waitlist'`
4. Welcome email sent from `hello@weblaunchacademy.com` (not noreply)

**Email includes:**
- ✅ Personalized greeting with first name
- ✅ Free 1-on-1 introduction session offer
- ✅ Instructions to reply or email hello@weblaunchacademy.com
- ✅ Production URLs (no localhost)
- ✅ Proper sender (hello@ instead of noreply@)

**Database State:**
```sql
public.leads:
  - email: mattjellis1@gmail.com
  - name: Matthew Ellis
  - first_name: Matthew
  - last_name: Ellis
  - status: waitlist
```

### Step 2: User Makes a Purchase

**What Happens:**
1. User completes Stripe checkout (even with 100% discount code)
2. Stripe sends `checkout.session.completed` webhook
3. `CheckoutCompletedHandler` processes the purchase:

   **a) Creates Auth User**
   ```typescript
   auth.users:
     - email: mattjellis1@gmail.com
     - email_confirmed: true (auto-confirmed)
     - user_metadata.full_name: Matthew Ellis
   ```

   **b) Creates Public User (via trigger or manual)**
   ```sql
   public.users:
     - email: mattjellis1@gmail.com
     - full_name: Matthew Ellis
     - role: student
     - tier: basic (or vip/premium based on product)
     - payment_status: paid ✅
     - email_verified: true
   ```

   **c) Marks Lead as Converted**
   ```sql
   public.leads:
     - status: converted ✅
     - converted_at: NOW()
   ```

4. Payment confirmation email sent

### Step 3: User Can Sign In

**What Happens:**
1. User goes to `/signin`
2. Since they purchased, their account exists in `auth.users`
3. They can:
   - Sign in with their email + password (if set during purchase)
   - Request password reset if needed
   - Access `/portal` as a paid user

## Database Schema

### public.leads
```sql
id              UUID
email           VARCHAR(255) UNIQUE
name            VARCHAR(255)        -- Full name
first_name      TEXT               -- Auto-split from name
last_name       TEXT               -- Auto-split from name
status          VARCHAR(20)        -- 'waitlist', 'converted', etc.
source          VARCHAR(50)
created_at      TIMESTAMP
```

### public.users
```sql
id              UUID
email           VARCHAR(255) UNIQUE
full_name       VARCHAR(255)
role            VARCHAR(20)        -- 'student', 'admin'
tier            VARCHAR(20)        -- 'basic', 'premium', 'vip'
payment_status  VARCHAR(20)        -- 'pending', 'paid' ✅
email_verified  BOOLEAN
created_at      TIMESTAMP
```

### auth.users (Supabase Auth)
```sql
id              UUID
email           VARCHAR
email_confirmed BOOLEAN
user_metadata   JSONB
```

## Product Tiers

| Product | Tier | Payment Status | Sessions |
|---------|------|----------------|----------|
| Free Basic Service | basic | paid | 0 |
| Guarantee VIP | vip | paid | 12 |
| (Future products) | premium | paid | varies |

All users who complete checkout get `payment_status='paid'`, even with 100% discount codes.

## Testing the Flow

### Test Case: New Lead to Paid User

**Step 1: Sign up for updates**
```bash
# Go to your signup form
# Enter:
#   Name: Test User
#   Email: test@example.com
```

**Verify:**
```sql
SELECT email, name, first_name, last_name, status
FROM public.leads
WHERE email = 'test@example.com';

-- Expected:
-- email: test@example.com
-- name: Test User
-- first_name: Test
-- last_name: User
-- status: waitlist
```

**Check Email:**
- From: Web Launch Academy <hello@weblaunchacademy.com> ✅
- Subject: 🚀 Welcome, Test! Let's get started...
- Body includes: Free 1-on-1 introduction session offer
- Links to: https://weblaunchacademy.com (not localhost)

**Step 2: Make a purchase**
```bash
# Complete Stripe checkout with test card:
# 4242 4242 4242 4242
# Any future date, any CVC
```

**Verify:**
```sql
-- Check auth user was created
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'test@example.com';

-- Check public user was created with paid status
SELECT id, email, full_name, role, tier, payment_status
FROM public.users
WHERE email = 'test@example.com';

-- Expected:
-- payment_status: paid ✅
-- tier: basic (or vip if Guarantee)

-- Check lead was marked as converted
SELECT email, status, converted_at
FROM public.leads
WHERE email = 'test@example.com';

-- Expected:
-- status: converted ✅
-- converted_at: (timestamp) ✅
```

**Step 3: Sign in**
```bash
# Go to /signin
# Enter email and password
# Should redirect to /portal
```

## Name Splitting Logic

The system automatically splits names:

| Input | first_name | last_name |
|-------|------------|-----------|
| "Matthew" | Matthew | (empty) |
| "Matthew Ellis" | Matthew | Ellis |
| "Matthew James Ellis" | Matthew | James Ellis |
| "Dr. Matthew Ellis Jr." | Dr. | Matthew Ellis Jr. |

The full `name` field is always preserved as-is.

## Email Improvements Implemented

✅ **Changed sender:** `noreply@` → `hello@weblaunchacademy.com`
✅ **Fixed URLs:** `localhost:3000` → `weblaunchacademy.com`
✅ **Added CTA:** Free 1-on-1 introduction session
✅ **Better instructions:** Reply to email or contact hello@
✅ **Personalization:** Uses first_name for greeting

## Troubleshooting

### Lead not marked as converted after purchase

**Check:**
```sql
-- Verify convert_lead_to_user trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'convert_lead_to_user_trigger';
```

**Fix:**
```bash
# Run the trigger fix
npx supabase db execute --file scripts/fix-convert-lead-trigger.sql
```

### User can't sign in after purchase

**Check:**
```sql
-- Verify user exists in auth.users
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'user@example.com';
```

**Possible causes:**
1. Auth user creation failed → Check Supabase logs
2. Email not confirmed → Should be auto-confirmed, check `email_confirmed_at`
3. Wrong password → User can request password reset

### Email shows "noreply@" sender

**Fix:**
```bash
# Update the waitlist signup route
# Already fixed in: src/app/api/waitlist/signup/route.ts
# Line 88: from: 'Web Launch Academy <hello@weblaunchacademy.com>'
```

### Email shows localhost URLs

**Fix:**
```bash
# Update email template
# Already fixed in: src/app/api/waitlist/signup/route.ts
# Line 124: href="https://weblaunchacademy.com"
```

## Files Modified

| File | Purpose |
|------|---------|
| `src/app/api/waitlist/signup/route.ts` | Name splitting, email fixes |
| `scripts/fix-convert-lead-trigger.sql` | Fix broken trigger |
| `scripts/update-email-templates.sql` | Update database email templates |
| `scripts/convert-leads-to-auth-users.ts` | Bulk convert existing leads |
| `supabase/migrations/add_lead_name_fields.sql` | Add first_name/last_name columns |

## Summary

✅ **Lead signup** → Creates lead with split name, sends improved welcome email
✅ **Purchase** → Creates auth user + public user with `payment_status='paid'`
✅ **Lead conversion** → Automatically marks lead as converted via trigger
✅ **Sign in** → Users can access portal as paid students
✅ **Email quality** → Fixed sender, URLs, and added clear instructions

The flow is now complete and ready for testing!
