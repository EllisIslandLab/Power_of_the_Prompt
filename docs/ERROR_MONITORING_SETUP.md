# Error Monitoring Setup Guide

## 🚨 CRITICAL: Why You Need This

**Silent errors = Lost revenue.** The waitlist signup form was broken for an unknown period, potentially costing dozens of leads. This setup ensures you're notified immediately when critical paths fail.

---

## ✅ Already Active: Immediate Email Alerts

**Status: WORKING NOW** ✅

Critical errors in these paths now send instant emails to `hello@weblaunchacademy.com`:

- **Waitlist Signup** - Database errors, insert failures
- **Stripe Checkout** - Payment session creation failures
- **Future: Any critical path** (see "Adding Alerts" section below)

**What the emails look like:**
- 🚨 **Subject:** "CRITICAL: Waitlist Signup - Database Insert Failed"
- **Contains:** Error message, stack trace, timestamp, affected user
- **Sent via:** Your existing Resend setup (no extra cost)

**Test it:** The next time a critical error occurs in production, you'll get an email within seconds.

---

## 🔧 Recommended: Full Sentry Setup

Sentry provides comprehensive error tracking with features our simple email alerts don't have:

- **All errors tracked** (not just ones we manually added)
- **Session replay** - see exactly what the user did before the error
- **Performance monitoring** - slow endpoints, memory leaks
- **Release tracking** - which deployment introduced the bug
- **Error grouping** - see patterns across multiple users
- **Slack/Discord integrations**

### Setup Steps (15 minutes):

#### 1. Create Sentry Account

```bash
# Go to https://sentry.io
# Sign up (free tier: 5,000 errors/month)
# Create a new project → Select "Next.js"
```

#### 2. Get Your DSN

After creating the project, copy your DSN (looks like: `https://abc123@o123.ingest.sentry.io/456`)

#### 3. Add to Environment Variables

```bash
# Add to .env.local (NOT .env - keep it secret!)
NEXT_PUBLIC_SENTRY_DSN="https://abc123@o123.ingest.sentry.io/456"
SENTRY_DSN="https://abc123@o123.ingest.sentry.io/456"
```

#### 4. Activate Sentry Code

Uncomment the `Sentry.init()` calls in these files:

- `/sentry.client.config.ts` - Lines 8-52
- `/sentry.server.config.ts` - Lines 8-30
- `/sentry.edge.config.ts` - Lines 8-16

#### 5. Configure Email Alerts in Sentry Dashboard

1. Go to **Alerts** → **Create Alert Rule**
2. Choose **Issues**
3. Set conditions:
   - "When an issue is first seen"
   - "When an issue changes state from resolved to unresolved"
4. Add action: **Send a notification via email**
5. Email: `hello@weblaunchacademy.com`

#### 6. Deploy & Test

```bash
npm run build
git add .
git commit -m "Enable Sentry error tracking"
git push
```

**Test it:** Trigger a test error in production and verify you get:
- Email from Sentry
- Email from our immediate alert system (for critical paths)

---

## 📝 Adding Alerts to New Critical Paths

When adding new revenue-critical features (payments, signups, etc.), add immediate alerts:

```typescript
import { alertCriticalError, alertHighPriorityError } from '@/lib/error-alerts'

// In your API route
try {
  // Critical operation
  await processPayment()
} catch (error) {
  // Send immediate email alert
  await alertCriticalError(
    error,
    'Payment Processing Failed', // Short description
    { userId, amount, paymentId } // Additional context
  )

  // Still throw the error so it's also caught by Sentry
  throw error
}
```

**Severity Levels:**

- **critical**: Revenue loss, broken core functionality (gets email)
- **high**: Important but not revenue-blocking (gets email)
- **medium**: Worth logging, not urgent (no email)
- **low**: Informational (no email)

---

## 🎯 What to Monitor

### Critical (Immediate Email + Sentry):
- ✅ Waitlist signups
- ✅ Stripe checkout creation
- ⚠️ Add next: Stripe webhook processing
- ⚠️ Add next: Student onboarding flow
- ⚠️ Add next: Course enrollment

### High Priority (Sentry only):
- Email delivery failures
- File upload errors
- Database connection issues

### Medium Priority (Sentry only):
- Rate limit exceeded
- API timeouts
- Invalid form submissions

---

## 🧪 Testing Error Monitoring

### Test Email Alerts (Development):

Our email alerts are disabled in development to avoid noise. To test them:

1. Temporarily change this line in `/src/lib/error-alerts.ts`:
```typescript
// From:
if (process.env.NODE_ENV !== 'production') {

// To:
if (false) { // Force enable for testing
```

2. Trigger an error in a critical path
3. Check your email at hello@weblaunchacademy.com
4. **Don't forget to change it back!**

### Test Sentry (Production):

Create a test error button on an admin page:

```typescript
<Button onClick={() => {
  throw new Error('Test Sentry error')
}}>
  Test Error Tracking
</Button>
```

---

## 📊 Monitoring Dashboard

### Check Your Alerts Are Working:

**Vercel Logs:**
- Go to: https://vercel.com/your-project/logs
- Filter: "error"
- Should see structured logs from our logger

**Sentry Dashboard:**
- Go to: https://sentry.io
- Check "Issues" - should see captured errors
- Check "Performance" - see slow endpoints

**Email:**
- Search inbox for: `from:alerts@weblaunchacademy.com`
- Should see critical alerts

---

## 💰 Cost Breakdown

| Service | Free Tier | Paid Plan | Recommended |
|---------|-----------|-----------|-------------|
| **Email Alerts** (Resend) | Included | $0 | ✅ Active |
| **Sentry** | 5k errors/month | $26/month | Start free |
| **Vercel Logs** | 14 days retention | $20/month | Use free |

**Total monthly cost to start:** $0

---

## 🚨 Current Status

✅ **Email alerts active** for:
- Waitlist signup failures
- Stripe checkout failures

⏳ **Sentry ready** but needs:
- DSN from sentry.io account
- Uncomment initialization code
- Configure email alerts in dashboard

🔜 **TODO:**
- Add alerts to webhook handler
- Add alerts to student onboarding
- Set up Slack notifications (optional)

---

## ❓ FAQs

**Q: Will this send too many emails?**
A: No. Only **critical** and **high** severity errors send emails, and only in production.

**Q: What if email delivery fails?**
A: Errors are still logged to Vercel logs and caught by Sentry. Check dashboard if you suspect issues.

**Q: Can I change the alert email?**
A: Yes, edit `/src/lib/error-alerts.ts` line 61

**Q: Will this slow down my app?**
A: No. Email alerts are async and don't block user requests. Failed email sends are silently logged.

**Q: I got an alert email, now what?**
A:
1. Check Vercel logs for full context
2. Check Sentry for related errors
3. Test the affected functionality
4. Deploy hotfix if critical
5. Add monitoring to prevent recurrence

---

## 📚 Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Resend Email Docs](https://resend.com/docs)
- [Vercel Logs](https://vercel.com/docs/observability/logs-overview)
- [Error Handling Best Practices](https://www.patterns.dev/posts/error-handling)
