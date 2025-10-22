# Email Tracking Setup

## Overview
Email tracking has been implemented to track when recipients open emails and click on links within campaigns.

## What Was Added

### 1. Open Tracking Endpoint
- **Location**: `/src/app/api/email-tracking/open/route.ts`
- **How it works**: A 1x1 transparent pixel is embedded in each email
- **Updates**: 
  - `campaign_sends.opened_at` timestamp
  - `campaigns.opened_count` counter (incremented once per unique open)
  - `leads.last_engagement` timestamp

### 2. Click Tracking Endpoint (NEW)
- **Location**: `/src/app/api/email-tracking/click/route.ts`
- **How it works**: All links in emails are wrapped with a tracking URL that redirects to the actual destination
- **Updates**:
  - `campaign_sends.clicked_at` timestamp
  - `campaigns.clicked_count` counter (incremented once per unique click)
  - `leads.last_engagement` timestamp

### 3. Database Functions (NEW)
- **Location**: `/supabase/migrations/20251022000001_add_email_tracking_functions.sql`
- **Functions**:
  - `increment_campaign_opens(campaign_id UUID)` - Increments opened_count
  - `increment_campaign_clicks(campaign_id UUID)` - Increments clicked_count

### 4. Updated Email Processing
- **Location**: `/src/app/api/admin/campaigns/send/route.ts`
- **Changes**:
  - All `<a href="...">` tags are automatically wrapped with click tracking
  - Unsubscribe links are excluded from click tracking
  - Tracking pixel is added to every email

## Setup Instructions

### Step 1: Run the Database Migration

You need to run the new migration to create the tracking functions:

```bash
# Option 1: Using Supabase CLI (recommended)
npx supabase db push

# Option 2: Run the SQL manually in Supabase dashboard
# Go to SQL Editor and run the contents of:
# /supabase/migrations/20251022000001_add_email_tracking_functions.sql
```

### Step 2: Test Email Tracking

1. Create a test campaign with HTML content containing links
2. Send a test email to yourself
3. Open the email (this should increment `opened_count`)
4. Click on a link in the email (this should increment `clicked_count`)
5. Refresh the admin dashboard to see updated stats

## How It Works

### Open Tracking
When an email is sent, a tracking pixel is added:
```html
<img src="https://yourdomain.com/api/email-tracking/open?c=CAMPAIGN_ID&e=recipient@email.com" 
     width="1" height="1" style="display:none;" alt="" />
```

When the email is opened and images load:
1. The pixel URL is requested
2. API endpoint updates `campaign_sends.opened_at` if not already set
3. If this is the first open, `campaigns.opened_count` is incremented
4. API returns a 1x1 transparent PNG image

### Click Tracking
When an email contains a link like:
```html
<a href="https://example.com/pricing">View Pricing</a>
```

It's automatically transformed to:
```html
<a href="https://yourdomain.com/api/email-tracking/click?c=CAMPAIGN_ID&e=recipient@email.com&url=https%3A%2F%2Fexample.com%2Fpricing">View Pricing</a>
```

When the link is clicked:
1. The tracking URL is requested
2. API endpoint updates `campaign_sends.clicked_at` if not already set
3. If this is the first click, `campaigns.clicked_count` is incremented
4. API redirects to the original URL

## Important Notes

1. **First-time only**: Both open and click counters only increment once per recipient per campaign
2. **Unsubscribe links**: These are NOT tracked to respect user privacy
3. **Email clients**: Some email clients block images by default, which can affect open tracking accuracy
4. **Privacy**: Open tracking requires image loading, which some privacy-focused email clients may block

## Troubleshooting

### Opens/Clicks Not Tracking

1. **Check migration**: Ensure the database functions exist
   ```sql
   SELECT * FROM pg_proc WHERE proname IN ('increment_campaign_opens', 'increment_campaign_clicks');
   ```

2. **Check campaign_sends table**: Look for rows with your email
   ```sql
   SELECT * FROM campaign_sends WHERE recipient_email = 'your@email.com';
   ```

3. **Check server logs**: Look for errors in the tracking endpoints
   ```bash
   # Check Next.js console output
   ```

4. **Environment variable**: Ensure `NEXT_PUBLIC_SITE_URL` is set correctly
   ```bash
   echo $NEXT_PUBLIC_SITE_URL
   ```

### Open Tracking Not Working

- Some email clients block external images by default
- Gmail may cache images, making repeated opens not trigger new requests
- Privacy-focused clients (Apple Mail with privacy protection) may pre-fetch images

### Click Tracking Not Working

- Check that links in your email template use proper HTML `<a>` tags
- Ensure the original URL is valid and accessible
- Check browser console for redirect errors

## Metrics Accuracy

- **Open Rate**: May be lower than actual (image blocking) or higher (pre-fetching)
- **Click Rate**: Generally more accurate than open rate
- **Best practice**: Use trends over time rather than absolute numbers

## Next Steps

After setup, you can view tracking metrics in:
- Admin Dashboard: Aggregate campaign stats
- Campaign Details: Individual recipient tracking
- Reports: Open/click rates over time (future feature)
