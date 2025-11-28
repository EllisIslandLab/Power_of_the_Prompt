# AI-First /GET-STARTED Implementation Roadmap

## Quick Summary

```
CURRENT STATE:
├─ ❌ User visits /get-started
├─ ❌ Sees spinner (ThreeRoundFlow not found)
├─ ❌ Can't proceed (no form)
└─ ✅ Everything else works (AI, verification, payment)

GOAL:
├─ ✅ User visits /get-started
├─ ✅ Sees 3-round form
├─ ✅ Submits data
├─ ✅ Verifies email
├─ ✅ Gets preview
└─ ✅ Can upgrade
```

---

## What's Blocking Users Right Now

### The Problem in One Sentence
**Users can't start because the entry form component was deleted.**

### Where It Breaks
```
/get-started (page.tsx)
  └─> <ThreeRoundFlow ... />
      ❌ This component doesn't exist
      ❌ Users see spinner forever
      ❌ Can't fill form, can't proceed
```

### What's Working Behind the Scenes
✅ Email verification (Resend + Redis)
✅ AI generation (Claude API)
✅ Payment processing (Stripe)
✅ Preview display
✅ Database schema
✅ All API endpoints

---

## Implementation Plan (Priority Order)

### PRIORITY 1: Implement ThreeRoundFlow Component
**Why:** Unblocks the entire user flow
**Time:** 4-6 hours
**Complexity:** Medium

**What to build:**
```typescript
src/components/questions/ThreeRoundFlow.tsx
├─ Round 1: Email + Business Info
│  ├─ Email input (validation)
│  ├─ Business name (min 3 chars)
│  ├─ Business description (optional)
│  ├─ Target audience (optional)
│  └─ Color pickers (primary + secondary)
├─ Round 2: Category Selection
│  ├─ Fetch from database
│  ├─ Category picker (radio or select)
│  └─ Subcategory picker (conditional)
├─ Round 3: Content Source
│  ├─ "AI will create placeholder" (default)
│  ├─ "I'll upload content" (optional)
│  └─ Additional notes (optional)
└─ Controls
   ├─ Step indicator (1/2/3)
   ├─ Previous button
   ├─ Next button
   ├─ Validation on next click
   └─ Submit button on last step
```

**Key Features:**
- localStorage draft saving (allow resume)
- Form validation with error messages
- Smooth transitions between rounds
- Progress indicator
- Mobile responsive

**Testing:**
- Each round validates before next
- Can navigate back
- Draft persists on refresh
- Submit calls onComplete handler

---

### PRIORITY 2: Implement /api/save-rounds Endpoint
**Why:** Persists form data to database
**Time:** 2-3 hours
**Complexity:** Low-Medium

**What to build:**
```typescript
src/app/api/save-rounds/route.ts
├─ POST handler
├─ Input validation
├─ Create/update user
├─ Create demo_projects record
├─ Check email verification status
└─ Return projectId + needsVerification flag
```

**Key Features:**
- Transaction-safe (user + project together)
- Idempotent (can call twice safely)
- Check email already verified
- Store all three rounds as JSON metadata

**Testing:**
- Valid data saves correctly
- Returns projectId
- Indicates if verification needed
- Handles duplicate email

---

### PRIORITY 3: Build /get-started/verify Page
**Why:** Clear UX for email verification step
**Time:** 3-4 hours
**Complexity:** Medium

**What to build:**
```typescript
src/app/get-started/verify/[projectId]/page.tsx
├─ Header: "Check your email for a 6-digit code"
├─ Code input (6 digits, auto-advance)
├─ Timer (10 minutes countdown)
├─ Resend button (rate limited)
├─ Error messages
└─ Auto-redirect on success
```

**Key Features:**
- Display sent email (masked)
- Large, easy code input
- Auto-submit when 6 digits entered
- Countdown timer
- "Resend code" button (with rate limiting)
- Clear error states
- Auto-continue to next step on success

**Testing:**
- Enter valid code → redirects to deep-dive
- Enter invalid code → error message
- Code expires → show "code expired" message
- Resend button works (rate limited)
- Timer counts down correctly

---

### PRIORITY 4: Build /get-started/deep-dive Page (Optional)
**Why:** Better AI results with more context
**Time:** 2-3 hours
**Complexity:** Low

**What to build:**
```typescript
src/app/get-started/deep-dive/[projectId]/page.tsx
├─ Header: "Optional: Tell us more"
├─ Questions
│  ├─ Target audience details
│  ├─ Business pain points
│  ├─ Unique value prop
│  └─ Competitor differentiation
├─ Buttons
│  ├─ "Generate Preview" (with enhanced data)
│  └─ "Skip" (use basic data)
└─ Loading state during generation
```

**Key Features:**
- Can skip entirely
- Makes better AI prompts
- Shows loading during generation
- Auto-redirects to preview page

**Testing:**
- Can skip → goes straight to preview
- Can submit → calls generate-preview API
- Loading spinner shows
- Redirect to /get-started/preview/[projectId]

---

## Implementation Checklist

### Phase 1: Make It Work (MVP)
- [ ] **ThreeRoundFlow component**
  - [ ] Round 1 form with email + business info
  - [ ] Round 2 category selector
  - [ ] Round 3 content source selector
  - [ ] Next/previous navigation
  - [ ] Form validation
  - [ ] localStorage saving

- [ ] **/api/save-rounds endpoint**
  - [ ] Accept three rounds of data
  - [ ] Create user if needed
  - [ ] Create demo_projects record
  - [ ] Return projectId
  - [ ] Return needsVerification flag

- [ ] **/get-started/verify page**
  - [ ] Code input field
  - [ ] Countdown timer
  - [ ] Resend button
  - [ ] Error handling
  - [ ] Auto-redirect on success

- [ ] **Test E2E Flow**
  - [ ] Visit /get-started
  - [ ] Fill form (all 3 rounds)
  - [ ] Submit
  - [ ] See verify page
  - [ ] Enter code
  - [ ] See preview page
  - [ ] Verify data saved correctly

### Phase 2: Make It Better
- [ ] Deep-dive page (optional questions)
- [ ] Better error messages
- [ ] Error boundaries
- [ ] Analytics tracking
- [ ] Mobile responsiveness
- [ ] Accessibility (ARIA labels)

### Phase 3: Make It Smooth
- [ ] localStorage recovery on refresh
- [ ] Better loading states
- [ ] Skeleton screens
- [ ] Prefetch category data
- [ ] Optimistic UI updates

### Phase 4: Optimize
- [ ] A/B test: Deep-dive required vs optional
- [ ] Track conversion at each step
- [ ] Improve AI prompt based on data
- [ ] Performance metrics
- [ ] Conversion funnel analysis

---

## File Locations

### Components to Create
```
src/components/questions/ThreeRoundFlow.tsx      (NEW)
src/app/api/save-rounds/route.ts                 (NEW)
src/app/get-started/verify/[projectId]/page.tsx  (NEW)
src/app/get-started/deep-dive/[projectId]/page.tsx (NEW - optional)
```

### Files to Update
```
src/app/get-started/page.tsx                      (already imports ThreeRoundFlow)
```

### No Changes Needed
```
✅ src/app/api/ai/send-verification-email/route.ts
✅ src/app/api/ai/verify-code/route.ts
✅ src/app/api/ai/generate-preview/route.ts
✅ src/app/get-started/preview/[projectId]/page.tsx
✅ src/app/get-started/success/page.tsx
```

---

## Implementation Order (Do This)

1. **Start with ThreeRoundFlow** - Unblocks everything else
2. **Then /api/save-rounds** - Makes ThreeRoundFlow functional
3. **Then /get-started/verify** - Completes verification flow
4. **Then /get-started/deep-dive** - Polish and optimization

---

## Testing Flow (After Each Step)

### After ThreeRoundFlow
```
1. Visit /get-started
2. Should see form (not spinner)
3. Fill Round 1 data
4. Click Next
5. Fill Round 2 data
6. Click Next
7. Fill Round 3 data
8. Click Submit
9. Should show loading state
10. onComplete handler should log data
```

### After /api/save-rounds
```
1-8. (same as above)
9. Check database - demo_projects should exist
10. Response should have projectId
11. Response should have needsVerification flag
```

### After /get-started/verify
```
1-11. (same as above)
12. Should redirect to /get-started/verify/[projectId]
13. Should see code input field
14. Enter 6-digit code from email
15. Should auto-submit
16. Should redirect to /get-started/deep-dive/[projectId]
```

### After Deep-Dive (optional)
```
1-16. (same as above)
17. Should see deep-dive questions
18. Can skip or submit more info
19. Should show loading during generation
20. Should redirect to /get-started/preview/[projectId]
21. Should see generated website preview
```

---

## Estimated Timeline

| Component | Hours | Days | Start | Finish |
|-----------|-------|------|-------|--------|
| ThreeRoundFlow | 5 | 1 | Day 1 | Day 1 |
| save-rounds API | 2.5 | 0.5 | Day 1 | Day 1 |
| verify page | 3.5 | 1 | Day 2 | Day 2 |
| deep-dive page | 2.5 | 0.5 | Day 2 | Day 2 |
| Testing & fixes | 4 | 1 | Day 3 | Day 3 |
| **TOTAL** | **17.5** | **3.5** | Day 1 | Day 3 |

**For MVP only (first 3 components): ~11 hours / ~2 days**

---

## Success Criteria

### MVP Success
- [ ] User can visit /get-started and see working form
- [ ] User can submit all 3 rounds
- [ ] Data saves to database
- [ ] Email verification works
- [ ] User can see preview
- [ ] No console errors

### Full Success
- [ ] All above + deep-dive
- [ ] Error recovery on all pages
- [ ] Form persists on refresh
- [ ] Analytics tracking
- [ ] Mobile responsive
- [ ] Full test coverage

---

## Common Pitfalls to Avoid

1. **Don't** create separate Round components without validation
   - **Do:** Validate within ThreeRoundFlow before allowing next

2. **Don't** forget email verification check
   - **Do:** Return `needsVerification` flag from save-rounds API

3. **Don't** show preview without verified email
   - **Do:** Block /get-started/preview from unauthorized access

4. **Don't** lose user data on page refresh
   - **Do:** Save to localStorage after each round

5. **Don't** make deep-dive required
   - **Do:** Make it optional with "Skip" button

---

## Questions? Here's the Flow Again

```
User visits /get-started
       ↓
   [ThreeRoundFlow Component]
   ├─ Round 1: Email + Business Info
   ├─ Round 2: Category selection
   ├─ Round 3: Content source
       ↓
   POST /api/save-rounds
       ↓
   Redirect to /get-started/verify/[projectId]
       ↓
   [Verification Page]
   ├─ Enter 6-digit code
       ↓
   POST /api/ai/verify-code
       ↓
   Redirect to /get-started/deep-dive/[projectId] (optional)
       ↓
   [Deep-Dive Page]
   ├─ Optional: Answer more questions
       ↓
   POST /api/ai/generate-preview
       ↓
   Redirect to /get-started/preview/[projectId]
       ↓
   [Preview Page] ✅ WORKS ALREADY
   ├─ Show generated website
   ├─ Option to customize ($5)
   ├─ Option to buy course ($799)
       ↓
   Stripe checkout
       ↓
   Success page
```

This is the **AI-first** approach: Users answer questions → AI generates website → User can refine.

