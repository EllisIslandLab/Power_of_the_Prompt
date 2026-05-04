# Portal System Deployment Guide

Quick guide for deploying the AI-powered revision portal to production.

## Pre-Deployment Checklist

### 1. Environment Variables (Vercel)
Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qaaautcjhztvjhizklxr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Anthropic
ANTHROPIC_API_KEY=<your-claude-api-key>

# Stripe
STRIPE_SECRET_KEY=<your-stripe-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<will-get-after-webhook-setup>

# Vercel
VERCEL_PROJECT_NAME=weblaunchcoach
VERCEL_TEAM_SLUG=<your-vercel-team-slug>

# App
NEXT_PUBLIC_BASE_URL=https://weblaunchcoach.com
```

### 2. Run Migrations

```bash
# Local first (to test)
npx supabase db push

# Then apply to production Supabase
# (Use Supabase dashboard SQL editor or CLI)
```

### 3. Configure Stripe Webhook

**After first deployment to Vercel:**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://weblaunchcoach.com/api/portal/stripe-webhook`
4. Events to listen for: Select `checkout.session.completed`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
7. Redeploy Vercel (needed for new env var to take effect)

### 4. Test Webhook Locally (Optional)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/portal/stripe-webhook

# In another terminal, trigger test event
stripe trigger checkout.session.completed
```

## Deployment Steps

### 1. Commit Portal Code

```bash
git add -A
git commit -m "feat: Add AI-powered revision portal system

- 7 Supabase tables for client management
- Claude API chat interface with streaming
- Live preview panel with Vercel deployments
- Trial period management (90 days, free bug fixes)
- Token tracking and budget warnings
- Stripe integration for balance management
- Deployment approval workflow
- Admin dashboard for managing clients

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 2. Push to GitHub

```bash
git push origin main
```

### 3. Verify Vercel Deployment

Vercel auto-deploys on push to main. Check:
- Vercel dashboard for deployment status
- Build logs for errors
- Function logs for runtime errors

### 4. Configure Stripe Webhook (if not done)

See "Configure Stripe Webhook" in Pre-Deployment Checklist above.

### 5. Test Production Portal

1. Go to `https://weblaunchcoach.com/portal`
2. Sign in (or create test account)
3. Send a test message: "Change the homepage title"
4. Verify:
   - Chat response streams correctly
   - Token budget bar updates
   - Preview URL appears (may take 1-2 min for Vercel)
5. Check `/portal/billing` - add $1 test payment
6. Verify Stripe webhook received payment (check Supabase `client_accounts` balance)

## Post-Deployment Tasks

### 1. Update Homepage
Remove old textbook references and add portal CTA:

```tsx
// src/app/page.tsx
<section>
  <h2>Website Revision Portal</h2>
  <p>
    Already a client? Access your AI-powered revision workspace to request
    changes, preview updates, and manage deployments.
  </p>
  <Link href="/portal">
    <Button>Access Portal →</Button>
  </Link>
</section>
```

### 2. Remove Old Portal Pages

```bash
# Delete old cohort-based portal files
rm -rf src/app/portal/schedule
rm -rf src/app/portal/textbook
rm -f src/components/portal/ProgressTracker.tsx
rm -f src/components/portal/forms/RevisionStartForm.tsx
rm -f src/components/portal/forms/RevisionModifierForm.tsx
rm -f src/components/portal/forms/VideoConferenceForm.tsx

# Delete old API routes
rm -f src/app/api/portal/form-submissions/route.ts
rm -f src/app/api/portal/form-submissions/[id]/route.ts
rm -f src/app/api/textbook/content/route.ts

# Commit deletions
git add -A
git commit -m "chore: Remove old cohort-based portal files"
git push origin main
```

### 3. Update Navigation

Ensure header/footer links point to new portal:

```tsx
// src/components/navigation/Header.tsx
{isAuthenticated && (
  <Link href="/portal">Portal</Link>
)}
```

### 4. Email Existing Clients

Template:

```
Subject: New AI-Powered Revision Portal 🚀

Hi [Name],

We've just launched a brand new way to request and manage website changes!

Your new AI-powered revision portal includes:
✅ Real-time chat with Claude AI
✅ Live preview of changes before they go live
✅ Transparent token usage and costs
✅ Easy approval workflow
✅ 90-day trial period with free bug fixes

Access your portal: https://weblaunchcoach.com/portal

Your existing credentials will work - just sign in and start chatting!

Questions? Just reply to this email or use the chat in your portal.

Best,
Matthew
```

## Monitoring

### Key Metrics to Watch

```sql
-- Active users in last 7 days
SELECT COUNT(DISTINCT client_account_id)
FROM revision_conversations
WHERE created_at > NOW() - INTERVAL '7 days';

-- Total revenue (available + held)
SELECT SUM(account_balance + held_balance) as total
FROM client_accounts;

-- Pending deployments
SELECT COUNT(*) FROM deployment_history
WHERE deployment_status = 'pending';

-- Pending DB work
SELECT COUNT(*) FROM database_work_requests
WHERE status = 'pending';
```

### Alerts to Set Up

1. **Low Balance Alert** - Notify when client balance < $1
2. **Deployment Stuck** - Notify if deployment pending > 24 hours
3. **Webhook Failure** - Notify if Stripe webhook returns error
4. **High Token Usage** - Notify if single conversation > $5

## Rollback Plan

If critical issues arise:

```bash
# 1. Revert to previous deployment in Vercel dashboard
# (Vercel → Deployments → [previous] → Promote to Production)

# 2. Or revert git commit locally
git revert HEAD
git push origin main

# 3. Database rollback (if needed)
# Run reverse migration in Supabase SQL editor
DROP TABLE IF EXISTS deployment_history CASCADE;
DROP TABLE IF EXISTS deployment_notifications CASCADE;
DROP TABLE IF EXISTS database_work_requests CASCADE;
DROP TABLE IF EXISTS client_preferences CASCADE;
DROP TABLE IF EXISTS revision_chat_messages CASCADE;
DROP TABLE IF EXISTS revision_conversations CASCADE;
DROP TABLE IF EXISTS client_accounts CASCADE;
```

## Common Issues

### Build fails with "Module not found"
- Check all imports use correct paths
- Verify `@/` alias is configured in `tsconfig.json`
- Clear `.next` cache: `rm -rf .next && npm run build`

### Webhook returns 500 error
- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify `SUPABASE_SERVICE_ROLE_KEY` has permissions
- Review Vercel function logs for error details

### Preview deployments not creating
- Verify Vercel project settings allow preview deployments
- Check that branch naming follows Vercel's rules (no special chars)
- Review GitHub → Vercel integration status

### Chat streaming stops mid-response
- Check `ANTHROPIC_API_KEY` has sufficient credits
- Verify Vercel function timeout (default 10s, increase to 60s for Hobby, 300s for Pro)
- Review Anthropic API status page for outages

## Success Criteria

Portal is successfully deployed when:
- ✅ Users can sign in and access `/portal`
- ✅ Chat interface streams Claude responses
- ✅ Token budget bar updates in real-time
- ✅ Stripe checkout flow adds funds to balance
- ✅ Preview deployments create on change request
- ✅ Approve/reject workflow merges or deletes branches
- ✅ Admin dashboard shows all client activity
- ✅ Database work detection flags schema changes
- ✅ Trial period logic waives bug fix costs

Test each of these before announcing to clients!
