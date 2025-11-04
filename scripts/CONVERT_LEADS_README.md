# Convert Leads to Users - Complete Guide

This guide explains how to convert all leads in `public.leads` to full authenticated users who can sign in at `/signin`.

## The Problem

Leads in the `public.leads` table cannot sign in because they don't exist in Supabase Auth (`auth.users`). They also had an incorrect `payment_status` and a broken trigger was causing errors.

## The Solution

We need to:
1. ✅ Fix the broken `convert_lead_to_user()` trigger
2. ✅ Create `auth.users` entries (so they can sign in)
3. ✅ Create `public.users` entries with `payment_status='paid'`
4. ✅ Send password reset emails so users can set their password

## Step-by-Step Instructions

### Step 1: Fix the Broken Trigger

First, run the SQL script to fix the trigger that was causing the `user_id` column error:

```bash
# Via Supabase CLI
npx supabase db execute --file scripts/fix-convert-lead-trigger.sql

# OR paste into Supabase SQL Editor:
# https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
```

This fixes the trigger to work without the non-existent `user_id` column.

### Step 2: Check Current Status (Optional)

Before converting, you can check the current status:

```bash
# Via Supabase CLI
npx supabase db execute --file scripts/convert-all-leads-to-users.sql

# OR paste into Supabase SQL Editor
```

This shows:
- How many leads need conversion
- Which leads are already converted
- Any inconsistencies

### Step 3: Convert Leads to Auth Users

Run the TypeScript conversion script:

```bash
npx tsx scripts/convert-leads-to-auth-users.ts
```

**What this does:**

1. 🔍 Fetches all unconverted leads from `public.leads`
2. 🔐 Creates `auth.users` entries with random passwords
3. ✅ Sets `email_confirm: true` (auto-verified)
4. 👤 Creates `public.users` entries (via `handle_new_user` trigger)
5. 💰 Updates `payment_status='paid'` (like 100% discount)
6. 📧 Sends password reset emails to all new users
7. ✨ Marks leads as `status='converted'`

### Step 4: Verify Conversion

After running the script, check the results:

```bash
npx supabase db execute --file scripts/convert-all-leads-to-users.sql
```

You should see:
- All leads marked as `status='converted'`
- Matching users in `public.users` with `payment_status='paid'`
- No inconsistencies

## How Users Sign In

After conversion, users will:

1. **Receive a password reset email** with a link
2. **Click the link** to set their password
3. **Go to `/signin`** and sign in with their email + new password
4. **Access the portal** as a paid user

## User Details After Conversion

All converted lead users will have:

| Field | Value |
|-------|-------|
| `email` | From lead |
| `full_name` | From lead's `name` field (or "Lead User") |
| `role` | `'student'` |
| `tier` | `'basic'` |
| `payment_status` | `'paid'` ✅ (was pending) |
| `email_verified` | `true` ✅ |

## Troubleshooting

### Error: "Missing environment variables"

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Error: "User already exists"

This is normal - the script skips users that already exist and just marks the lead as converted.

### Leads not being marked as converted

The `convert_lead_to_user()` trigger should automatically mark leads as converted when the user is created. If it doesn't work, you can manually mark them:

```sql
UPDATE leads
SET status = 'converted', converted_at = NOW()
WHERE email IN (SELECT email FROM users);
```

### Users not receiving password reset emails

Check:
1. Supabase email settings are configured
2. The `NEXT_PUBLIC_SITE_URL` is correct in your env vars
3. Check spam folders

You can manually resend for a specific user:

```sql
SELECT auth.send_password_reset_email('user@example.com');
```

## Files in this Solution

| File | Purpose |
|------|---------|
| `fix-convert-lead-trigger.sql` | Fixes the broken trigger |
| `convert-all-leads-to-users.sql` | Status checker (read-only) |
| `convert-leads-to-auth-users.ts` | Main conversion script |
| `CONVERT_LEADS_README.md` | This guide |

## Safety Features

✅ **Idempotent** - Safe to run multiple times
✅ **No duplicates** - Skips existing users
✅ **Error handling** - Continues on errors, reports at end
✅ **Dry-run mode** - Status checker shows preview
✅ **No data loss** - Only creates/updates, never deletes

---

**Questions?** Check the script output or review the Supabase logs.
