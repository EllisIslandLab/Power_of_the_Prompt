# Phase 2A Implementation Plan

## ✅ Foundation Complete (Nov 16, 2025)

### Database & Security
- [x] Created 3 new tables: `ai_interaction_logs`, `email_logs`, `stripe_checkout_sessions`
- [x] Added user-level AI credit tracking to `users` table
- [x] Migrated session-level AI credits to user-level
- [x] Created 8 database functions for credit/referral management
- [x] Set up 3 triggers for automation
- [x] Applied RLS security policies (15 policies across 3 tables)
- [x] Cleaned up obsolete git branches
- [x] Fixed environment variable redundancy

### Current Status
- Database: ✅ Ready
- Security: ✅ Secured
- Functions: ✅ Created
- Next: Build application features

---

## 🎯 Implementation Tasks

### 1. AI Credit System 🤖

**Backend (API Routes):**
- [ ] `POST /api/ai/check-credits` - Check user's available AI credits
- [ ] `POST /api/ai/use-credit` - Deduct credits and log interaction
- [ ] `POST /api/ai/purchase-credits` - Stripe checkout for credit packages
- [ ] `GET /api/ai/interaction-history` - User's AI interaction log

**Frontend (Components):**
- [ ] `<AICreditBadge />` - Display user's credit balance in navbar
- [ ] `<AICreditPurchase />` - Modal/page to buy credits
- [ ] `<AIInteractionLog />` - History of AI interactions
- [ ] `<AIFeedbackButton />` - Rate AI responses (was_helpful)

**Integration Points:**
- [ ] Update demo builder to check/use credits before AI calls
- [ ] Add credit warnings when balance is low
- [ ] Show credit cost before AI actions

---

### 2. Email Logging & Tracking 📧

**Backend (API Routes):**
- [ ] Update `src/lib/email-builder.ts` to log all emails to `email_logs`
- [ ] `POST /api/email-tracking/open` - Track email opens (pixel)
- [ ] `POST /api/email-tracking/click` - Track link clicks
- [ ] `GET /api/admin/email-analytics` - Email delivery stats

**Frontend (Admin Dashboard):**
- [ ] `<EmailLogViewer />` - Admin view of all emails
- [ ] `<EmailAnalytics />` - Open rates, click rates, bounce rates
- [ ] `<UserEmailHistory />` - Per-user email history

**Integration Points:**
- [ ] Update all email sends to create `email_logs` entries
- [ ] Add tracking pixels to email templates
- [ ] Wrap email links with click tracking

---

### 3. Stripe Checkout State Management 💳

**Backend (API Routes):**
- [ ] Update `/api/demo-generator/create-ai-checkout` to save session state
- [ ] `GET /api/stripe/restore-session` - Restore user's place after payment
- [ ] Update Stripe webhook to update `stripe_checkout_sessions` status

**Frontend (Components):**
- [ ] Detect returning users from Stripe
- [ ] Restore demo builder state (scroll position, step, data)
- [ ] Show "Payment successful! Continuing where you left off..." message

**Integration Points:**
- [ ] Save demo builder state before redirecting to Stripe
- [ ] Restore state on return with `session_id` parameter
- [ ] Handle payment cancellation gracefully

---

### 4. Enhanced Referral System 🎁

**Backend (API Routes):**
- [ ] `POST /api/referrals/generate-code` - Generate referral code for user
- [ ] `GET /api/referrals/stats` - User's referral stats (clicks, conversions, earnings)
- [ ] `POST /api/referrals/track-click` - Log referral click
- [ ] Update purchase webhook to credit referrer commission

**Frontend (Components):**
- [ ] `<ReferralDashboard />` - User's referral stats and earnings
- [ ] `<ReferralCodeGenerator />` - Get/display referral code
- [ ] `<ReferralShareButtons />` - Social media share buttons
- [ ] Add referral code input to signup/checkout

**Integration Points:**
- [ ] Track referral codes in URL params
- [ ] Apply commission on purchases
- [ ] Show referral earnings in user portal

---

### 5. Template Auto-Approval System ✅

**Backend (API Routes):**
- [ ] `POST /api/templates/submit` - Enhanced with quality checks
- [ ] `POST /api/templates/auto-review` - Run quality checks
- [ ] `GET /api/admin/pending-approvals` - Templates needing review

**Quality Check Logic:**
- [ ] Check if all required components included
- [ ] Validate HTML structure
- [ ] Check for broken images/links
- [ ] Verify responsive design
- [ ] Score template quality (0-100)

**Frontend (Admin):**
- [ ] `<TemplateReviewQueue />` - Admin approval interface
- [ ] `<QualityCheckResults />` - Display auto-check results
- [ ] Auto-approve if quality score > 85

---

## 🗓️ Suggested Implementation Order

### Week 1: Core AI System
1. AI credit checking API
2. AI credit usage tracking
3. Credit purchase flow
4. Update demo builder to use credits

### Week 2: Email & Analytics
1. Email logging integration
2. Email tracking (opens/clicks)
3. Admin analytics dashboard

### Week 3: Stripe & UX
1. Checkout state saving
2. Return flow restoration
3. Payment success handling

### Week 4: Referrals & Quality
1. Referral code generation
2. Referral tracking
3. Template quality checks
4. Auto-approval logic

---

## 📊 Success Metrics

**AI Credits:**
- [ ] All AI interactions logged
- [ ] Credit balance displayed to users
- [ ] Credit purchases working
- [ ] Low credit warnings shown

**Email Tracking:**
- [ ] All emails logged in `email_logs`
- [ ] Open rates tracked
- [ ] Click rates tracked
- [ ] Admin can view analytics

**Stripe State:**
- [ ] Users return to correct demo step
- [ ] Payment success rate > 95%
- [ ] No lost sessions

**Referrals:**
- [ ] Referral codes generated
- [ ] Clicks tracked
- [ ] Commissions calculated
- [ ] Users can view earnings

**Auto-Approval:**
- [ ] Quality checks run on all submissions
- [ ] High-quality templates auto-approved
- [ ] Admin review queue for borderline cases

---

## 🔧 Environment Variables Needed

```bash
# Already Set
ANTHROPIC_API_KEY=sk-ant-...  ✅
RESEND_API_KEY=re_...  ✅
STRIPE_SECRET_KEY=sk_live_...  ✅
NEXT_PUBLIC_SITE_URL=https://weblaunchacademy.com  ✅

# May Need to Add
STRIPE_PRICE_AI_CREDITS_100=price_... # 100 AI credits
STRIPE_PRICE_AI_CREDITS_500=price_... # 500 AI credits
STRIPE_PRICE_AI_CREDITS_1000=price_... # 1000 AI credits
```

---

## 📝 Notes

- Phase 2A focuses on **foundation features** (payments, AI, emails)
- Phase 2B will add **advanced features** (real-time collaboration, advanced analytics)
- All tables have RLS policies ✅
- All functions have proper error handling ✅
- Migration is safe and reversible ✅

---

**Last Updated:** November 16, 2025
**Status:** Foundation Complete - Ready for Feature Implementation
**Next Step:** Choose which feature to implement first (recommend: AI Credit System)
