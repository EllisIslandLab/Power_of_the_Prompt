# Quick Start: /GET-STARTED Implementation

**Time to Read This:** 3 minutes
**Status:** Ready to implement right now

---

## The Situation

**What's Broken:** Users see spinner on `/get-started` (form component missing)
**What Works:** Everything else (email, AI, payments)
**What We Need:** 3 components (11 hours of work, 2 days)

---

## The Plan

### Component 1: ThreeRoundFlow (Priority 1 - CRITICAL)
**What:** Form with 3 screens
**Where:** `src/components/questions/ThreeRoundFlow.tsx` (NEW FILE)
**Time:** 5 hours
**How:**
- Round 1: Email, business name, colors (6 fields)
- Round 2: Category picker (from database)
- Round 3: Content source (upload or AI)
- Controls: Previous, Next, Submit buttons
- Features: localStorage saving, validation

**When done:** Users can fill form ✅

---

### Component 2: /api/save-rounds (Priority 2 - CRITICAL)
**What:** API that saves form to database
**Where:** `src/app/api/save-rounds/route.ts` (NEW FILE)
**Time:** 2.5 hours
**How:**
- Accept POST with all 3 rounds
- Create user if needed
- Create demo_projects record
- Return projectId + needsVerification flag

**When done:** Form data saves ✅

---

### Component 3: /get-started/verify (Priority 3 - IMPORTANT)
**What:** Email verification page
**Where:** `src/app/get-started/verify/[projectId]/page.tsx` (NEW FILE)
**Time:** 3.5 hours
**How:**
- Show "Enter 6-digit code from your email"
- 10-minute countdown timer
- "Resend code" button (rate limited)
- Auto-submit when 6 digits entered
- Redirect to preview/deep-dive on success

**When done:** Users can verify email ✅

---

### Component 4: /get-started/deep-dive (Priority 4 - OPTIONAL)
**What:** Additional questions for better AI
**Where:** `src/app/get-started/deep-dive/[projectId]/page.tsx` (NEW FILE)
**Time:** 2.5 hours
**How:**
- "Optional: Answer more questions"
- 4 follow-up questions
- Skip button
- Generate preview button
- Calls AI generation API

**When done:** Users can get better previews ✅

---

## The Flow

```
/get-started
     ↓
[ThreeRoundFlow] ← Component 1
     ↓
POST /api/save-rounds ← Component 2
     ↓
/get-started/verify ← Component 3
     ↓
Enter code
     ↓
/get-started/deep-dive ← Component 4 (optional)
     ↓
POST /api/ai/generate-preview ✅ Already works
     ↓
/get-started/preview ✅ Already works
     ↓
[Show generated website]
     ↓
User pays $5 or $799 ✅ Already works
     ↓
Success! ✅
```

---

## Files to Create

### New Files (4 total)
```
src/components/questions/ThreeRoundFlow.tsx         (NEW - 5 hrs)
src/app/api/save-rounds/route.ts                   (NEW - 2.5 hrs)
src/app/get-started/verify/[projectId]/page.tsx    (NEW - 3.5 hrs)
src/app/get-started/deep-dive/[projectId]/page.tsx (NEW - 2.5 hrs, optional)
```

### Files to Update
```
src/app/get-started/page.tsx - Already imports ThreeRoundFlow ✅
                               Just make sure it works
```

### Don't Touch (Already Working)
```
✅ API routes (verification, generation, checkout)
✅ Preview page
✅ Success page
✅ Database
✅ Stripe integration
```

---

## What You Need to Know

### Database
- `users` table exists with free_tokens_claimed/used flags
- `demo_projects` table exists for storing project data
- `website_categories` & `website_subcategories` exist for Round 2

### APIs (Already Implemented)
- `POST /api/ai/send-verification-email` - Sends code via Resend
- `POST /api/ai/verify-code` - Validates code
- `POST /api/ai/generate-preview` - Generates website with Claude

### Third-Party Services
- **Resend** - Email (verification codes)
- **Redis/Upstash** - Code storage (10-min TTL)
- **Claude API** - AI generation
- **Stripe** - Payments

---

## Testing Steps

After building each component:

### After ThreeRoundFlow:
```
1. Visit /get-started
2. Should see form (not spinner)
3. Fill Round 1 → Next should work
4. Fill Round 2 → Category options from DB
5. Fill Round 3 → Submit button appears
6. Data in browser console on submit
```

### After save-rounds API:
```
1. Fill form and submit
2. Check Supabase - demo_projects should exist
3. Should get projectId back
4. Should redirect to verify page
```

### After verify page:
```
1. Enter code from test email
2. Should redirect to deep-dive (or preview if skipped)
3. Code should validate in database
4. users.free_tokens_claimed = true
```

### After deep-dive page:
```
1. Should see optional questions
2. Can skip or submit
3. Should call generate-preview API
4. Should redirect to preview page
5. Should see generated website
```

---

## Key Implementation Notes

### localStorage (Form Recovery)
```typescript
// After each round, save to localStorage
localStorage.setItem('threeRoundForm', JSON.stringify({
  round1, round2, round3
}))

// On mount, recover if exists
const saved = localStorage.getItem('threeRoundForm')
if (saved) setFormData(JSON.parse(saved))
```

### Form Validation
```typescript
// Round 1
- Email must be valid format
- Business name 3-100 chars
- Colors must be valid hex

// Round 2
- Category required, must exist in DB
- Subcategory required if parent selected

// Round 3
- Content source: 'upload' | 'ai_placeholder' | 'skip'
```

### API Calls
```typescript
// ThreeRoundFlow calls:
POST /api/save-rounds
  ← onComplete handler

// verify page calls:
POST /api/ai/verify-code
  ← After user enters code

// deep-dive page calls:
POST /api/ai/generate-preview
  ← After user clicks "Generate"
```

---

## Timeline

| Task | Duration | Status |
|------|----------|--------|
| ThreeRoundFlow | 5 hours | ⏳ TODO |
| save-rounds API | 2.5 hours | ⏳ TODO |
| verify page | 3.5 hours | ⏳ TODO |
| deep-dive page | 2.5 hours | ⏳ TODO (optional) |
| Testing | 2-3 hours | ⏳ TODO |
| **TOTAL** | **17.5 hours** | ⏳ TODO |

**MVP (first 3): 11 hours / 2 days**
**Full (all 4): 17.5 hours / 3 days**

---

## Before You Start

1. **Read** IMPLEMENTATION-ROADMAP.md (15 min)
   - Shows exact code structure
   - Shows what each component should do
   - Shows file locations

2. **Read** FLOW-DIAGRAMS.txt (5 min)
   - Visual overview
   - API sequences
   - Validation rules

3. **Verify Database**
   - Can you query Supabase?
   - Do website_categories exist?
   - Do users table have free_tokens columns?

4. **Get Credentials**
   - ANTHROPIC_API_KEY ✓
   - SUPABASE_URL ✓
   - SUPABASE_ANON_KEY ✓
   - UPSTASH_REDIS_REST_URL ✓
   - RESEND_API_KEY ✓

---

## Success Looks Like

After you finish:
- ✅ Users can visit /get-started and see a form
- ✅ Users can fill 3 rounds of data
- ✅ Users can submit and get verification email
- ✅ Users can enter code and verify
- ✅ Users can see AI-generated preview
- ✅ Users can upgrade and pay
- ✅ No console errors
- ✅ All data saved to database

---

## If You Get Stuck

1. **Check IMPLEMENTATION-ROADMAP.md** - Most issues covered
2. **Check GET-STARTED-AI-FIRST-ANALYSIS.md** - Deep technical reference
3. **Check FLOW-DIAGRAMS.txt** - API sequences and validation
4. **Check git log** - Look at similar implementations

---

## Ready?

1. Read IMPLEMENTATION-ROADMAP.md (15 minutes)
2. Create src/components/questions/ThreeRoundFlow.tsx
3. Create src/app/api/save-rounds/route.ts
4. Create src/app/get-started/verify/[projectId]/page.tsx
5. Test end-to-end

**You've got this!** 🚀

---

**Questions?** See ANALYSIS-SUMMARY.md for executive overview.
**Need Details?** See GET-STARTED-AI-FIRST-ANALYSIS.md for deep dive.
**Ready to Code?** See IMPLEMENTATION-ROADMAP.md for step-by-step.
