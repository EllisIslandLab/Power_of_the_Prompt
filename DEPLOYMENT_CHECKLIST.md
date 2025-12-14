# Affiliate System Consolidation - Deployment Checklist

## Pre-Deployment

- [x] **Analysis Complete** - Identified all table conflicts
- [x] **Migration Created** - `20251214000001_consolidate_affiliate_system.sql`
- [x] **Documentation Written** - Multiple guides provided
- [x] **Conflicting Files Removed** - `scripts/create-affiliate-compensation-system.sql`
- [x] **Code Committed** - Changes pushed to git (commit 5d13d79)

## Apply Migration (Choose One Method)

### Method 1: Supabase Dashboard (Easiest for Testing)
- [ ] Go to: https://app.supabase.com
- [ ] Select: Your Web Launch Coach project
- [ ] Click: SQL Editor
- [ ] Create: New Query
- [ ] Copy: Contents of `/supabase/migrations/20251214000001_consolidate_affiliate_system.sql`
- [ ] Paste: Into the SQL Editor
- [ ] Execute: Click "Run" or Cmd+Enter

Expected output:
```
✅ AFFILIATE SYSTEM CONSOLIDATED
...migration complete...
```

### Method 2: Supabase CLI (Production Recommended)
- [ ] Run: `SUPABASE_ACCESS_TOKEN=sbp_7d744da21b8fe89e8df59e59546b75acfd04091f npx supabase db push`
- [ ] Confirm: When prompted
- [ ] Wait: For migration to complete

### Method 3: PostgreSQL Client
- [ ] Connect: To your Supabase database
- [ ] Execute: The entire migration file
- [ ] Verify: No errors in output

## Post-Migration Verification

Run these checks in Supabase SQL Editor to confirm success:

### 1. Affiliate Tables Exist
```sql
SELECT tablename FROM pg_tables
WHERE tablename IN ('affiliate_badge_clicks', 'affiliate_compensations');
```
- [ ] Expected result: 2 rows

### 2. Old Unused Tables Removed
```sql
SELECT tablename FROM pg_tables
WHERE tablename IN ('badges', 'referral_clicks', 'referral_payouts');
```
- [ ] Expected result: 0 rows (empty)

### 3. invite_tokens Still Exists (Preserved)
```sql
SELECT tablename FROM pg_tables WHERE tablename = 'invite_tokens';
```
- [ ] Expected result: 1 row

### 4. No Duplicate Columns
```sql
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name='users' AND column_name='invited_by';
```
- [ ] Expected result: 1

### 5. Functions Exist and Work
```sql
SELECT proname FROM pg_proc
WHERE proname IN ('calculate_affiliate_commission', 'mark_badge_click_converted');
```
- [ ] Expected result: 2 rows

### 6. Columns Properly Linked
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name='users' AND column_name='invited_by';
```
- [ ] Expected result: invited_by column exists

## Functional Testing

### Test Badge Click Tracking
```bash
curl -X POST http://localhost:3000/api/affiliate/badge-click \
  -H "Content-Type: application/json" \
  -d '{
    "referrerId": "test-affiliate-uuid",
    "referrerEmail": "affiliate@test.com",
    "sourceDomain": "test.com"
  }'
```
- [ ] Expected: `{"success":true,"badgeClickId":"...","clickedAt":"..."}`

### Test Getting Badge Stats
```bash
curl "http://localhost:3000/api/affiliate/badge-click?referrerId=test-affiliate-uuid"
```
- [ ] Expected: Stats with totalClicks, convertedClicks, conversionRate

### Check Database Directly
```sql
SELECT COUNT(*) as badge_click_count FROM affiliate_badge_clicks;
SELECT COUNT(*) as compensation_count FROM affiliate_compensations;
```
- [ ] Badge clicks should exist (from test)
- [ ] Compensations table should be empty (until purchase triggers)

## Application Testing

### Verify Application Still Works
- [ ] Homepage loads
- [ ] Authentication works (login/signup)
- [ ] Affiliate page loads (`/affiliate`)
- [ ] Badge component renders
- [ ] Stripe payment flow works

### Check Logs
- [ ] No errors in server logs
- [ ] No errors in Supabase logs
- [ ] No errors in browser console

## Deployment Status

| Step | Status | Date | Notes |
|------|--------|------|-------|
| Analysis | ✅ Complete | 2024-12-14 | Identified all conflicts |
| Migration Created | ✅ Complete | 2024-12-14 | Ready to deploy |
| Documentation | ✅ Complete | 2024-12-14 | 3 guides provided |
| Git Committed | ✅ Complete | 2024-12-14 | Commit 5d13d79 |
| Migration Applied | ⬜ Pending | — | Awaiting manual execution |
| Verification | ⬜ Pending | — | After migration applied |
| Testing | ⬜ Pending | — | After verification passes |
| Production Sign-Off | ⬜ Pending | — | After all tests pass |

## Rollback Plan (If Needed)

If something goes wrong, you can rollback:

```sql
-- Create a backup first
CREATE TABLE affiliate_badge_clicks_backup AS SELECT * FROM affiliate_badge_clicks;
CREATE TABLE affiliate_compensations_backup AS SELECT * FROM affiliate_compensations;

-- Then restore (if needed)
-- Or create a new migration that reverses the changes
```

However, this migration should be safe because:
- It uses `IF NOT EXISTS` checks
- It preserves all active tables
- It's idempotent (can run multiple times)

## Documentation References

- **Quick Start Guide** → `SOLUTION_QUICK_START.md`
- **Detailed Guide** → `MIGRATION_SOLUTION.md`
- **System Architecture** → `AFFILIATE_COMPENSATION_GUIDE.md`
- **Migration File** → `supabase/migrations/20251214000001_consolidate_affiliate_system.sql`

## Support

If you encounter issues:

1. **Check Migration Output** - Look for error messages
2. **Review Logs** - Check Supabase logs for details
3. **Verify Prerequisites** - Ensure Supabase token is valid
4. **Consult Documentation** - See the guides above
5. **Database State** - Check with verification queries above

## Sign-Off

- [ ] All verification checks passed
- [ ] Application testing completed
- [ ] No errors in logs
- [ ] Ready for production
- [ ] Stakeholder approval obtained

**Migration Applied By:** _______________
**Date Applied:** _______________
**Verified By:** _______________
**Date Verified:** _______________

---

## Summary

This consolidation:
- ✅ Fixes the duplicate `invited_by` column error
- ✅ Removes conflicting table structures
- ✅ Cleans up unused tables (badges, old referral system)
- ✅ Preserves active systems (invite_tokens, auth)
- ✅ Creates a clean, unified affiliate system
- ✅ Includes proper security (RLS, indexes, constraints)

**Ready for deployment!** 🚀
