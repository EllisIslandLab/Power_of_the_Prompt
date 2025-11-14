import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { demoProjectId, tier } = body as { demoProjectId: string; tier: 'demo' | 'bundle' }

    if (!demoProjectId || !tier) {
      return NextResponse.json(
        { error: 'Demo project ID and tier are required' },
        { status: 400 }
      )
    }

    if (tier !== 'demo' && tier !== 'bundle') {
      return NextResponse.json(
        { error: 'Invalid tier selection' },
        { status: 400 }
      )
    }

    // Get Supabase client with service role
    const supabase = getSupabase(true)

    // Fetch the demo project to verify it exists and isn't expired
    const { data: demoProject, error: fetchError } = await supabase
      .from('demo_projects')
      .select('*')
      .eq('id', demoProjectId)
      .single()

    if (fetchError || !demoProject) {
      return NextResponse.json(
        { error: 'Demo project not found' },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date(demoProject.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This demo has expired. Please create a new one.' },
        { status: 410 }
      )
    }

    // Check if already has AI customization
    // We'll allow re-purchasing if they want, but you could block this

    // Determine price ID based on tier
    // TODO: Replace these with your actual Stripe Price IDs after creating products in Stripe Dashboard
    const priceIds = {
      demo: process.env.STRIPE_PRICE_AI_DEMO || 'price_TODO_AI_DEMO',
      bundle: process.env.STRIPE_PRICE_BUNDLE || 'price_TODO_BUNDLE',
    }

    const priceId = priceIds[tier]

    // Create success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/get-started/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/get-started?canceled=true`

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: demoProjectId,
      metadata: {
        demoProjectId,
        tier,
        businessName: demoProject.business_name,
        userEmail: demoProject.user_email,
      },
      customer_email: demoProject.user_email,
      payment_intent_data: {
        metadata: {
          demoProjectId,
          tier,
        },
      },
    })

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)

    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid payment configuration. Please contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
