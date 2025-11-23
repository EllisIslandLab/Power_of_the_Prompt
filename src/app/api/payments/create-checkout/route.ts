import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import Stripe from 'stripe'
import { calculateRolloverPrice, getTierPrice } from '@/lib/payments/calculateRollover'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export const runtime = 'nodejs'

/**
 * Unified Payment Checkout API
 *
 * Creates Stripe checkout sessions for Phase 2A products:
 * - AI Premium Builder ($5) - ai_premium
 * - Launch Guide ($19) - textbook
 * - Architecture Mastery Toolkit ($190) - architecture-mastery-toolkit
 *
 * Features:
 * - Automatic rollover pricing (credits previous purchases)
 * - Skip discount (10% for non-consecutive upgrades)
 * - Returns to demo builder or portal depending on context
 */
export async function POST(req: NextRequest) {
  try {
    const { productSlug, returnContext } = await req.json()

    if (!productSlug) {
      return NextResponse.json(
        { error: 'Product slug is required' },
        { status: 400 }
      )
    }

    // Validate product slug
    const validProducts = ['ai_premium', 'textbook', 'architecture-mastery-toolkit']
    if (!validProducts.includes(productSlug)) {
      return NextResponse.json(
        { error: `Invalid product slug. Must be one of: ${validProducts.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = getSupabase(true)

    // Get user (optional - guests can purchase AI Premium)
    const { data: { user } } = await supabase.auth.getUser()

    // Get user's purchase history for rollover pricing
    let purchaseHistory: Array<{ tier: string; amount_paid: number }> = []

    if (user) {
      const { data: purchases } = await supabase
        .from('purchases')
        .select('product_slug, amount_paid')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (purchases) {
        purchaseHistory = purchases.map(p => ({
          tier: p.product_slug,
          amount_paid: p.amount_paid
        }))
      }
    }

    // Calculate pricing with rollover
    const pricing = calculateRolloverPrice(productSlug, { tiers: purchaseHistory })

    // Map product slugs to Stripe Price IDs
    const priceIdMap: Record<string, string> = {
      ai_premium: process.env.STRIPE_PRICE_AI_PREMIUM_ID!,
      textbook: process.env.STRIPE_PRICE_TEXTBOOK_ID!,
      'architecture-mastery-toolkit': process.env.STRIPE_PRICE_ARCHITECTURE_ID!,
    }

    const stripePriceId = priceIdMap[productSlug]
    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured for this product' },
        { status: 500 }
      )
    }

    // Build return state for webhook
    const returnState = {
      productSlug,
      userId: user?.id || null,
      userEmail: user?.email || null,
      returnContext: returnContext || 'portal',
      ...returnContext, // Include any additional context (sessionId, etc.)
    }

    // Determine success/cancel URLs based on context
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    let successUrl = `${baseUrl}/portal?payment=success`
    let cancelUrl = `${baseUrl}/portal?payment=cancelled`

    if (returnContext?.type === 'demo_builder') {
      const sessionId = returnContext.sessionId
      successUrl = `${baseUrl}/get-started/build/${sessionId}?payment=success`
      cancelUrl = `${baseUrl}/get-started/build/${sessionId}?payment=cancelled`
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      customer_email: user?.email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true, // Enable coupon/promo codes
      metadata: {
        product_slug: productSlug,
        user_id: user?.id || '',
        original_price: pricing.originalPrice.toString(),
        rollover_credit: pricing.rolloverCredit.toString(),
        skip_discount: pricing.skipDiscount.toString(),
        final_price: pricing.finalPrice.toString(),
      },
      // Store full return state for webhook processing
      client_reference_id: JSON.stringify(returnState),
    })

    // Log checkout session to database
    await supabase
      .from('stripe_checkout_sessions')
      .insert({
        session_id: session.id,
        user_id: user?.id || null,
        product_slug: productSlug,
        amount: pricing.finalPrice,
        status: 'created',
        return_state: returnState,
      })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      pricing: {
        originalPrice: pricing.originalPrice,
        rolloverCredit: pricing.rolloverCredit,
        skipDiscount: pricing.skipDiscount,
        finalPrice: pricing.finalPrice,
      },
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
