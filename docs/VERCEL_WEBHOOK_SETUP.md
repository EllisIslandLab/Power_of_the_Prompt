# Vercel Webhook Setup

This guide explains how to configure Vercel webhooks to automatically update preview URLs in the portal.

## Overview

When a client pushes code to GitHub:
1. Vercel auto-deploys the site
2. Vercel sends a webhook to Web Launch Academy
3. We store the preview URL in the database
4. The portal shows the live preview in the iframe

## Setup Steps

### 1. Add Webhook Secret to Environment Variables

Add to `.env.local`:
```bash
VERCEL_WEBHOOK_SECRET=your-webhook-secret-here
```

Generate a secure random secret:
```bash
openssl rand -base64 32
```

Add the same variable to Vercel (Project Settings → Environment Variables):
- Name: `VERCEL_WEBHOOK_SECRET`
- Value: (same secret from above)
- Environments: Production, Preview, Development

### 2. Configure Vercel Integration Webhook

**Option A: Via Vercel Dashboard**

1. Go to: https://vercel.com/integrations/[your-integration-id]/configuration
2. Click "Webhooks"
3. Click "Add Webhook"
4. Set:
   - **URL**: `https://weblaunchacademy.com/api/webhooks/vercel`
   - **Events**: Select `deployment.ready`
   - **Secret**: (paste the VERCEL_WEBHOOK_SECRET)
5. Save

**Option B: Via Vercel API** (not yet implemented - manual setup for now)

### 3. Test the Webhook

1. Push a commit to a client's GitHub repo
2. Vercel will deploy automatically
3. Check the webhook endpoint logs:
   ```bash
   vercel logs --follow
   ```
4. Should see: `[Vercel Webhook] ✅ Updated preview URL: https://...`
5. Portal preview should now show the Vercel deployment

## Webhook Payload

Vercel sends this payload for `deployment.ready` events:

```json
{
  "type": "deployment.ready",
  "payload": {
    "deployment": {
      "id": "dpl_xxx",
      "url": "project-git-main-team.vercel.app",
      "state": "READY",
      "target": "production"
    },
    "project": {
      "id": "prj_xxx",
      "name": "project-name"
    }
  }
}
```

## Security

- Webhook signatures are verified using HMAC SHA1
- Invalid signatures are rejected with 401
- In development, signature verification is skipped if no secret is set (logs a warning)
- Production MUST have VERCEL_WEBHOOK_SECRET set

## Database Schema

The webhook updates these columns in `client_projects`:

- `vercel_preview_url` - Latest deployment URL
- `vercel_preview_updated_at` - Timestamp of last update

## Troubleshooting

**Preview not updating:**
1. Check webhook logs in Vercel dashboard
2. Check API logs: `vercel logs --follow`
3. Verify project has `vercel_project_id` set
4. Verify webhook secret matches in both places

**"No matching project found":**
- The webhook looks up projects by `vercel_project_id`
- Make sure the client project has this field populated
- It's set automatically when connecting Vercel in Settings

**Signature verification fails:**
- Check `VERCEL_WEBHOOK_SECRET` is the same in both places
- Make sure it's a valid base64 string
- Try regenerating the secret and updating both places
