# Migration Status & Quick Reference

## ✅ Latest Fix Applied (Commit: d7b34ae)

**Issue Resolved:** Migration no longer fails on missing `demo_projects` table.

The migration is now **fully idempotent** and can run safely in any database state:
- ✅ Works if old tables exist
- ✅ Works if old tables don't exist
- ✅ Works if some tables exist and others don't
- ✅ Handles all edge cases gracefully

## 🚀 How to Run the Migration

### Copy This Entire File to Supabase SQL Editor:

**File to use:** `supabase/migrations/20251113000003_phase1_combined_safe.sql`

**Steps:**
1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **"New Query"**
4. Copy the **ENTIRE** contents of the file above
5. Paste into SQL Editor
6. Click **"Run"**
7. Should see "Success. No rows returned"

## ✅ Verification Checklist

After running, verify these tables exist:

```sql
-- Run this query to verify all tables created:
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'boilerplate_versions',
    'business_categories',
    'components',
    'component_versions',
    'component_ratings',
    'template_submissions',
    'demo_sessions',
    'contest_entries',
    'referrals',
    'referral_clicks',
    'referral_payouts',
    'user_purchases'
  )
ORDER BY tablename;
```

**Expected result:** 12 rows

## 🎯 What the Migration Does

1. **Cleanup Phase:**
   - Disables RLS on old tables
   - Drops all old policies
   - Drops all old triggers (safely handles missing tables)
   - Drops all old functions
   - Drops all old tables with CASCADE

2. **Creation Phase:**
   - Creates 12 new Phase 1 tables
   - Adds indexes for performance
   - Enables RLS on all tables
   - Creates security policies
   - Creates helper functions
   - Seeds initial data

3. **Result:**
   - Fresh, clean database schema
   - All Phase 1 tables ready to use
   - Proper security (RLS) enabled
   - Initial data seeded

## 🧪 Test After Migration

### 1. Check Tables Exist
```sql
SELECT COUNT(*) FROM demo_sessions;  -- Should work (returns 0)
SELECT COUNT(*) FROM components;      -- Should work (returns 0)
```

### 2. Test Form
- Visit: `/get-started/build`
- Choose Free or AI Premium
- Fill in Step 1 (name, email)
- Should auto-save (check Supabase logs)

### 3. Verify Session Created
```sql
SELECT * FROM demo_sessions ORDER BY created_at DESC LIMIT 5;
-- Should see your test session
```

## ⚠️ What Gets Deleted

This migration **WILL DELETE** these tables (if they exist):
- `demo_projects` (old system)
- `download_tokens` (old system)
- All Phase 1 tables (if they exist from previous runs)

This migration **PRESERVES** these tables:
- `users`
- `tiers`
- `leads`
- `campaigns`
- `campaign_sends`
- `email_templates`
- `invite_tokens`
- `student_points`
- `badges`
- `student_badges`
- Any other tables not listed in the migration

## 🔄 If You Need to Run Again

The migration is idempotent - you can run it multiple times safely.

Each run will:
1. Drop all Phase 1 tables
2. Recreate them fresh
3. Seed initial data

**Note:** This will delete any data in Phase 1 tables, so only re-run during development.

## 🆘 Troubleshooting

### "Permission denied"
- Make sure you're logged into Supabase with admin access
- Check you're in the correct project

### "Syntax error"
- Make sure you copied the ENTIRE file
- Check no characters were cut off
- File should start with `-- ============================================`
- File should end with `EXECUTE FUNCTION update_session_activity();`

### "Policy already exists"
- This shouldn't happen with the latest version
- If it does, the migration handles it gracefully
- Check you're using commit `d7b34ae` or later

### Still getting errors?
- Copy the error message
- Check line number in the migration file
- See MIGRATION-INSTRUCTIONS.md for more help

## 📊 Current Branch Status

**Branch:** `demo-generator-preview`
**Latest Commit:** `d7b34ae`
**Build Status:** Should pass after migration runs
**Migration File:** `20251113000003_phase1_combined_safe.sql`

## 🎉 Success = All Green

✅ Migration runs without errors
✅ 12 tables created
✅ Can insert into `demo_sessions`
✅ Form works at `/get-started/build`
✅ Vercel build passes

---

**Ready to go!** Just run the migration and test. 🚀
