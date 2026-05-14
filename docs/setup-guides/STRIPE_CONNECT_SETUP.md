
# Stripe Connect Setup (Express Accounts)

## Why Stripe Connect?

**Instead of collecting API keys:**
- ✅ Users authorize without sharing secret keys
- ✅ You make API calls on their behalf
- ✅ More secure and professional
- ✅ Automatic token refresh
- ✅ Users can revoke access anytime

## Creating a Stripe Connect Platform

### Step 1: Enable Connect

1. Go to: **https://dashboard.stripe.com/settings/connect**
2. Click **Get Started with Connect**
3. Choose: **Standard** (recommended for most use cases)

### Step 2: Platform Settings

**Platform Name:** `Web Launch Academy`

**Account Type Options:**
- ✅ **Express** accounts (recommended - Stripe handles onboarding)
- ⚪ Standard accounts (full custom branding)
- ⚪ Custom accounts (you handle payouts)

**Platform Fees (optional):**
- For now: No fees
- Later: Can charge application fee on transactions

### Step 3: OAuth Settings

**Redirect URIs:**
- Development: `http://localhost:3000/api/integrations/stripe/callback`
- Production: `https://weblaunchacademy.com/api/integrations/stripe/callback`

**Scopes to request:**
- ✅ `read_write` (full access to connected account)

### Step 4: Get Credentials

From **Developers → API Keys**:

```bash
# Stripe Connect
STRIPE_CLIENT_ID=ca_XXXXXXXX  # From Connect settings
STRIPE_SECRET_KEY=sk_test_XXX # Your platform secret key
STRIPE_CONNECT_REDIRECT_URI=https://weblaunchacademy.com/api/integrations/stripe/callback
```

## OAuth Flow

### User Journey

1. **User clicks "Connect Stripe"**
2. **Redirect to Stripe OAuth:**
   ```
   https://connect.stripe.com/oauth/authorize?
     response_type=code&
     client_id=ca_XXXXX&
     scope=read_write&
     redirect_uri=https://weblaunchacademy.com/api/integrations/stripe/callback
   ```
3. **User logs in to Stripe** (or creates account)
4. **User authorizes connection**
5. **Stripe redirects back with code**
6. **Your app exchanges code for access token**

### Token Exchange

```typescript
const response = await fetch('https://connect.stripe.com/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Bearer ${STRIPE_SECRET_KEY}`
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    client_secret: STRIPE_SECRET_KEY
  })
})

const {
  access_token,
  refresh_token,
  stripe_user_id, // Connected account ID
  stripe_publishable_key
} = await response.json()
```

## Making API Calls

### On Behalf of Connected Account

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create a customer on the connected account
const customer = await stripe.customers.create({
  email: 'customer@example.com'
}, {
  stripeAccount: connectedAccountId // The stripe_user_id from OAuth
})

// Create a payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd'
}, {
  stripeAccount: connectedAccountId
})

// List products
const products = await stripe.products.list({}, {
  stripeAccount: connectedAccountId
})
```

### Webhooks

Configure webhooks for connected account events:

**Webhook URL:** `https://weblaunchacademy.com/api/webhooks/stripe-connect`

**Events to listen for:**
- `account.updated` - When connected account changes
- `account.application.deauthorized` - When user revokes access

## Common Operations for Client Projects

### Check if client has Stripe

```typescript
const { data } = await supabase
  .from('client_service_credentials')
  .select('*')
  .eq('user_id', userId)
  .eq('service_name', 'stripe')
  .single()

const hasStripe = !!data
```

### Get connected account details

```typescript
const account = await stripe.accounts.retrieve(connectedAccountId)

console.log({
  id: account.id,
  email: account.email,
  businessType: account.business_type,
  country: account.country,
  defaultCurrency: account.default_currency,
  chargesEnabled: account.charges_enabled,
  payoutsEnabled: account.payouts_enabled
})
```

### Test payment flow

```typescript
// Create test payment on client's account
const paymentIntent = await stripe.paymentIntents.create({
  amount: 100, // $1.00
  currency: 'usd',
  description: 'Test payment - Web Launch Academy'
}, {
  stripeAccount: connectedAccountId
})
```

## Refreshing Access Tokens

Stripe Connect tokens don't expire, but can be refreshed:

```typescript
const response = await fetch('https://connect.stripe.com/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Bearer ${STRIPE_SECRET_KEY}`
  },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: storedRefreshToken
  })
})

const { access_token: newAccessToken } = await response.json()
```

## Deauthorization

If user wants to disconnect:

```typescript
await fetch('https://connect.stripe.com/oauth/deauthorize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Bearer ${STRIPE_SECRET_KEY}`
  },
  body: new URLSearchParams({
    client_id: STRIPE_CLIENT_ID,
    stripe_user_id: connectedAccountId
  })
})
```

## Testing

### Test Mode

- Use test mode keys during development
- Test mode connected accounts are separate from live mode
- Use test card numbers: `4242 4242 4242 4242`

### Local Development

```bash
# Use Stripe CLI for webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe-connect

# Use the webhook signing secret in your .env
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_XXX
```

## Security Best Practices

1. **Store tokens encrypted** - Use your encryption library
2. **Validate webhooks** - Verify signature
3. **Scope minimization** - Only request `read_write` if needed
4. **Audit logs** - Track all API calls made on behalf of users
5. **Error handling** - Handle account deauthorization gracefully

## UI/UX Recommendations

### Connection Button

```tsx
<button onClick={() => {
  window.location.href = 
    `https://connect.stripe.com/oauth/authorize?` +
    `response_type=code&` +
    `client_id=${STRIPE_CLIENT_ID}&` +
    `scope=read_write&` +
    `redirect_uri=${REDIRECT_URI}&` +
    `state=${userId}` // Anti-CSRF
}}>
  Connect Stripe Account
</button>
```

### Status Display

```tsx
{hasStripe ? (
  <div className="flex items-center gap-2">
    <CheckIcon className="text-green-500" />
    <span>Stripe Connected</span>
    <button onClick={disconnect}>Disconnect</button>
  </div>
) : (
  <div className="flex items-center gap-2">
    <XIcon className="text-gray-400" />
    <span>Not connected</span>
    <button onClick={connect}>Connect Stripe</button>
  </div>
)}
```

## Resources

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [OAuth for Connect](https://stripe.com/docs/connect/oauth-reference)
- [Standard Accounts](https://stripe.com/docs/connect/standard-accounts)
- [API Reference](https://stripe.com/docs/api)
