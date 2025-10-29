import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { validateRequest } from '@/lib/validation'
import { createPaymentIntentSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    )
  }

  try {
    // Validate request with Zod schema
    const validation = await validateRequest(request, createPaymentIntentSchema)
    if (!validation.success) {
      return validation.error
    }

    const { amount, courseType, email } = validation.data

    // Create payment intent
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        courseType,
        email,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Stripe payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}