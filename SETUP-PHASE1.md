# Web Launch Academy - Phase 1 Setup & Testing Guide

This guide will help you set up Stripe products, configure Supabase, and test all Phase 1 features.

---

## 🗄️ Step 1: Supabase Database Setup

### Run the Database Schema

1. Open your Supabase project at https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Run the complete schema from `WLA-Phase-1-Complete-Implementation-Prompt.md` lines 100-477

The schema includes:
- `boilerplate_versions` - Git-based Next.js boilerplate tracking
- `business_categories` - Business type categories
- `components` - Component library
- `component_versions` - Version control for components
- `component_ratings` - User ratings
- `template_submissions` - User-created templates
- `demo_sessions` - Active builder sessions
- `contest_entries` - Contest tracking
- `referrals` - Referral system
- `referral_clicks` - Click tracking
- `referral_payouts` - Payout management
- `user_purchases` - Purchase history

### Enable Row Level Security (RLS)

The schema already includes RLS policies. Verify they were created:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('demo_sessions', 'template_submissions', 'contest_entries');
```

Expected result: All should show `rowsecurity = true`

### Verify Indexes

```sql
-- Check indexes were created
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE '%demo%' OR tablename LIKE '%component%' OR tablename LIKE '%template%';
```

### Create Helper Function for Referral Tracking

```sql
CREATE OR REPLACE FUNCTION increment_referral_clicks(code text)
RETURNS void AS $$
BEGIN
  UPDATE referrals
  SET total_clicks = total_clicks + 1
  WHERE referral_code = code;
END;
$$ LANGUAGE plpgsql;
```

---

## 💳 Step 2: Stripe Product Setup

### Quick Reference: Where to Find Each Field in Stripe

When creating a product in Stripe Dashboard:

1. **Basic Information** - Top section when creating product
   - Name (text field)
   - Description (text area)

2. **Pricing** - Below basic info
   - Price amount ($)
   - Billing period dropdown → Select "One time"

3. **Additional Details** - Click "Show more options" or scroll down
   - Statement descriptor (in "Additional options" section)
   - Unit label (in "Additional options" section)

4. **After Creating Product:**
   - Click on the product name
   - Go to "Prices" tab
   - Click on the price you created
   - Add "Lookup key" in the price details
   - Add "Description" to the price

5. **Metadata** - In product details page
   - Scroll to "Metadata" section
   - Click "Add metadata"
   - Add each key-value pair

6. **Marketing Features** - In product details
   - Scroll to "Marketing features"
   - Click "Add feature"
   - Add each feature from the list

---

### Create Products in Stripe Dashboard

1. Go to https://dashboard.stripe.com/products
2. Click "Add product" for each tier below
3. For each product, configure ALL fields as specified

#### Product 1: AI Premium ($5)

**Basic Information:**
```
Name: AI Premium Builder
Description: 30 AI-powered refinements for precision website building with Claude AI
```

**Pricing:**
```
Price: $5.00 USD
Billing period: One time
```

**Additional Details:**
```
Statement descriptor: WLA AI PREMIUM
Unit label: license
Lookup key: ai_premium_builder
```

**Price Description:**
```
One-time payment for 30 AI-powered website refinements
```

**Metadata** (Add these key-value pairs):
```
tier: ai_premium
rollover_eligible: true
contest_eligible: true
credits: 30
category: enhancement
```

**Marketing Feature List** (Add these features):
```
✓ 30 AI-powered refinements
✓ Natural language descriptions
✓ Clarifying questions for precision
✓ Better source code quality
✓ Contest entry eligibility
✓ Rolls into any package purchase
```

**After Creation:**
- Save the **Product ID** (starts with `prod_`)
- Save the **Price ID** (starts with `price_`)
- Copy the Lookup key for `.env.local`

---

#### Product 2: Textbook + Code ($19)

**Basic Information:**
```
Name: Textbook + Source Code
Description: Complete Web Launch Academy textbook and all companion source code
```

**Pricing:**
```
Price: $19.00 USD
Billing period: One time
```

**Additional Details:**
```
Statement descriptor: WLA TEXTBOOK
Unit label: package
Lookup key: textbook_source_code
```

**Price Description:**
```
One-time payment for textbook and source code bundle
```

**Metadata:**
```
tier: textbook
rollover_eligible: true
contest_eligible: false
includes_textbook: true
includes_code: true
category: educational_materials
```

**Marketing Feature List:**
```
✓ Complete Web Launch Academy textbook
✓ All companion source code
✓ Step-by-step tutorials
✓ Code examples and templates
✓ Lifetime access to materials
✓ Rolls into higher tier purchases
```

**After Creation:**
- Save the **Product ID** and **Price ID**

---

#### Product 3: Basic Tier ($300)

**Basic Information:**
```
Name: Web Launch Academy - Basic Tier
Description: Foundation course with core website building skills and essential tools
```

**Pricing:**
```
Price: $300.00 USD
Billing period: One time
```

**Additional Details:**
```
Statement descriptor: WLA BASIC TIER
Unit label: enrollment
Lookup key: basic_tier_course
```

**Price Description:**
```
One-time payment for Basic tier course enrollment
```

**Metadata:**
```
tier: basic
tier_level: 1
rollover_eligible: true
contest_eligible: false
includes_textbook: true
includes_code: true
includes_support: basic
category: course
```

**Marketing Feature List:**
```
✓ Foundation course curriculum
✓ Core website building skills
✓ Essential development tools
✓ Textbook and source code included
✓ Basic community support
✓ 30-day money-back guarantee
✓ Rolls into Mid and Pro tiers
```

**After Creation:**
- Save the **Product ID** and **Price ID**

---

#### Product 4: Mid Tier ($1,000)

**Basic Information:**
```
Name: Web Launch Academy - Mid Tier
Description: Advanced course with professional development training and enhanced support
```

**Pricing:**
```
Price: $1,000.00 USD
Billing period: One time
```

**Additional Details:**
```
Statement descriptor: WLA MID TIER
Unit label: enrollment
Lookup key: mid_tier_course
```

**Price Description:**
```
One-time payment for Mid tier course enrollment with enhanced features
```

**Metadata:**
```
tier: mid
tier_level: 2
rollover_eligible: true
contest_eligible: false
includes_textbook: true
includes_code: true
includes_support: enhanced
includes_mentorship: group
category: course
```

**Marketing Feature List:**
```
✓ Everything in Basic tier
✓ Advanced development training
✓ Professional portfolio building
✓ Enhanced community support
✓ Group mentorship sessions
✓ Career development resources
✓ Priority support access
✓ Rolls into Pro tier
```

**After Creation:**
- Save the **Product ID** and **Price ID**

---

#### Product 5: Pro Tier ($3,000)

**Basic Information:**
```
Name: Web Launch Academy - Pro Tier
Description: Complete Web Launch Academy program with 1-on-1 mentorship and lifetime access
```

**Pricing:**
```
Price: $3,000.00 USD
Billing period: One time
```

**Additional Details:**
```
Statement descriptor: WLA PRO TIER
Unit label: enrollment
Lookup key: pro_tier_course
```

**Price Description:**
```
One-time payment for Pro tier - complete program with personal mentorship
```

**Metadata:**
```
tier: pro
tier_level: 3
rollover_eligible: false
contest_eligible: false
includes_textbook: true
includes_code: true
includes_support: premium
includes_mentorship: individual
max_total_spend: true
category: course
```

**Marketing Feature List:**
```
✓ Everything in Mid tier
✓ 1-on-1 mentorship sessions
✓ Personalized learning path
✓ Code review and feedback
✓ Portfolio review and guidance
✓ Job search assistance
✓ Lifetime community access
✓ Premium support (24h response)
✓ Maximum $3,000 total spend guarantee
```

**After Creation:**
- Save the **Product ID** and **Price ID**

---

### Important Notes on Stripe Configuration

**Statement Descriptors:**
- These appear on customer credit card statements
- Keep under 22 characters
- Use clear, recognizable text (avoid confusion/chargebacks)

**Lookup Keys:**
- Use these in your code instead of hardcoded Price IDs
- Makes it easier to switch between test/production
- Can update prices without code changes

**Metadata Usage:**
- Query in webhook handlers to determine tier logic
- Track rollover eligibility
- Identify contest-eligible purchases
- Filter products in admin dashboards

### Add Price IDs to Environment Variables

Update your `.env.local` with EITHER Price IDs OR Lookup Keys:

**Option A: Using Price IDs (Traditional)**
```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product Price IDs
STRIPE_PRICE_AI_PREMIUM=price_1ABC123test
STRIPE_PRICE_TEXTBOOK=price_2DEF456test
STRIPE_PRICE_BASIC=price_3GHI789test
STRIPE_PRICE_MID=price_4JKL012test
STRIPE_PRICE_PRO=price_5MNO345test
```

**Option B: Using Lookup Keys (Recommended)**
```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product Lookup Keys (easier to manage across test/prod)
STRIPE_LOOKUP_AI_PREMIUM=ai_premium_builder
STRIPE_LOOKUP_TEXTBOOK=textbook_source_code
STRIPE_LOOKUP_BASIC=basic_tier_course
STRIPE_LOOKUP_MID=mid_tier_course
STRIPE_LOOKUP_PRO=pro_tier_course
```

**Benefits of Lookup Keys:**
- Same keys work in test and production
- No need to update code when switching environments
- More readable and maintainable
- Can update prices without changing code

### Configure Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
5. Copy the **Signing secret** to `STRIPE_WEBHOOK_SECRET`

---

### ✅ Stripe Setup Verification Checklist

Before proceeding, verify you've completed ALL of these:

#### Products Created (5 total):
- [ ] AI Premium ($5) - Product and Price created
- [ ] Textbook + Code ($19) - Product and Price created
- [ ] Basic Tier ($300) - Product and Price created
- [ ] Mid Tier ($1,000) - Product and Price created
- [ ] Pro Tier ($3,000) - Product and Price created

#### For EACH Product, Verify:
- [ ] Statement descriptor is set (shows on credit card statements)
- [ ] Unit label is set (license/package/enrollment)
- [ ] Price has lookup key added
- [ ] Price description is filled in
- [ ] All metadata key-value pairs are added
- [ ] All marketing features are listed

#### Configuration:
- [ ] Webhook endpoint created
- [ ] Webhook events selected (3 events)
- [ ] Webhook signing secret saved to `.env.local`
- [ ] Price IDs or Lookup Keys saved to `.env.local`
- [ ] Test mode is enabled (for development)

#### Quick Test:
```bash
# Verify Stripe CLI is installed (optional but helpful)
stripe --version

# Test webhook locally (in separate terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In Stripe Dashboard, try creating a test payment
# Should see webhook events in CLI output
```

---

## 🔧 Step 3: Environment Variables

### Complete .env.local File

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_AI_PREMIUM=price_...
STRIPE_PRICE_TEXTBOOK=price_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_MID=price_...
STRIPE_PRICE_PRO=price_...

# AI Configuration (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# Admin Email
ADMIN_EMAIL=hello@weblaunchacademy.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🤖 Step 4: AI Integration (Optional for Phase 1)

If you want to enable AI features:

1. Sign up at https://console.anthropic.com
2. Create an API key
3. Add to `.env.local` as `ANTHROPIC_API_KEY`
4. Test with:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## ✅ Step 5: Testing Checklist

### Test 1: Initial Builder Choice

1. Navigate to `/get-started`
2. **✓ Verify:** You see two cards: "Free Template Builder" and "AI Premium Builder"
3. **✓ Verify:** Both cards have clear descriptions
4. **✓ Verify:** AI Premium shows "$5" prominently
5. **✓ Verify:** Contest badge appears on AI Premium card
6. Click "Start Free Build"
7. **✓ Verify:** Redirects to `/get-started/build/[sessionId]`

### Test 2: Multi-Step Form & Auto-Save

1. Start a new free build
2. Fill in Step 1 (Basic Info):
   - Business Name: "Test Business"
   - Email: "test@example.com"
3. **✓ Verify:** See "Saving..." indicator appear
4. **✓ Verify:** See "Last saved X seconds ago"
5. Open browser DevTools → Application → Local Storage
6. **✓ Verify:** See `session-[sessionId]` with your data
7. Close tab (don't click back)
8. Reopen `/get-started/build/[sessionId]`
9. **✓ Verify:** Form data is restored

### Test 3: Progress Indicator

1. Complete Step 1 and click "Next"
2. **✓ Verify:** Progress bar updates to 25% → 50%
3. **✓ Verify:** Step counter shows "2 of 4"
4. Click "Back"
5. **✓ Verify:** Returns to Step 1 with data intact

### Test 4: Back Button & Alert Dialog

1. On Step 1 with data entered, click "Back" button
2. **✓ Verify:** Alert dialog appears
3. **✓ Verify:** Dialog has dark, readable text (not gray-on-gray)
4. **✓ Verify:** Dialog says "Your progress has been saved"
5. **✓ Verify:** Two buttons: "Stay and Continue" and "Leave (Progress Saved)"
6. Click "Stay and Continue"
7. **✓ Verify:** Dialog closes, stays on form

### Test 5: Section Builder (Step 3)

1. Navigate to Step 3
2. **✓ Verify:** See "Add sections to create your website"
3. Click "Add Another Section"
4. **✓ Verify:** New section appears
5. If 5+ sections: **✓ Verify:** Warning about overwhelming visitors
6. Click "Remove" on a section
7. **✓ Verify:** Section is removed

### Test 6: Component Library Display

1. In Step 3, select a section purpose (Content/Tools/Collection/Visual)
2. **✓ Verify:** Component library displays
3. **✓ Verify:** Each component has:
   - Icon
   - Name
   - Description
   - Preview image/placeholder
4. Hover over a component
5. **✓ Verify:** Hover state appears (border change, shadow, etc.)

### Test 7: AI Enhancement Prompts

**For Free Builder:**
1. In Step 3, enter complex requirements
2. **✓ Verify:** See upgrade prompt: "This needs AI Premium"
3. **✓ Verify:** Prompt explains benefits
4. **✓ Verify:** "Upgrade" and "Dismiss" buttons work

**For AI Premium Builder:**
1. Create AI Premium session
2. **✓ Verify:** No "upgrade" prompts
3. **✓ Verify:** AI credits counter shows "30/30 remaining"

### Test 8: Payment Gate (Before Preview)

1. Complete all 4 steps
2. Click "Generate Preview"
3. **For Free with complex features:**
   - **✓ Verify:** Yellow warning appears
   - **✓ Verify:** "We Detected Advanced Features" message
   - **✓ Verify:** Side-by-side comparison (Free vs AI Premium)
   - **✓ Verify:** "Upgrade to AI Premium - $5" button
   - **✓ Verify:** "Use Free Version" button
4. **For Free with simple features:**
   - **✓ Verify:** Blue info box
   - **✓ Verify:** "Your Site Looks Good!" message
   - **✓ Verify:** Softer upsell language
5. **For AI Premium (already paid):**
   - **✓ Verify:** No payment gate, goes straight to preview

### Test 9: Stripe AI Premium Payment

1. Click "Upgrade to AI Premium - $5"
2. **✓ Verify:** Stripe Checkout loads
3. **✓ Verify:** Price shows $5.00
4. Enter test card: `4242 4242 4242 4242`
5. **✓ Verify:** Payment processes
6. **✓ Verify:** Redirects to preview or success page
7. Check Supabase `demo_sessions` table:
   - **✓ Verify:** `ai_premium_paid = true`
   - **✓ Verify:** `ai_credits_total = 30`

### Test 10: Preview Generation

1. After payment (or skipping), wait for preview generation
2. **✓ Verify:** Loading indicator appears
3. **✓ Verify:** Preview modal opens
4. **✓ Verify:** Static HTML preview displays
5. **✓ Verify:** Responsive design (resize browser)
6. **✓ Verify:** Colors match user's selections

### Test 11: Rollover Pricing Display

1. In preview modal, scroll to pricing section
2. **✓ Verify:** All tiers shown: Textbook ($19), Basic ($300), Mid ($1K), Pro ($3K)
3. **If user bought AI Premium ($5):**
   - **✓ Verify:** Textbook shows "$14 more" (rollover)
   - **✓ Verify:** Basic shows "$281 more" (rollover)
   - **✓ Verify:** Visual indicator of savings
4. **If user skipped AI Premium:**
   - **✓ Verify:** All tiers show full price
   - **✓ Verify:** "10% off if you skip ahead" message

### Test 12: Rollover Calculator Accuracy

Test these scenarios:

**Scenario A: Progressive Buyer**
```
1. Buy AI Premium ($5)
   → Total spent: $5
2. Buy Textbook
   → Should charge: $14 (not $19)
   → Total spent: $19
3. Buy Basic
   → Should charge: $281 (not $300)
   → Total spent: $300
4. Buy Pro
   → Should charge: $2,700 (not $3,000)
   → Total spent: $3,000
```

**Scenario B: Skip to Pro**
```
1. Skip everything, buy Pro directly
   → Should charge: $2,700 (10% discount)
   → Total spent: $2,700
   → Savings: $300
```

**Scenario C: AI Premium + Skip to Pro**
```
1. Buy AI Premium ($5)
   → Total spent: $5
2. Skip to Pro
   → Should charge: $2,695 (rollover + skip discount)
   → Total spent: $2,700
```

### Test 13: Code Download

1. Purchase any tier (use Stripe test mode)
2. Click "Download Code"
3. **✓ Verify:** ZIP file downloads
4. Extract ZIP file
5. **✓ Verify:** Contains:
   - `package.json`
   - `app/` directory
   - `components/` directory
   - `lib/siteData.ts` with user's data
   - All user-selected components
6. **✓ Verify:** `package.json` has correct business name
7. **✓ Verify:** README includes setup instructions

### Test 14: Web Launch Academy Badge

1. Open downloaded code
2. Find `app/layout.tsx`
3. **✓ Verify:** Badge component is imported
4. **✓ Verify:** Badge has user's referral code
5. Run the site locally (`npm install && npm run dev`)
6. **✓ Verify:** Badge appears in bottom-right
7. Click badge
8. **✓ Verify:** Opens weblaunchacademy.com with `?ref=CODE`
9. Click "X" to close badge
10. **✓ Verify:** Badge disappears
11. Refresh page
12. **✓ Verify:** Badge stays hidden (localStorage preference)

### Test 15: Referral Code Generation

1. Purchase any tier
2. Check Supabase `referrals` table
3. **✓ Verify:** New row created with:
   - `user_email`
   - `referral_code` (unique)
   - `total_clicks = 0`
   - `total_conversions = 0`
4. Get referral code from badge
5. Visit `weblaunchacademy.com?ref=CODE`
6. Check Supabase `referral_clicks` table
7. **✓ Verify:** New click recorded

### Test 16: Contest Entry Tracking

1. Create AI Premium session
2. Build a template
3. Submit for preview
4. Check Supabase `contest_entries` table
5. **✓ Verify:** Entry recorded with:
   - `user_email`
   - `contest_type = 'grand_prize'`
   - `contest_season = 'Q1-2025'` (or current quarter)
   - `total_entries = 1`
6. Submit another template
7. **✓ Verify:** `total_entries` increments to 2

### Test 17: Admin Review Queue

1. Log in as admin (`hello@weblaunchacademy.com`)
2. Navigate to `/admin/submissions`
3. **✓ Verify:** See pending template submissions
4. **✓ Verify:** Each card shows:
   - User email
   - Template name
   - Preview thumbnail
   - Submission date
   - "Approve" and "Reject" buttons
5. Click "Approve"
6. **✓ Verify:** Status changes to "approved"
7. Check Supabase `template_submissions`
8. **✓ Verify:** `status = 'approved'`

### Test 18: Component Version Control

1. Submit a component (create via API or admin panel)
2. Check Supabase `component_versions` table
3. **✓ Verify:** Row created with:
   - `version_number = 1`
   - `component_code` (TSX)
   - `status = 'pending'`
   - `is_contest_entry = true` (if AI generated)
4. Admin approves component
5. **✓ Verify:** `status = 'approved'`
6. Check `components` table
7. **✓ Verify:** `current_version_id` points to approved version

### Test 19: Mobile Responsiveness

1. Open `/get-started` on mobile (or use DevTools mobile view)
2. **✓ Verify:** Cards stack vertically
3. **✓ Verify:** Text is readable
4. **✓ Verify:** Buttons are tap-friendly (48x48px minimum)
5. Navigate through form steps
6. **✓ Verify:** All steps work on mobile
7. **✓ Verify:** Progress bar is visible
8. **✓ Verify:** Save indicator doesn't overlap content

### Test 20: Error Handling

**Scenario A: Network Error**
1. Open DevTools → Network → Offline
2. Try to save form
3. **✓ Verify:** Error message appears
4. **✓ Verify:** Message says "Please check your connection"
5. Go back online
6. **✓ Verify:** Auto-save resumes

**Scenario B: Invalid Payment**
1. Use test card `4000 0000 0000 0002` (decline)
2. **✓ Verify:** Error message from Stripe
3. **✓ Verify:** User can retry
4. **✓ Verify:** Session data is not lost

**Scenario C: Expired Session**
1. Create session
2. Wait 24 hours (or manually expire in DB)
3. Try to continue
4. **✓ Verify:** Graceful error message
5. **✓ Verify:** "Start over" button works

---

## 🐛 Troubleshooting

### Issue: Stripe checkout not loading

**Solution:**
```bash
# Verify Stripe keys are set
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
echo $STRIPE_SECRET_KEY

# Check they start with pk_test_ and sk_test_
```

### Issue: Supabase RLS blocking inserts

**Solution:**
```sql
-- Temporarily disable RLS for testing
ALTER TABLE demo_sessions DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
```

### Issue: Auto-save not working

**Solution:**
1. Check browser console for errors
2. Verify API route `/api/sessions/[id]/save` exists
3. Test manually:
```bash
curl -X POST http://localhost:3000/api/sessions/test-id/save \
  -H "Content-Type: application/json" \
  -d '{"currentStep": 1, "formData": {"test": "data"}}'
```

### Issue: Preview not generating

**Solution:**
1. Check if AI API key is set (if using AI features)
2. Verify boilerplate repo is accessible
3. Check `/tmp` directory permissions
4. Review API logs: `/api/demo-generator/generate`

---

## 📊 Success Metrics

After completing all tests, verify:

- [ ] ✅ Users can choose Free or AI Premium builder
- [ ] ✅ Multi-step form saves progress automatically
- [ ] ✅ Component library displays with previews
- [ ] ✅ Payment gate shows appropriate messaging
- [ ] ✅ AI Premium payment processes correctly
- [ ] ✅ Preview generates and displays properly
- [ ] ✅ Rollover pricing calculates accurately
- [ ] ✅ Code downloads as assembled ZIP
- [ ] ✅ Badge appears on all sites with referral tracking
- [ ] ✅ Contest entries count correctly
- [ ] ✅ Admin can review and approve submissions
- [ ] ✅ Component versions store properly

---

## 🚀 Production Checklist

Before deploying to production:

1. **Environment Variables:**
   - [ ] Switch to production Stripe keys (`pk_live_` and `sk_live_`)
   - [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
   - [ ] Verify all Supabase keys are for production project

2. **Stripe:**
   - [ ] Create products in production Stripe account
   - [ ] Update webhook URL to production domain
   - [ ] Test one real transaction with real card

3. **Supabase:**
   - [ ] Run schema on production database
   - [ ] Verify RLS policies are enabled
   - [ ] Seed initial data (business categories, boilerplate version)

4. **Security:**
   - [ ] Enable HTTPS on all domains
   - [ ] Verify CORS settings
   - [ ] Check CSP headers
   - [ ] Review RLS policies thoroughly

5. **Performance:**
   - [ ] Enable Vercel Analytics
   - [ ] Set up error tracking (Sentry)
   - [ ] Configure caching headers
   - [ ] Optimize images (WebP format)

---

## 📝 Notes

- **Test Mode:** All Stripe transactions in test mode are free
- **Database:** Use a separate Supabase project for testing
- **Local Development:** Use `http://localhost:3000` for `NEXT_PUBLIC_APP_URL`
- **Admin Access:** Only `hello@weblaunchacademy.com` has admin privileges

---

## 🎓 Next Steps

Once Phase 1 is tested and working:

1. Collect user feedback
2. Monitor contest entries
3. Track conversion rates (Free → AI Premium)
4. Analyze referral click-through rates
5. Plan Phase 2 features based on data

---

Need help? Contact the development team or refer to the Phase 1 implementation prompt.
