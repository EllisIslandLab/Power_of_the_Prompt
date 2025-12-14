# Web Launch Academy Affiliate Compensation System

## Overview

The WLA Affiliate Compensation System tracks when potential clients click on affiliate badges and automatically calculates compensation when they make a purchase. The system supports a 30-day holding period before payouts are eligible.

## How It Works

### 1. Badge Click Tracking

When an affiliate places a WLA badge on their website with their referrer ID, clicks are automatically tracked:

- **When a user clicks the badge**: A record is created in `affiliate_badge_clicks` table
- **Tracked data includes**:
  - Referrer ID and email
  - Source domain and URL
  - User agent and IP address
  - Timestamp
  - Session ID for later matching

### 2. Purchase Conversion

When a user who clicked an affiliate badge makes a purchase:

1. The Stripe webhook receives `checkout.session.completed`
2. **CheckoutCompletedHandler** processes the payment
3. System looks up recent badge clicks for the customer's email
4. If found, it calculates compensation using **hardcoded tiered rates**:
   - Purchase amount
   - Tiered commission structure (25% → 10% → 5%)
   - $250 maximum per referral

### 3. Compensation Calculation

Affiliates earn **tiered commissions** based on purchase amount:

| Purchase Range | Rate | Max from this tier |
|---|---|---|
| $0 - $200 | 25% | $50 |
| $200 - $1,200 | 10% | $100 |
| $1,200 - $3,200 | 5% | $100 |
| **Total Cap** | - | **$250** |

**Calculation Examples**:

*Example 1 - Purchase: $150*
- Tier 1: $150 × 25% = $37.50
- Total commission: $37.50

*Example 2 - Purchase: $600*
- Tier 1: $200 × 25% = $50.00
- Tier 2: ($600 - $200) × 10% = $40.00
- Total commission: $90.00

*Example 3 - Purchase: $3,500*
- Tier 1: $200 × 25% = $50.00
- Tier 2: $1,000 × 10% = $100.00
- Tier 3: ($3,500 - $1,200) × 5% = $115.00
- Total: $265.00, but capped at $250

### 4. Holding Period

Earned compensation is held for **30 days** from the purchase date to prevent chargebacks and fraud.

**Status flow**:
- `earned` → `held` (30 days) → `processed` (after payout)

## Database Schema

### affiliate_badge_clicks

Tracks individual badge click events:

```sql
CREATE TABLE affiliate_badge_clicks (
  id uuid PRIMARY KEY,
  referrer_id uuid,
  referrer_email text,
  clicked_at timestamp,
  source_domain text,
  source_url text,
  user_agent text,
  ip_address text,
  session_id text,
  converted boolean,           -- TRUE after purchase
  referee_email text,
  referee_id uuid,
  created_at timestamp,
  updated_at timestamp
);
```

### affiliate_compensations

Tracks earned and paid commissions:

```sql
CREATE TABLE affiliate_compensations (
  id uuid PRIMARY KEY,
  referrer_id uuid,
  referrer_email text,
  badge_click_id uuid,         -- Links to badge_click
  purchase_id text,            -- Stripe session ID
  purchase_amount numeric,
  commission_percentage numeric,
  commission_amount numeric,
  status text,                 -- 'earned', 'held', 'processed'
  held_until timestamp,        -- 30 days from purchase
  paid_at timestamp,
  payout_method text,
  payout_email text,
  notes text,
  created_at timestamp,
  updated_at timestamp
);
```

## API Endpoints

### POST /api/affiliate/badge-click

Track a badge click event.

**Request:**
```json
{
  "referrerId": "user-uuid",
  "referrerEmail": "affiliate@example.com",
  "sourceDomain": "mysite.com",
  "sourceUrl": "https://mysite.com"
}
```

**Response:**
```json
{
  "success": true,
  "badgeClickId": "click-uuid",
  "clickedAt": "2024-12-12T..."
}
```

### GET /api/affiliate/badge-click?referrerId={id}&status={status}

Retrieve badge click stats for an affiliate.

**Query Parameters:**
- `referrerId` (required): Affiliate's user UUID
- `status` (optional): `converted` or `pending`

**Response:**
```json
{
  "success": true,
  "totalClicks": 25,
  "convertedClicks": 3,
  "conversionRate": "12.00",
  "clicks": [...]
}
```

### POST /api/affiliate/compensation

Create a compensation record (called internally by checkout handler).

**Request:**
```json
{
  "referrerId": "user-uuid",
  "referrerEmail": "affiliate@example.com",
  "badgeClickId": "click-uuid",
  "purchaseId": "stripe-session-id",
  "purchaseAmount": 299.99,
  "commissionPercentage": 10,
  "commissionAmount": 30.00
}
```

**Response:**
```json
{
  "success": true,
  "compensationId": "comp-uuid",
  "commissionAmount": 30.00,
  "status": "earned",
  "heldUntil": "2025-01-11T..."
}
```

### GET /api/affiliate/compensation?referrerId={id}&status={status}

Retrieve compensation records for an affiliate.

**Query Parameters:**
- `referrerId` (required): Affiliate's user UUID
- `status` (optional): `earned`, `held`, or `processed`

**Response:**
```json
{
  "success": true,
  "totalEarned": "150.00",
  "totalProcessed": "50.00",
  "readyForPayout": "0.00",
  "compensations": [...]
}
```

## Using the WLABadge Component

### Basic Usage (No Tracking)

```tsx
import { WLABadge } from '@/components/ui/WLABadge'

export default function Footer() {
  return <WLABadge />
}
```

### With Affiliate Tracking

```tsx
import { WLABadge } from '@/components/ui/WLABadge'
import { useUser } from '@/hooks/useUser'

export default function AffiliateFooter() {
  const { user } = useUser()

  return (
    <WLABadge
      referrerId={user?.id}
      referrerEmail={user?.email}
    />
  )
}
```

### HTML/Plain JavaScript Badge

For affiliates embedding the badge in plain HTML:

```html
<!-- Option 1: Simple redirect with ref parameter -->
<a href="https://weblaunchacademy.com?ref=AFFILIATE_ID"
   target="_blank" rel="noopener noreferrer">
  <img src="https://weblaunchacademy.com/wla-badge.svg"
       alt="Built with Web Launch Academy"
       width="200" height="40" />
</a>

<!-- Option 2: With tracking script -->
<a href="https://weblaunchacademy.com?ref=AFFILIATE_ID"
   target="_blank" rel="noopener noreferrer"
   onclick="trackAffiliateClick('AFFILIATE_ID', 'affiliate@example.com')">
  <img src="https://weblaunchacademy.com/wla-badge.svg"
       alt="Built with Web Launch Academy"
       width="200" height="40" />
</a>

<script>
async function trackAffiliateClick(referrerId, referrerEmail) {
  try {
    await fetch('https://weblaunchacademy.com/api/affiliate/badge-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrerId,
        referrerEmail,
        sourceDomain: window.location.hostname,
        sourceUrl: window.location.href
      })
    });
  } catch (err) {
    console.error('Failed to track affiliate click:', err);
  }
}
</script>
```

## Client-Side Affiliate Utilities

The `src/lib/affiliate.ts` module provides utilities for affiliate tracking:

```tsx
import {
  generateBadgeClickUrl,      // Generate tracking URL with ref param
  trackBadgeClick,            // Track a badge click
  getBadgeClickId,            // Get stored click ID from session
  clearBadgeClickData,        // Clear session data after purchase
  getAffiliateRefFromUrl,     // Extract ref parameter from URL
} from '@/lib/affiliate'

// Generate a tracking URL
const url = generateBadgeClickUrl('affiliate-uuid', 'mysite.com')
// Returns: "https://weblaunchacademy.com?ref=affiliate-uuid&src=mysite.com"

// Track a click programmatically
const result = await trackBadgeClick('affiliate-uuid', 'affiliate@example.com')

// Check if user came through affiliate link
const { referrerId, sourceDomain } = getAffiliateRefFromUrl()
if (referrerId) {
  console.log(`User came from affiliate: ${referrerId}`)
}
```

## Database Functions

### calculate_affiliate_commission()

Calculates commission amount using hardcoded tiered rates:

```sql
SELECT * FROM calculate_affiliate_commission(
  p_purchase_amount := 600.00,
  p_referrer_id := 'user-uuid'
);

-- Returns:
-- commission_percentage: 15.00 (weighted average)
-- commission_amount: 90.00
-- (Tier 1: $50 + Tier 2: $40)
```

**Hardcoded Tier Structure**:
- Tier 1: 25% on first $200 (max $50)
- Tier 2: 10% on next $1,000 (max $100)
- Tier 3: 5% on next $2,000 (max $100)
- Overall cap: $250 per referral

### mark_badge_click_converted()

Marks a badge click as converted when purchase is made:

```sql
SELECT mark_badge_click_converted(
  p_badge_click_id := 'click-uuid',
  p_referee_email := 'customer@example.com',
  p_referee_id := 'new-user-uuid'
);
```

## Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 1. Affiliate Places Badge on Website                    │
│    (with referrer_id and referrer_email)                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. User Clicks Badge                                    │
│    POST /api/affiliate/badge-click                      │
│    → Creates affiliate_badge_clicks record              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. User Makes Purchase                                  │
│    (Email used at checkout)                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Stripe Webhook: checkout.session.completed          │
│    CheckoutCompletedHandler processes payment          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. System Matches Badge Click to Purchase               │
│    (Using referee email)                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Calculate Commission                                 │
│    purchase_amount × tier_percentage = commission       │
│    Cap at $250 per referral                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Create Compensation Record                           │
│    Status: 'earned'                                     │
│    Held until: 30 days from purchase                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 8. After 30 Days: Ready for Payout                      │
│    Status: 'held' → 'processed' (after manual payout)   │
└─────────────────────────────────────────────────────────┘
```

## Environment Variables

Required in `.env.local`:

```
SUPABASE_ACCESS_TOKEN=sbp_ff27fb6da431177563261fdc829352b596e450cc
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing the System

### 1. Create a Test Badge Click

```bash
curl -X POST https://localhost:3000/api/affiliate/badge-click \
  -H "Content-Type: application/json" \
  -d '{
    "referrerId": "test-affiliate-uuid",
    "referrerEmail": "affiliate@test.com",
    "sourceDomain": "test.com",
    "sourceUrl": "https://test.com"
  }'
```

### 2. Check Badge Click Stats

```bash
curl https://localhost:3000/api/affiliate/badge-click?referrerId=test-affiliate-uuid
```

### 3. Check Compensation Records

```bash
curl https://localhost:3000/api/affiliate/compensation?referrerId=test-affiliate-uuid
```

## Manual Compensation Creation

For testing or manual payouts, create a compensation record:

```sql
INSERT INTO affiliate_compensations (
  referrer_id,
  referrer_email,
  purchase_id,
  purchase_amount,
  commission_percentage,
  commission_amount,
  status,
  held_until
) VALUES (
  'affiliate-uuid',
  'affiliate@example.com',
  'stripe-session-id',
  299.99,
  10,
  30.00,
  'earned',
  NOW() + interval '30 days'
);
```

## Security Considerations

1. **RLS Policies**: Users can only view their own compensation records
2. **Service Role**: Badge click creation and compensation updates use service role
3. **Hold Period**: 30-day hold prevents chargeback fraud
4. **Email Matching**: Compensation is tied to actual purchase email
5. **Tier Validation**: Commission percentage is validated against user's tier

## Troubleshooting

### Badge Clicks Not Being Created

1. Check that the referrer ID and email are being passed correctly
2. Verify `/api/affiliate/badge-click` endpoint is accessible
3. Check browser console for network errors
4. Check server logs for API errors

### Compensation Not Creating

1. Ensure the customer's email matches between badge click and purchase
2. Check that `affiliate_tiers` table has valid tier configuration
3. Verify Stripe webhook is being received (`check checkout logs)
4. Check that user ID exists in `users` table

### Commission Amount Incorrect

1. Verify referrer's affiliate tier is set correctly
2. Check `calculate_affiliate_commission` function logic
3. Ensure $250 cap is being applied
4. Check for any tier-specific max amounts

## Future Enhancements

1. **Affiliate Dashboard**: Self-service portal for viewing stats and payouts
2. **Automated Payouts**: Direct integration with Stripe/PayPal for auto-payouts
3. **Email Notifications**: Notify affiliates when they earn commissions
4. **Real-time Analytics**: Live conversion tracking
5. **Multi-tier Rewards**: Bonus commissions for high performers
6. **Coupon Codes**: Alternative tracking via unique coupon codes

## Support

For issues or questions about the affiliate system, check:

- `/api/affiliate/*` endpoints for real-time data
- `affiliate_badge_clicks` and `affiliate_compensations` tables in Supabase
- Application logs for webhook processing errors
- Browser console for client-side tracking issues
