import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export interface StripeConnectToken {
  access_token: string
  refresh_token: string
  stripe_user_id: string // Connected account ID
  stripe_publishable_key: string
  scope: string
  livemode: boolean
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeStripeCode(code: string): Promise<StripeConnectToken> {
  const response = await fetch('https://connect.stripe.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code
    })
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Stripe token exchange failed:', error)
    throw new Error(error.error_description || 'Failed to exchange Stripe code')
  }

  return response.json()
}

/**
 * Refresh access token
 */
export async function refreshStripeToken(refreshToken: string): Promise<StripeConnectToken> {
  const response = await fetch('https://connect.stripe.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Stripe token refresh failed:', error)
    throw new Error(error.error_description || 'Failed to refresh Stripe token')
  }

  return response.json()
}

/**
 * Deauthorize (disconnect) a connected account
 */
export async function deauthorizeStripeAccount(connectedAccountId: string): Promise<void> {
  const response = await fetch('https://connect.stripe.com/oauth/deauthorize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
    },
    body: new URLSearchParams({
      client_id: process.env.STRIPE_CLIENT_ID!,
      stripe_user_id: connectedAccountId
    })
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Stripe deauthorization failed:', error)
    throw new Error('Failed to deauthorize Stripe account')
  }
}

/**
 * Get connected account details
 */
export async function getConnectedAccount(connectedAccountId: string) {
  try {
    const account = await stripe.accounts.retrieve(connectedAccountId)

    return {
      id: account.id,
      email: account.email,
      type: account.type,
      country: account.country,
      defaultCurrency: account.default_currency,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      businessProfile: account.business_profile,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements
    }
  } catch (error: any) {
    if (error.type === 'StripePermissionError') {
      throw new Error('Account access has been revoked')
    }
    throw error
  }
}

/**
 * List products from connected account
 */
export async function listProducts(connectedAccountId: string) {
  const products = await stripe.products.list({
    limit: 100
  }, {
    stripeAccount: connectedAccountId
  })

  return products.data
}

/**
 * List prices from connected account
 */
export async function listPrices(connectedAccountId: string) {
  const prices = await stripe.prices.list({
    limit: 100
  }, {
    stripeAccount: connectedAccountId
  })

  return prices.data
}

/**
 * Test connection by making a simple API call
 */
export async function testStripeConnection(connectedAccountId: string): Promise<boolean> {
  try {
    await stripe.accounts.retrieve(connectedAccountId)
    return true
  } catch (error: any) {
    console.error('Stripe connection test failed:', error)
    return false
  }
}

/**
 * Create a test payment intent (for validation)
 */
export async function createTestPaymentIntent(
  connectedAccountId: string,
  amount: number = 100 // $1.00 minimum
): Promise<{ clientSecret: string; id: string }> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    description: 'Test payment - Web Launch Academy',
    metadata: {
      test: 'true',
      source: 'web_launch_academy'
    }
  }, {
    stripeAccount: connectedAccountId
  })

  return {
    clientSecret: paymentIntent.client_secret!,
    id: paymentIntent.id
  }
}

/**
 * Get webhook events for connected account
 */
export async function listWebhookEndpoints(connectedAccountId: string) {
  const endpoints = await stripe.webhookEndpoints.list({}, {
    stripeAccount: connectedAccountId
  })

  return endpoints.data
}

/**
 * Verify webhook signature
 */
export function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    throw new Error('Invalid webhook signature')
  }
}
