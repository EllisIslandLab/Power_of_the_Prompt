# /GET-STARTED Flow: AI-First Architecture Analysis & Implementation Plan

**Last Updated:** 2025-11-28
**Status:** Ready for Implementation
**Priority:** Critical (blocks user onboarding)

---

## EXECUTIVE SUMMARY

The `/get-started` flow has a **solid AI-first infrastructure** (verification, payments, AI generation) but is **blocked at the entry point** by missing form components. The flow references a `ThreeRoundFlow` component that was deleted during schema consolidation.

### Current State
- ✅ Email verification working (Redis + Resend)
- ✅ AI generation working (Claude API integration)
- ✅ Payment processing working (Stripe integration)
- ✅ Database schema supports the flow
- ❌ **Entry form completely missing** (ThreeRoundFlow.tsx deleted)
- ❌ **Data saving endpoint missing** (/api/save-rounds)
- ❌ **Verification UI page missing** (/get-started/verify)
- ❌ **Post-verification page missing** (/get-started/deep-dive)

### Bottom Line
Users visiting `/get-started` see a spinner loading `ThreeRoundFlow` forever. The component doesn't exist. This is **not a design problem**, it's a **missing implementation**.

---

## CURRENT USER FLOW (End-to-End)

### Step 1: Entry Point → `/get-started`
**File:** `src/app/get-started/page.tsx`
**Current Behavior:**
- Shows header: "Build Your Custom Website In 3 Simple Rounds"
- Renders `<ThreeRoundFlow onComplete={handleThreeRoundsComplete} />`
- **PROBLEM:** Component doesn't exist → infinite spinner

**What Should Happen:**
- Displays form with three rounds
- Round 1: Email + Business Name + Colors
- Round 2: Category selection
- Round 3: Content upload or AI placeholder
- Next button → POST to `/api/save-rounds`

---

### Step 2: Save Three Rounds → `/api/save-rounds`
**Expected Endpoint:** `POST /api/save-rounds`
**Current Status:** MISSING (not implemented)

**What Should Happen:**
```json
{
  "round1": {
    "email": "user@example.com",
    "businessName": "Acme Corp",
    "colors": { "primary": "#0066cc" }
  },
  "round2": {
    "categoryId": "uuid-here",
    "subcategoryId": "uuid-here"
  },
  "round3": {
    "contentType": "upload" | "ai_placeholder",
    "files": ["file1.txt"] // optional
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "projectId": "uuid-here",
  "needsVerification": true|false,
  "email": "user@example.com"
}
```

**Database Actions:**
1. Create `users` record if doesn't exist
2. Create `demo_projects` record with status `draft`
3. Store round data in `demo_projects.metadata` as JSON
4. Check if email already verified
5. If not verified, return `needsVerification: true`

---

### Step 3: Email Verification (Async - Parallel)
**Current:** Working via existing APIs
- `POST /api/ai/send-verification-email` ✅
- `POST /api/ai/verify-code` ✅

**What Should Happen:**
- User shown `/get-started/verify/[projectId]` page
- Page displays:
  - "Check your email for a 6-digit code"
  - Text input for code
  - Countdown timer (10 minutes)
  - "Resend code" button
- User enters code → calls `/api/ai/verify-code`
- Code verified → Auto-continues to Step 4

**Missing:** Verification UI page at `src/app/get-started/verify/[projectId]/page.tsx`

---

### Step 4: Post-Verification Options
**Current:** No page for this
**File Needed:** `src/app/get-started/deep-dive/[projectId]/page.tsx`

**Two Paths:**

#### Path A: Skip to Preview Generation
- User clicks "Generate Preview Now"
- Calls `POST /api/ai/generate-preview` with Round 1+2 answers
- Gets `projectId` back
- Redirects to Step 6

#### Path B: Deep-Dive Questions (Optional)
- "Answer a few more questions for better results"
- Collects additional context:
  - Target audience demographics
  - Business pain points they solve
  - Unique value proposition
  - Competitor differentiation
- Calls `POST /api/ai/generate-preview` with enhanced answers
- Gets `projectId` back
- Redirects to Step 6

---

### Step 5: AI Preview Generation
**File:** `src/app/api/ai/generate-preview/route.ts` ✅ (Already working)

**What It Does:**
1. Accepts user email + answers
2. Generates optimized prompt from answers
3. Calls Claude API:
   - **Free tier:** Claude Haiku 3.5 (token efficient)
   - **Premium tier:** Claude Sonnet 4 (better quality)
4. Gets back JSON with:
   - Website components
   - Color scheme
   - Typography
   - Copy/content
5. Stores in `demo_projects` as:
   - `generated_components` (JSONB)
   - `theme_settings` (JSONB)
   - `metadata` (JSONB)
6. Updates `users.free_tokens_used = true`
7. Returns `{ success: true, projectId }`

---

### Step 6: Preview Page
**File:** `src/app/get-started/preview/[projectId]/page.tsx` ✅ (Already working)

**What User Sees:**
- Website preview rendered in iframe
- Upgrade options:
  - **"Customize with AI - $5"** → 3 AI refinements for this preview
  - **"Foundation Course - $799"** → Full code + learning materials

---

### Step 7: Payment Processing
**Endpoints:** ✅ (Already working)
- `POST /api/demo-generator/create-ai-checkout`
- Stripe webhook handling

**What Happens:**
1. User clicks upgrade option
2. Creates Stripe checkout session
3. User completes payment
4. Webhook updates database
5. Redirects to `/get-started/success?session_id={id}`

---

### Step 8: Success Page
**File:** `src/app/get-started/success/page.tsx` ✅ (Already working)

**What User Sees:**
- "Payment successful!"
- "Your website is ready"
- Download code (if paid for course)
- View full builder (if paid for AI customization)
- Share preview link option

---

## MISSING COMPONENTS & IMPLEMENTATION

### PRIORITY 1: ThreeRoundFlow Component
**File:** `src/components/questions/ThreeRoundFlow.tsx`
**Status:** CRITICAL - Blocks entire flow

**Purpose:** Main form component with three rounds

**Structure:**
```typescript
interface ThreeRoundFlowProps {
  onComplete: (data: {
    round1: Round1Data,
    round2: Round2Data,
    round3: Round3Data
  }) => Promise<void>
}

type Round1Data = {
  email: string
  businessName: string
  businessDescription: string
  targetAudience: string
  primaryColors: { primary: string, secondary: string }
  industry: string
}

type Round2Data = {
  categoryId: string
  subcategoryId: string
  customCategory?: string
}

type Round3Data = {
  contentSource: 'upload' | 'ai_placeholder' | 'skip'
  uploadedFiles?: File[]
  additionalNotes?: string
}
```

**Features:**
- Step indicator (Round 1/2/3)
- Form validation on each round
- Save draft locally (localStorage)
- Progress bar
- Next/Previous buttons
- Cancel option

**Validation Rules:**
- **Email:** Must be valid email format
- **Business Name:** Min 3 chars, max 100 chars
- **Category:** Required, must exist in database
- **No files required** (AI generates placeholders)

---

### PRIORITY 2: /api/save-rounds Endpoint
**File:** `src/app/api/save-rounds/route.ts`
**Status:** CRITICAL - Needed for data persistence

**Implementation:**
```typescript
export async function POST(req: NextRequest) {
  const { round1, round2, round3 } = await req.json()

  // 1. Validate inputs
  // 2. Create/get user from email
  // 3. Create demo_projects record with all data
  // 4. Check if email verified
  // 5. Return projectId + needsVerification flag
  // 6. Maybe: Trigger background email send
}
```

**Database Operations:**
```sql
-- 1. Create/update user
INSERT INTO users (email)
VALUES (round1.email)
ON CONFLICT (email) DO UPDATE SET updated_at = now();

-- 2. Create demo_projects
INSERT INTO demo_projects (
  user_email,
  business_name,
  metadata,
  status,
  created_at
) VALUES (
  round1.email,
  round1.businessName,
  jsonb_build_object(
    'round1', to_jsonb(round1),
    'round2', to_jsonb(round2),
    'round3', to_jsonb(round3)
  ),
  'draft',
  now()
);

-- 3. Check verification status
SELECT free_tokens_claimed FROM users WHERE email = round1.email;
```

---

### PRIORITY 3: Verification UI Page
**File:** `src/app/get-started/verify/[projectId]/page.tsx`
**Status:** IMPORTANT - UX critical

**What It Shows:**
- "Check your email for a 6-digit code"
- Large text input (6 digits, auto-advance)
- 10-minute countdown timer
- "Resend code" button (rate limited)
- "Already verified? Continue" link

**What It Does:**
- Display project info (optional)
- Auto-submit code when 6 digits entered
- On success: Auto-redirect to `/get-started/deep-dive/[projectId]`
- On error: Show "Invalid code, try again"
- On timeout: Show "Code expired, request new one"

---

### PRIORITY 4: Deep-Dive Page
**File:** `src/app/get-started/deep-dive/[projectId]/page.tsx`
**Status:** IMPORTANT - Better AI results

**What It Shows:**
- "Optional: Tell us more for better results"
- Questions:
  - Target audience (demographics)
  - Business pain points
  - Unique value proposition
  - Competitor differentiation
- Buttons: "Generate Preview" and "Skip"

**What It Does:**
- Calls `/api/ai/generate-preview` with enhanced data
- Shows loading spinner during generation
- Redirects to `/get-started/preview/[projectId]`

---

## ARCHITECTURE IMPROVEMENTS

### Issue 1: Conflicting Form Flows
**Current Problem:**
- `/get-started/page.tsx` tries to render `ThreeRoundFlow` (AI-first)
- `/get-started/[...path]/page.tsx` renders `DemoSiteGeneratorForm` (template-based)
- Both can serve the same URL
- User confusion

**Recommendation:**
1. Keep **ThreeRoundFlow** as primary (AI-first)
2. Move template-based form to `/builder` or `/template-builder`
3. Or: Make template-based a **secondary option** on the preview page
   - "Not happy? Choose from templates instead"

---

### Issue 2: No Transaction Safety
**Current Problem:**
If `demo_projects` insert fails after user creation, data is orphaned.

**Fix:**
```typescript
const { data: user } = await supabase
  .from('users')
  .insert({ email })
  .select()
  .single();

const { data: project, error } = await supabase
  .from('demo_projects')
  .insert({ user_email, ... })
  .select()
  .single();

if (error) {
  // Optionally delete user? Or just warn?
  // Depends on UX - is user creation enough to verify?
}
```

---

### Issue 3: Email Verification Rate Limiting
**Current:** 1 email per IP per hour, 5 attempts per email per 10 sec

**Recommendation:** Add to save-rounds:
```typescript
// Only send if email not already verified
if (!user?.free_tokens_claimed) {
  await sendVerificationEmail(round1.email)
}
```

---

### Issue 4: No Session State for Builder
**Current Problem:**
- User pays for customization
- Redirected to `/get-started/success`
- No way to return to builder state

**Recommendation:**
Store builder state in Stripe metadata:
```typescript
const session = await stripe.checkout.sessions.create({
  metadata: {
    projectId,
    userEmail,
    builderState: JSON.stringify(formData)
  }
})
```

Then in success page, restore from Stripe session data.

---

## IMPLEMENTATION ROADMAP

### Phase 1: Core Flow (Week 1)
**Goal:** Users can complete form → Save data → Verify email

1. ✅ Implement `ThreeRoundFlow` component
2. ✅ Implement `/api/save-rounds` endpoint
3. ✅ Implement `/get-started/verify` page
4. ✅ Test: E2E flow from form to verification

### Phase 2: AI Integration (Week 2)
**Goal:** Users can generate previews after verification

1. ✅ Implement `/get-started/deep-dive` page (optional)
2. ✅ Wire up preview generation button
3. ✅ Test: AI generation with different answer sets
4. ✅ Test: Free vs. Premium token consumption

### Phase 3: Refinement (Week 3)
**Goal:** Smooth UX, error recovery, analytics

1. ✅ Error boundaries on form
2. ✅ Form validation with clear messages
3. ✅ Analytics tracking on each step
4. ✅ Test: Interrupted flows (browser close, network error)

### Phase 4: Optimization (Week 4)
**Goal:** Performance, conversion optimization

1. ✅ localStorage draft saving
2. ✅ Prefetch category data
3. ✅ A/B test: Deep-dive optional vs. required
4. ✅ Optimize prompt for better previews

---

## TESTING CHECKLIST

### Unit Tests
- [ ] ThreeRoundFlow component renders correctly
- [ ] Form validation catches invalid inputs
- [ ] API save-rounds handles all edge cases
- [ ] Email verification code matches

### Integration Tests
- [ ] Form submission → API → Database → Redirect
- [ ] Email verified → Can generate preview
- [ ] Email not verified → Blocked from generation
- [ ] Free token used → Can't generate again without payment

### E2E Tests (Manual)
- [ ] User visits /get-started
- [ ] User fills form (all 3 rounds)
- [ ] User clicks submit
- [ ] User receives verification email
- [ ] User enters code
- [ ] User sees preview page
- [ ] User can upgrade
- [ ] Payment succeeds
- [ ] User reaches success page

### Edge Cases
- [ ] Code expires (10 min)
- [ ] User enters wrong code 5x (rate limited)
- [ ] User tries to skip verification
- [ ] User clicks "resend" code multiple times
- [ ] User refreshes page mid-form (localStorage restore)
- [ ] Network error during save (retry logic)

---

## DATABASE SCHEMA VERIFICATION

### Users Table
```sql
✅ id (UUID)
✅ email (text, unique)
✅ free_tokens_claimed (boolean)
✅ free_tokens_claimed_at (timestamp)
✅ free_tokens_used (boolean)
✅ free_tokens_used_at (timestamp)
✅ created_at, updated_at
```

### Demo_Projects Table
```sql
✅ id (UUID)
✅ user_email (text, FK to users.email)
✅ business_name (text)
✅ metadata (JSONB) - stores all three rounds
✅ status (text: 'draft', 'preview_generated', 'purchased')
✅ generated_components (JSONB)
✅ theme_settings (JSONB)
✅ was_free_generation (boolean)
✅ created_at, updated_at
```

### Website_Categories & Website_Subcategories
```sql
✅ Exist in schema
✅ Have proper relationships
✅ Indexed for fast lookup
```

### Verification Codes (Redis)
```redis
✅ Key format: verification:{email}
✅ Value: 6-digit code
✅ TTL: 600 seconds
```

---

## SUCCESS CRITERIA

### MVP (Minimum Viable Product)
- [ ] User can visit /get-started and see working form
- [ ] User can submit three rounds of data
- [ ] User receives verification email
- [ ] User enters code to verify
- [ ] User sees preview of generated website
- [ ] User can upgrade to AI Premium ($5)

### Full Implementation
- [ ] All above + Deep-dive questions
- [ ] Error recovery on all pages
- [ ] localStorage draft saving
- [ ] Analytics on each step
- [ ] Mobile-responsive forms
- [ ] Accessible form inputs

### Performance
- [ ] Form load time < 2s
- [ ] Form submit < 1s
- [ ] Preview load < 3s
- [ ] Email send < 5s

---

## KNOWN ISSUES & SOLUTIONS

| Issue | Current | Solution |
|-------|---------|----------|
| ThreeRoundFlow missing | Infinite spinner | Implement component |
| save-rounds API missing | Form can't save | Implement API |
| No verification page | Silent verification | Add UI page |
| No deep-dive page | Skip to preview | Add optional page |
| Form conflicts | Two different forms | Remove or move template form |
| No error recovery | Silent failures | Add error boundaries |
| No draft saving | Lose data on refresh | Add localStorage |
| No progress tracking | Users don't know progress | Add step indicator |

---

## RECOMMENDED IMPROVEMENTS (AI-First)

### 1. Smart Category Selection (AI-Powered)
Instead of browsing categories, let AI suggest:
```typescript
// After Round 1 answers, call Claude API
const suggestedCategories = await ai.suggestCategories({
  businessName,
  description,
  targetAudience
})
// Show "AI thinks you might be a: [Suggestion]" with radio buttons
```

---

### 2. Dynamic Question Generation
Instead of fixed Round 1/2/3, let Claude suggest follow-up questions:
```typescript
// Based on Round 1 answers, generate custom questions
const followUpQuestions = await ai.generateFollowUpQuestions({
  businessName,
  targetAudience
})
// Show as Round 2 (instead of categories)
```

---

### 3. Preview In-Progress Enhancement
Show AI thinking:
```typescript
// Real-time updates during generation
const stream = await ai.generatePreviewStream({...})
// Show: "Analyzing business..." → "Creating components..." → "Refining design..."
```

---

### 4. Personalized Guidance
Add contextual help based on business type:
```typescript
// If user selected "E-commerce", show tips like:
// "💡 Pro tip: Include product showcase section"
// "💡 Most successful: Customer testimonials at bottom"
```

---

## CONCLUSION

The `/get-started` flow is **architecturally sound** but **incomplete at the UI layer**. All supporting infrastructure exists (verification, AI generation, payments). The blocking issue is the **missing ThreeRoundFlow component and save-rounds API**.

**Time to implement:** 2-3 days for MVP (all 3 core components)
**Time to optimize:** 1-2 weeks for full feature set
**Risk level:** Low (straightforward implementation)

Next steps: Begin with Priority 1 (ThreeRoundFlow component).

