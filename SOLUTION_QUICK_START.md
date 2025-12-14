# Affiliate System - Quick Start

## What Was the Problem?

Your database had conflicting migrations trying to:
1. Add `invited_by` column to `users` table (already existed)
2. Reference non-existent `affiliate_tiers` table
3. Keep unused `badges` table (class attendance tracking)
4. Manage old referral system tables

Error when running `scripts/create-affiliate-compensation-system.sql`:
```
ERROR: 42701: column "invited_by" of relation "users" already exists
```

## What Was Fixed?

Created a master consolidation migration that:
- ✅ Removed duplicate column attempts
- ✅ Fixed function definitions
- ✅ Dropped unused tables (badges, referral_clicks, referral_payouts)
- ✅ Preserved active tables (invite_tokens is used by auth!)
- ✅ Properly structured affiliate system (badge_clicks + compensations)

## Apply the Solution

### Quick Method (Supabase Dashboard)

1. Go to **SQL Editor**
2. Create new query
3. Copy-paste the SQL from:
   ```
   /supabase/migrations/20251214000001_consolidate_affiliate_system.sql
   ```
4. Click **Execute**

### Via CLI

```bash
SUPABASE_ACCESS_TOKEN=sbp_7d744da21b8fe89e8df59e59546b75acfd04091f npx supabase db push
```

## Verify It Worked

### Check affiliate tables exist
```sql
SELECT tablename FROM pg_tables
WHERE tablename IN ('affiliate_badge_clicks', 'affiliate_compensations');
-- Should return 2 rows
```

### Check old unused tables are gone
```sql
SELECT tablename FROM pg_tables
WHERE tablename IN ('badges', 'referral_clicks', 'referral_payouts');
-- Should return 0 rows
```

### Check invite_tokens is preserved
```sql
SELECT tablename FROM pg_tables WHERE tablename = 'invite_tokens';
-- Should return 1 row (it's used by auth!)
```

### Check no duplicate columns
```sql
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name='users' AND column_name='invited_by';
-- Should return 1
```

## Affiliate Commission Structure

After purchase, commissions are calculated as:

| Purchase Amount | Calculation | Max |
|---|---|---|
| $0-$200 | 25% | $50 |
| $200-$1,200 | 10% + tier 1 | +$100 |
| $1,200+ | 5% + tiers 1&2 | +$100 |
| **Total Cap** | — | **$250** |

**Examples:**
- $150 purchase → $37.50 commission
- $600 purchase → $90 commission ($50 + $40)
- $3,500 purchase → $250 commission (capped)

## Your Affiliate System Flow

```
1. Affiliate places badge on their website (with referrer ID)
   ↓
2. User clicks badge
   → POST /api/affiliate/badge-click
   → Creates affiliate_badge_clicks record
   ↓
3. User makes purchase at checkout
   ↓
4. Stripe webhook triggers (checkout.session.completed)
   → CheckoutCompletedHandler processes payment
   ↓
5. System calculates commission using tiered rates
   ↓
6. Creates affiliate_compensations record
   → Status: 'earned' → held 30 days → 'processed'
```

## Test It

```bash
curl -X POST http://localhost:3000/api/affiliate/badge-click \
  -H "Content-Type: application/json" \
  -d '{
    "referrerId": "your-uuid-here",
    "referrerEmail": "you@example.com",
    "sourceDomain": "example.com"
  }'
```

Expected response:
```json
{
  "success": true,
  "badgeClickId": "uuid",
  "clickedAt": "2024-12-14T..."
}
```

## Files Involved

- **New Migration:** `/supabase/migrations/20251214000001_consolidate_affiliate_system.sql`
- **Documentation:** `/MIGRATION_SOLUTION.md` (detailed guide)
- **Removed:** `/scripts/create-affiliate-compensation-system.sql` (was conflicting)
- **Existing Docs:** `/AFFILIATE_COMPENSATION_GUIDE.md` (still valid)

## Key Points

1. **No code changes needed** - Your application code is unchanged
2. **`invite_tokens` is preserved** - It's used by the auth system, not conflicting
3. **Migration is idempotent** - Safe to run multiple times
4. **All functions recreated** - Using hardcoded tier logic (no DB lookup)

## Need Help?

See `/MIGRATION_SOLUTION.md` for:
- Detailed problem analysis
- Architecture explanation
- Troubleshooting guide
- Alternative apply methods

---

**Status:** ✅ Ready to deploy
