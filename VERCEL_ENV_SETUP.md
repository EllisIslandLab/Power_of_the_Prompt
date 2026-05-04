# Environment Variables for Vercel
# Copy each section and paste into Vercel, then select the appropriate environments

## Instructions
1. Go to Vercel Project Settings → Environment Variables
2. Copy a section below
3. Paste into Vercel's bulk add interface
4. Check the environment boxes as indicated
5. Mark as "Sensitive" as noted below

---

## ALL ENVIRONMENTS (Production + Preview + Development)
# Paste these, then check: Production ✓ Preview ✓ Development ✓

# Stripe webhook (SENSITIVE)
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here

# Supabase public keys (LEAVE PUBLIC - has NEXT_PUBLIC prefix)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

---

## PRODUCTION + PREVIEW ONLY
# Paste these, then check: Production ✓ Preview ✓ Development ✗

# Supabase (SENSITIVE for service role, PUBLIC for URL)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Stripe (SENSITIVE for secret key, PUBLIC for publishable)
STRIPE_SECRET_KEY=your_stripe_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_here

# Stripe Product/Price IDs (SENSITIVE)
STRIPE_PRICE_TEXTBOOK_ID=price_xxx
STRIPE_PRODUCT_TEXTBOOK_ID=prod_xxx
STRIPE_PRICE_AI_PREMIUM_ID=price_xxx
STRIPE_PRODUCT_AI_PREMIUM_ID=prod_xxx
STRIPE_PRODUCT_ARCHITECTURE_ID=prod_xxx
STRIPE_PRICE_ARCHITECTURE_ID=price_xxx

# Sentry (PUBLIC for NEXT_PUBLIC, SENSITIVE for DSN)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_DSN=https://xxx@sentry.io/xxx

# Upstash Redis (SENSITIVE)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Airtable (SENSITIVE)
AIRTABLE_API_KEY=your_airtable_key_here
AIRTABLE_BASE_ID=appXXXXXXXXXX

# Resend Email (SENSITIVE)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Jitsi (PUBLIC - has NEXT_PUBLIC prefix)
NEXT_PUBLIC_JITSI_APP_ID=your_jitsi_app_id

# Site URL (PUBLIC - has NEXT_PUBLIC prefix)
NEXT_PUBLIC_SITE_URL=https://weblaunchcoach.com

---

## PRODUCTION ONLY
# Paste these, then check: Production ✓ Preview ✗ Development ✗

# Database (SENSITIVE)
DATABASE_URL=postgresql://user:password@host:port/database

# hCaptcha (SENSITIVE for secret, PUBLIC for site key)
HCAPTCHA_SECRET_KEY=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=00000000-0000-0000-0000-000000000000

# Anthropic (SENSITIVE)
ANTHROPIC_API_KEY=sk-ant-xxx

# Legacy Stripe IDs - consider removing if not needed (SENSITIVE)
STRIPE_PRODUCT_ID=prod_xxx
STRIPE_PRICE_ID=price_xxx

---

## PREVIEW ONLY
# Paste these, then check: Production ✗ Preview ✓ Development ✗
# (Currently no variables in this category)

---

## DEVELOPMENT (LOCAL) ONLY
# These go in your .env.local file, NOT in Vercel
# (Currently no variables in this category - local dev uses Preview values)

---

## NOTES

### Variables to potentially DELETE:
- `STRIPE_PRODUCT_ID` and `STRIPE_PRICE_ID` - You mentioned you're not teaching web building courses anymore
- `STRIPE_PRODUCT_ARCHITECTURE_ID` and `STRIPE_PRICE_ARCHITECTURE_ID` - if not offering architecture course
- `STRIPE_PRICE_TEXTBOOK_ID` and `STRIPE_PRODUCT_TEXTBOOK_ID` - if textbook is deprecated

### Typo found in your current Vercel settings:
- `STRIPE_PRUCUCT_AI_PREMIUM_ID` should be `STRIPE_PRODUCT_AI_PREMIUM_ID` (fixed above)

### Sensitivity Guide:
**Mark as SENSITIVE in Vercel:**
- All `*_SECRET_KEY`, `*_API_KEY`, `*_SECRET`
- `DATABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- All Stripe keys except `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- All product/price IDs
- Redis credentials
- `SENTRY_DSN` (not the NEXT_PUBLIC one)
- Airtable keys and base IDs

**Leave PUBLIC in Vercel:**
- Anything with `NEXT_PUBLIC_` prefix (these are intentionally exposed to the browser by Next.js)

### After rotating secrets:
1. Update webhook URLs in Stripe dashboard
2. Test authentication flows (Supabase)
3. Verify email sending (Resend)
4. Check error tracking (Sentry)
5. Test hCaptcha on signup/contact forms

---

## Quick Copy/Paste Workflow

1. **All Environments** section → Vercel → Check all 3 boxes
2. **Production + Preview** section → Vercel → Check Production + Preview boxes
3. **Production Only** section → Vercel → Check Production box only
4. For each variable, click the "Sensitive" toggle if noted above
5. Save and deploy
