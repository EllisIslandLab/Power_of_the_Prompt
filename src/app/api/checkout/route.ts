import { NextRequest, NextResponse } from 'next/server'
import { getStripe, STRIPE_PRODUCTS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
        { status: 500 }
      )
    }

    const { 
      productId, 
      quantity = 1, 
      // Dynamic pricing fields
      customPrice,
      customName,
      customDescription,
      customerEmail 
    } = await request.json()

    let lineItems: any[]
    let sessionMode: 'payment' | 'subscription' = 'payment'

    // Handle dynamic pricing (custom quotes)
    if (customPrice && customName) {
      console.log(`Creating custom checkout: ${customName}, price: $${customPrice}`)
      
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: customName,
            description: customDescription || 'Custom website service'
          },
          unit_amount: Math.round(customPrice * 100), // Convert dollars to cents
        },
        quantity,
      }]
    } 
    // Handle fixed price products
    else if (productId && STRIPE_PRODUCTS[productId as keyof typeof STRIPE_PRODUCTS]) {
      const priceId = STRIPE_PRODUCTS[productId as keyof typeof STRIPE_PRODUCTS]
      
      // Check if price ID looks valid
      if (!priceId.startsWith('price_')) {
        return NextResponse.json(
          { error: `Invalid Stripe price ID: ${priceId}. Please update STRIPE_PRODUCTS with your actual price IDs from Stripe dashboard.` },
          { status: 400 }
        )
      }

      console.log(`Creating fixed price checkout for product: ${productId}, price: ${priceId}`)
      
      lineItems = [{
        price: priceId,
        quantity,
      }]
      
      sessionMode = productId === 'MONTHLY_SUPPORT' ? 'subscription' : 'payment'
    }
    // Invalid request
    else {
      return NextResponse.json(
        { error: `Either provide a valid productId (${Object.keys(STRIPE_PRODUCTS).join(', ')}) or customPrice + customName for dynamic pricing.` },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: sessionMode,
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      customer_email: customerEmail || undefined,
      metadata: {
        productId: productId || 'custom',
        customPrice: customPrice ? customPrice.toString() : undefined,
        // Add any other metadata you want to track
      },
    })

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    // More specific error messages
    let errorMessage = 'Failed to create checkout session'
    
    if ((error as any).type === 'StripeInvalidRequestError') {
      errorMessage = `Stripe error: ${(error as Error)?.message}`
    } else if ((error as Error)?.message) {
      errorMessage = (error as Error).message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.stack : undefined
      },
      { status: 500 }
    )
  }
}