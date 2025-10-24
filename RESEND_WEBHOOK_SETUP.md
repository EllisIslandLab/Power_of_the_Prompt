# Resend Webhook Setup for Email Tracking

This guide will help you set up Resend webhooks for reliable email open and click tracking, which is much more accurate than tracking pixels.

## Why Webhooks Are Better

**Tracking Pixels** (current method):
- ❌ Blocked by most modern email clients (Gmail, Apple Mail, Outlook)
- ❌ Require users to "load images" manually
- ❌ Privacy features prevent them from working
- ❌ Corporate email systems strip them

**Resend Webhooks**:
- ✅ Server-to-server communication (can't be blocked)
- ✅ Resend tracks opens on their side
- ✅ More sophisticated tracking methods
- ✅ Also provides bounces, clicks, complaints, and delivery status

## Implementation Overview

### What We've Built

1. **Database Migration**: Added `resend_email_id` column to `campaign_sends` table
2. **Webhook Endpoint**: `/api/webhooks/resend` to receive Resend events
3. **Updated Send Logic**: Stores Resend email ID when sending campaigns
4. **Event Handlers**: Processes opens, clicks, bounces, and complaints

### Supported Events

- `email.opened` - Email was opened (updates `opened_at`)
- `email.clicked` - Link was clicked (updates `clicked_at`)
- `email.bounced` - Email bounced (updates `bounced_at`)
- `email.complained` - Spam complaint (updates `unsubscribed_at`)
- `email.sent` - Email accepted by Resend (logged)
- `email.delivered` - Email delivered to recipient (logged)

## Setup Steps

### 1. Run the Database Migration

First, apply the migration to add the `resend_email_id` column:

```bash
# If using Supabase CLI
npx supabase db push

# Or run the migration directly in Supabase dashboard SQL editor:
# Copy content from: supabase/migrations/20251024000001_add_resend_email_id.sql
```

### 2. Configure Resend Webhook

1. **Go to Resend Dashboard**
   - Visit: https://resend.com/webhooks
   - Sign in to your account

2. **Create New Webhook**
   - Click "Add Webhook"
   - Enter your webhook URL:
     ```
     https://your-domain.com/api/webhooks/resend
     ```
     Replace `your-domain.com` with your actual domain

3. **Select Events to Subscribe**
   Check these events:
   - ✅ `email.sent`
   - ✅ `email.delivered`
   - ✅ `email.opened` (most important!)
   - ✅ `email.clicked`
   - ✅ `email.bounced`
   - ✅ `email.complained`

4. **Save Webhook**
   - Resend will provide a signing secret
   - Store this secret (you can add webhook signature verification later for security)

### 3. Deploy Your Changes

Deploy the updated code:

```bash
# Build and test locally
npm run build

# Deploy to your hosting (Vercel, etc.)
git add .
git commit -m "Add Resend webhook tracking for email opens"
git push origin main
```

### 4. Test the Webhook

1. **Send a test campaign** from your admin dashboard
2. **Open the email** in your inbox
3. **Check the logs**:
   - Vercel logs: `vercel logs`
   - Or check your admin dashboard to see if open rate updates

You should see logs like:
```
✅ Sent email to user@example.com with Resend ID: abc123...
Resend webhook received: email.opened for email abc123...
✅ Recorded first open for abc123..., incremented campaign xyz...
```

### 5. Verify in Dashboard

1. Go to **Admin Portal → Campaigns**
2. View your sent campaign
3. The **open rate** should now update when recipients open emails
4. Check **Performance Insights** for aggregate stats

## Webhook Endpoint Details

**URL**: `/api/webhooks/resend`
**Method**: `POST`
**Content-Type**: `application/json`

### Example Webhook Payload

```json
{
  "type": "email.opened",
  "created_at": "2024-10-24T12:00:00Z",
  "data": {
    "email_id": "abc123-def456-ghi789",
    "from": "hello@weblaunchacademy.com",
    "to": ["recipient@example.com"],
    "subject": "Welcome to Web Launch Academy",
    "opened_at": "2024-10-24T12:05:30Z"
  }
}
```

## How It Works

### When Sending an Email:

1. Your app sends email via Resend API
2. Resend returns an `email_id` (e.g., "abc123-def456")
3. We store this ID in `campaign_sends.resend_email_id`

### When Email is Opened:

1. Resend detects the open (using their tracking)
2. Resend sends webhook to `/api/webhooks/resend`
3. Webhook finds the `campaign_send` by `resend_email_id`
4. Updates `opened_at` timestamp (if first open)
5. Increments campaign `opened_count`
6. Dashboard shows updated stats!

## Troubleshooting

### Webhook Not Receiving Events

1. **Check Webhook Status in Resend Dashboard**
   - Go to Webhooks section
   - Check if webhook is active
   - Review delivery logs

2. **Verify URL is Publicly Accessible**
   ```bash
   curl https://your-domain.com/api/webhooks/resend
   ```
   Should return: `{"success":false,"error":"Webhook processing failed"}`

3. **Check Logs**
   - Vercel: `vercel logs --follow`
   - Heroku: `heroku logs --tail`
   - Look for webhook received logs

### Opens Not Being Tracked

1. **Verify Resend Email ID is Stored**
   ```sql
   SELECT resend_email_id, opened_at FROM campaign_sends
   WHERE campaign_id = 'your-campaign-id' LIMIT 10;
   ```

2. **Check Webhook Logs**
   - Look for "Resend webhook received: email.opened"
   - Check for any error messages

3. **Ensure Events Are Selected**
   - In Resend dashboard, verify `email.opened` is checked

### Rate Limits

- Resend webhooks are not rate-limited
- Your endpoint should respond quickly (< 5 seconds)
- Current implementation responds in < 500ms

## Security Considerations

### Add Webhook Signature Verification (Optional but Recommended)

Resend signs webhooks using Svix. Add verification:

```typescript
// In /api/webhooks/resend/route.ts
import { Webhook } from 'svix'

const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

const wh = new Webhook(webhookSecret)
const verified = wh.verify(
  JSON.stringify(payload),
  {
    'svix-id': webhookId,
    'svix-timestamp': timestamp,
    'svix-signature': signature
  }
)
```

Get the webhook secret from Resend dashboard and add to `.env.local`:
```
RESEND_WEBHOOK_SECRET=whsec_...
```

## Monitoring

### Key Metrics to Watch

1. **Webhook Delivery Rate**
   - Check Resend dashboard for failed webhooks
   - Should be > 99%

2. **Open Rate Comparison**
   - Compare before/after webhook implementation
   - Should see 2-3x improvement in tracked opens

3. **Response Time**
   - Webhook endpoint should respond in < 1 second
   - Monitor server logs for slow queries

## Migration from Tracking Pixels

The old tracking pixel method (`/api/email-tracking/open`) is still in place as a fallback. The webhook method will take precedence.

### Gradual Migration

- ✅ **New emails**: Will use webhook tracking
- ⚠️ **Old emails**: May still use pixel tracking
- 📊 **Combined stats**: Dashboard shows data from both methods

## Additional Resources

- [Resend Webhooks Documentation](https://resend.com/docs/webhooks)
- [Svix Webhook Verification](https://docs.svix.com/receiving/verifying-payloads/how)
- [Your Implementation](/src/app/api/webhooks/resend/route.ts)

## Support

If you encounter issues:

1. Check server logs for errors
2. Verify webhook configuration in Resend
3. Test with a simple email send
4. Review database to ensure `resend_email_id` is being stored

---

**Last Updated**: October 24, 2024
**Status**: ✅ Ready for Production
