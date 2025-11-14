# Phase 1 Migration Instructions

## The Problem

You're seeing this error:
```
Error: Failed to run sql query: ERROR: 42703: column "user_email" does not exist
```

This happens because:
1. Old tables exist with different schemas
2. The `IF NOT EXISTS` clauses skip table recreation
3. RLS policies try to reference columns that don't exist in the old schema

## The Solution

I've created three migration files:

1. `20251113000001_cleanup_old_demo_system.sql` - Drops old tables
2. `20251113000002_phase1_component_system.sql` - Creates new tables (original)
3. `20251113000003_phase1_combined_safe.sql` - **Use this one!**

The third file is a combined "nuclear option" that safely drops and recreates everything in one go.

## How to Fix This

### Option 1: Run the Combined Migration (Recommended)

**In Supabase Dashboard:**
1. Go to SQL Editor
2. Create a new query
3. Paste the contents of `supabase/migrations/20251113000003_phase1_combined_safe.sql`
4. Click "Run"

This will:
- Drop all old tables, policies, functions, and triggers
- Create all Phase 1 tables fresh
- Set up all RLS policies correctly
- Seed initial data

### Option 2: Reset Migration History (If migrations are stuck)

**If Supabase keeps trying to run the broken migrations:**

1. Go to SQL Editor
2. Run this to reset migration state:
```sql
DELETE FROM supabase_migrations.schema_migrations
WHERE version IN ('20251113000001', '20251113000002');
```

3. Then run the combined migration (Option 1 above)

### Option 3: Fresh Start (Nuclear option)

If you're still in development with no production data:

1. In Supabase Dashboard → Settings → General
2. Click "Pause project"
3. Click "Delete project"
4. Create new project
5. Push code (Vercel will auto-run migrations)

## What Gets Deleted

⚠️ **Warning:** This will delete all data in these tables:
- `demo_projects` (old system)
- `demo_sessions` (if any exist)
- All Phase 1 tables

✅ **Safe:** These are preserved:
- `users`
- `tiers`
- `leads`
- `campaigns`
- Any other existing tables not listed in the migration

## Verification

After running the migration, verify it worked:

```sql
-- Should return all 12 Phase 1 tables
SELECT tablename FROM pg_tables
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
);

-- Should return 12 tables
```

## Next Steps

Once the migration succeeds:

1. ✅ Vercel build should pass
2. ✅ Visit `/get-started/build` to test the form
3. ✅ Form should save data to `demo_sessions`
4. ✅ No more RLS errors

## If You Still Get Errors

Check these:

1. **Are migrations in the right folder?**
   - Should be in `supabase/migrations/`

2. **Is Supabase connected to your GitHub repo?**
   - Check Settings → Integrations

3. **Are you using the right Supabase project?**
   - Check `.env` files match your Supabase project

## Contact

If you're still stuck, the migration file has been committed to the `demo-generator-preview` branch. You can run it manually in Supabase SQL Editor.
