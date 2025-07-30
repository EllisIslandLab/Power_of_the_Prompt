import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object)
        // TODO: Update user enrollment status
        break
      
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object)
        // TODO: Update user subscription status
        break
      
      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object)
        // TODO: Update user subscription status
        break
      
      case 'customer.subscription.deleted':
        console.log('Subscription cancelled:', event.data.object)
        // TODO: Update user subscription status
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}