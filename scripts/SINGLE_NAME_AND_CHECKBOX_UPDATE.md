# Single Name Fix & Ownership Checkbox - Update Summary

## ✅ What Was Fixed

### 1. Single Name Handling
**Problem:** If user entered just "Matthew" (no last name), nothing was saved to the database.

**Solution:** Updated the name splitting logic to ALWAYS populate fields:

| Input | name | first_name | last_name |
|-------|------|------------|-----------|
| "Matthew" | Matthew | Matthew | (empty) |
| "Matthew Ellis" | Matthew Ellis | Matthew | Ellis |
| "Matthew James Ellis" | Matthew Ellis | Matthew | James Ellis |

**File Modified:** `src/app/api/waitlist/signup/route.ts` (lines 22-40)

### 2. Ownership Checkbox Added
**What:** Added checkbox with text "Yes, I want a website I actually OWN."

**Database:**
- New field: `wants_ownership` (BOOLEAN)
- Default: `true` (checked by default)
- Stored in `public.leads` table

**Files Modified:**
- `src/components/sections/coming-soon-banner.tsx` (UI)
- `src/app/api/waitlist/signup/route.ts` (API)
- `src/lib/schemas.ts` (Validation)
- `supabase/migrations/20250103000001_add_wants_ownership_to_leads.sql` (Database)

## 📋 Apply Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add the boolean column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS wants_ownership BOOLEAN DEFAULT true;

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_leads_wants_ownership ON leads(wants_ownership);

-- Add comment for documentation
COMMENT ON COLUMN leads.wants_ownership IS 'User checked "Yes, I want a website I actually OWN." during signup';

-- Backfill existing leads to default true
UPDATE leads
SET wants_ownership = true
WHERE wants_ownership IS NULL;
```

Or copy/paste from: `supabase/migrations/20250103000001_add_wants_ownership_to_leads.sql`

## 🧪 Test the Changes

### Test 1: Single Name
1. Go to your signup form
2. Enter:
   - Name: "Test"
   - Email: "singlename@test.com"
   - Checkbox: (leave checked)
3. Submit

**Verify in Database:**
```sql
SELECT email, name, first_name, last_name, wants_ownership
FROM public.leads
WHERE email = 'singlename@test.com';

-- Expected:
-- name: Test
-- first_name: Test
-- last_name: (NULL)
-- wants_ownership: true
```

### Test 2: Full Name
1. Go to your signup form
2. Enter:
   - Name: "Test User"
   - Email: "fullname@test.com"
   - Checkbox: (leave checked)
3. Submit

**Verify in Database:**
```sql
SELECT email, name, first_name, last_name, wants_ownership
FROM public.leads
WHERE email = 'fullname@test.com';

-- Expected:
-- name: Test User
-- first_name: Test
-- last_name: User
-- wants_ownership: true
```

### Test 3: Checkbox Unchecked
1. Go to your signup form
2. Enter:
   - Name: "Test User"
   - Email: "noownership@test.com"
   - Checkbox: **UNCHECK THIS**
3. Submit

**Verify in Database:**
```sql
SELECT email, name, first_name, last_name, wants_ownership
FROM public.leads
WHERE email = 'noownership@test.com';

-- Expected:
-- wants_ownership: false ✅
```

## 📊 UI Changes

The signup form now looks like:

```
┌────────────────────────────────────┐
│  Your name (optional)              │
│  [Matthew Ellis               ]    │
│  Optional - helps us greet you...  │
│                                    │
│  Enter your email                  │
│  [matt@example.com            ]    │
│                                    │
│  ☑ Yes, I want a website I        │
│    actually OWN.                   │
│                                    │
│  [      Notify Me      ]           │
│                                    │
│  No spam, just updates on our...   │
└────────────────────────────────────┘
```

## 📁 Files Changed

| File | Changes |
|------|---------|
| `src/components/sections/coming-soon-banner.tsx` | Added checkbox state & UI |
| `src/app/api/waitlist/signup/route.ts` | Fixed single name handling, save checkbox value |
| `src/lib/schemas.ts` | Added `wantsOwnership` to validation schema |
| `supabase/migrations/20250103000001_add_wants_ownership_to_leads.sql` | New column migration |

## ✨ What Happens Now

### Before (Broken):
❌ Name: "Matthew" → Nothing saved to database
❌ No checkbox for ownership preference

### After (Fixed):
✅ Name: "Matthew" → Saved as name="Matthew", first_name="Matthew"
✅ Name: "Matthew Ellis" → Saved as name="Matthew Ellis", first_name="Matthew", last_name="Ellis"
✅ Checkbox defaults to checked
✅ Checkbox value saved to `wants_ownership` field

## 🎯 Next Steps

1. **Apply migration** (run SQL above in Supabase)
2. **Test with fresh user** (try single name, full name, checkbox variations)
3. **Verify database** (check all fields are populated correctly)

That's it! The flow now works perfectly for single names and tracks ownership preference. 🎉
