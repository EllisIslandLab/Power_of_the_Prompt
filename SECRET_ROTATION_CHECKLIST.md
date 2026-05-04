# Environment Variable Rotation Checklist

**Date Started:** [Fill in when you start]
**Reason:** Vercel security incident precaution

## Pre-Rotation Checklist
- [ x] Backup current `.env.local` file
- [ x] Note current Vercel deployment URL to test after rotation
- [ x] Have access to all service dashboards open
- [ x] Set aside 1-2 hours for full rotation and testing

---

## Rotation Order (Do in this sequence)

### 1. Supabase Keys ⚠️ CRITICAL - DO FIRST
**Why first:** Database access - most critical for site function

#### Steps:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → API
2. Look for the button "Create new API keys in Publishable and secret API keys tab" and click it
   - OR navigate to Settings → API → "Project API keys" section
3. **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY):
   - Look for "service_role" key (marked as "secret")
   - Click the eye icon to reveal or copy icon to copy
   - **Note:** Supabase may not allow rotation of this key. If you don't see a "Reset" or "Regenerate" option, you can:
     - Option A: Keep using the existing key (it's still secure if not already compromised)
     - Option B: Create a new Supabase project and migrate (only if absolutely necessary)
   - [ o] Copy the service_role key
   - [ o] Update in Vercel (Production + Preview)
   - [ o] Update in `.env.local`
4. **Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY):
   - Look for "anon" or "public" key
   - Click the eye icon to reveal or copy icon to copy
   - [ o] Copy the anon key
   - [ o] Update in Vercel (All Environments)
   - [ o] Update in `.env.local`
5. **URL** (NEXT_PUBLIC_SUPABASE_URL):
   - Should NOT change, but verify it's correct: `https://[your-project].supabase.co`
   - [ ] Confirm in Vercel matches dashboard

**Important Note:** Supabase project API keys (service_role and anon) typically cannot be rotated. They are generated when the project is created. Since these keys weren't exposed in Vercel's breach (they're stored as encrypted environment variables), you may not need to rotate them unless you have evidence they were compromised.

**Test immediately after:**
```bash
# Test that you can still authenticate locally
npm run dev
# Try to sign in/sign up
```

---

### 2. Stripe Keys ⚠️ HIGH PRIORITY
**Why second:** Payment processing - revenue critical

#### Steps:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API Keys

2. **Secret Key** (STRIPE_SECRET_KEY):
   - Click "Create secret key" or "Roll" on existing key
   - Copy new secret key (starts with `sk_live_` or `sk_test_`)
   - [ ] Update in Vercel (Production + Preview)
   - [ ] Update in `.env.local`

3. **Publishable Key** (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY):
   - Usually doesn't need rotation, but verify correct key shown
   - [ ] Confirm in Vercel (starts with `pk_live_` or `pk_test_`)

4. **Webhook Secret** (STRIPE_WEBHOOK_SECRET):
   - Go to Developers → Webhooks
   - Find your webhook endpoint (e.g., `https://weblaunchcoach.com/api/webhooks/stripe`)
   - Click "..." → "Update endpoint" or create new one
   - Click "Reveal" next to signing secret
   - Copy webhook signing secret (starts with `whsec_`)
   - [ ] Update in Vercel (All Environments)
   - [ ] Update in `.env.local`

5. **Product/Price IDs** - These don't rotate, but verify they're correct:
   - [ ] `STRIPE_PRODUCT_AI_PREMIUM_ID` (was `STRIPE_PRUCUCT_AI_PREMIUM_ID` - typo)
   - [ ] `STRIPE_PRICE_AI_PREMIUM_ID`
   - [ ] `STRIPE_PRODUCT_ARCHITECTURE_ID` (delete if not needed)
   - [ ] `STRIPE_PRICE_ARCHITECTURE_ID` (delete if not needed)
   - [ ] `STRIPE_PRICE_TEXTBOOK_ID` (delete if not needed)
   - [ ] `STRIPE_PRODUCT_TEXTBOOK_ID` (delete if not needed)
   - [ ] `STRIPE_PRODUCT_ID` (legacy - delete if not needed)
   - [ ] `STRIPE_PRICE_ID` (legacy - delete if not needed)

**Test immediately after:**
```bash
# Test payment flow in test mode
# 1. Try to purchase something
# 2. Use test card: 4242 4242 4242 4242
# 3. Check webhook received in Stripe dashboard
```

---

### 3. Database URL (DATABASE_URL)
**If using Supabase for database:**

1. Go to Supabase Dashboard → Project Settings → Database
2. Find "Connection string" → "URI"
3. Click "Reset database password" if you want to rotate
4. Copy new connection string
5. [ ] Update in Vercel (Production only)
6. [ ] Update in `.env.local` if needed

**Test:**
```bash
# Check database connection
npm run dev
# Navigate to a page that queries the database
```

---

### 4. Resend Email API (RESEND_API_KEY)

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it (e.g., "Vercel Production - May 2026")
4. Set permissions (usually "Sending access")
5. Copy the API key (starts with `re_`)
6. [ ] Update in Vercel (Production + Preview)
7. [ ] Update in `.env.local`
8. [ ] Delete old API key from Resend dashboard

**Test:**
```bash
# Trigger a test email (sign up, password reset, etc.)
# Check Resend logs to confirm delivery
```

---

### 5. Anthropic API (ANTHROPIC_API_KEY)

1. Go to [Anthropic Console](https://console.anthropic.com) → API Keys
2. Click "Create Key"
3. Name it (e.g., "WebLaunchCoach Production")
4. Copy key (starts with `sk-ant-`)
5. [ ] Update in Vercel (Production only)
6. [ ] Update in `.env.local`
7. [ ] Delete old key from Anthropic console

**Test:**
```bash
# Test any AI features on your site
# Check Anthropic usage dashboard
```

---

### 6. ~~Airtable~~ → MIGRATED TO SUPABASE ✅

**Status:** Airtable has been removed and all data migrated to Supabase.

**Actions needed:**
- [ ] Export existing Airtable data (Testimonials & Portfolio) - see `AIRTABLE_MIGRATION_GUIDE.md`
- [ ] Import to Supabase tables (`testimonials` and `portfolio`)
- [ ] Test the migrated data at `/api/testimonials` and `/api/portfolio`
- [ ] Once verified, DELETE these from Vercel:
  - `AIRTABLE_API_KEY`
  - `AIRTABLE_BASE_ID`
- [ ] Delete these from `.env.local`
- [ ] Uninstall Airtable package: `npm uninstall airtable`
- [ ] Delete `/home/ellis/weblaunchcoach/src/lib/airtable.ts`

**Migration Guide:** See `AIRTABLE_MIGRATION_GUIDE.md` for detailed migration steps.

---

### 7. Upstash Redis (UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN)

1. Go to [Upstash Console](https://console.upstash.com) → Your Database
2. Click "Details" tab
3. Scroll to "REST API" section
4. Click "Rotate Token" or copy existing
5. [ ] Copy UPSTASH_REDIS_REST_URL
6. [ ] Copy UPSTASH_REDIS_REST_TOKEN
7. [ ] Update both in Vercel (Production + Preview)
8. [ ] Update both in `.env.local`

**Test:**
```bash
# Test rate limiting or caching features
# Check Upstash dashboard for activity
```

---

### 8. Sentry (NEXT_PUBLIC_SENTRY_DSN & SENTRY_DSN)

1. Go to [Sentry](https://sentry.io) → Settings → Projects → Your Project
2. Go to "Client Keys (DSN)"
3. **To rotate:**
   - Click "Create New Key" OR
   - Use existing DSN (rotating not always necessary)
4. Copy the DSN URL
5. [ ] Update NEXT_PUBLIC_SENTRY_DSN in Vercel (Production + Preview)
6. [ ] Update SENTRY_DSN in Vercel (Production + Preview)
7. [ ] Update both in `.env.local`

**Test:**
```bash
# Trigger a test error
# Check Sentry dashboard for new error report
```

---

### 9. hCaptcha (HCAPTCHA_SECRET_KEY & NEXT_PUBLIC_HCAPTCHA_SITE_KEY)

1. Go to [hCaptcha Dashboard](https://dashboard.hcaptcha.com) → Sites
2. Click on your site
3. **Site Key** (usually doesn't need rotation):
   - [ ] Copy site key
   - [ ] Update NEXT_PUBLIC_HCAPTCHA_SITE_KEY in Vercel (Production)
4. **Secret Key** (to rotate):
   - Go to Settings → Generate new secret
   - [ ] Copy secret key
   - [ ] Update HCAPTCHA_SECRET_KEY in Vercel (Production)
   - [ ] Update in `.env.local`

**Test:**
```bash
# Test form submission with hCaptcha
# Should challenge and verify correctly
```

---

### 10. Jitsi (NEXT_PUBLIC_JITSI_APP_ID)

1. Go to [Jitsi Console](https://jaas.8x8.vc) or your Jitsi admin panel
2. Navigate to App Settings
3. Copy App ID (usually doesn't need rotation)
4. [ ] Verify NEXT_PUBLIC_JITSI_APP_ID in Vercel is correct

**Test:**
```bash
# Test video conferencing feature
# Ensure connections work
```

---

## Post-Rotation Steps

### 1. Update Vercel Environment Variables
- [ ] Go to Vercel → Project → Settings → Environment Variables
- [ ] Delete ALL old variables (use bulk delete if available)
- [ ] Use `VERCEL_ENV_SETUP.md` to paste new values by section
- [ ] Double-check "Sensitive" is marked for appropriate variables
- [ ] Save all changes

### 2. Trigger New Deployment
```bash
git commit --allow-empty -m "Trigger redeploy after env rotation"
git push origin main
```
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors

### 3. Test Production Site
- [ ] Homepage loads
- [ ] User authentication (sign up, sign in, sign out)
- [ ] Database queries work
- [ ] Stripe payment (test mode if available)
- [ ] Email sending (trigger password reset)
- [ ] hCaptcha on forms
- [ ] Video calls (Jitsi)
- [ ] Error tracking (trigger test error, check Sentry)
- [ ] Any AI features (Anthropic)

### 4. Test Preview Deployment
- [ ] Create a test branch
- [ ] Push to trigger preview deployment
- [ ] Test key features on preview URL
- [ ] Verify preview environment variables work

### 5. Update Local Development
- [ ] Pull latest code
- [ ] Update `.env.local` with all new values
- [ ] Run `npm run dev`
- [ ] Test local development works

### 6. Clean Up Old Secrets
**⚠️ Only do this AFTER confirming everything works!**
- [ ] Revoke old Supabase service role key (if you created new one)
- [ ] Delete old Stripe secret key
- [ ] Delete old Resend API key
- [ ] Delete old Anthropic API key
- [ ] ~~Delete old Airtable API key~~ (Airtable migrated to Supabase - delete env vars instead)
- [ ] Rotate/delete old Upstash token

---

## Rollback Plan (If Something Breaks)

If you need to rollback quickly:
1. Go to Vercel → Deployments
2. Find the last working deployment (before rotation)
3. Click "..." → "Promote to Production"
4. This reverts to old code + old environment variables
5. Fix the issue, then redeploy

---

## Security Notes

- **Never commit** actual secret values to git
- **Use Vercel's "Sensitive" toggle** for all secrets (prevents them from showing in logs)
- **Test in Preview** environment first if possible
- **Rotate secrets one service at a time** - easier to debug if something breaks
- **Keep old keys for 24-48 hours** before revoking (in case you need to rollback)

---

## Completion Checklist

- [ ] All secrets rotated
- [ ] Vercel environment variables updated
- [ ] New deployment successful
- [ ] Production site tested and working
- [ ] Preview deployments working
- [ ] Local development working
- [ ] Old secrets revoked from service dashboards
- [ ] Document completion date: __________
