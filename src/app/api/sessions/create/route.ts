import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

// Valid promo codes for free access
const VALID_PROMO_CODES = ['BUILDER25', 'BETATESTER', 'LAUNCH2024']

export async function POST(req: NextRequest) {
  try {
    const { email, promoCode } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase(true)

    // Check rate limit - one free preview per email ever
    const { data: existingSession } = await supabase
      .from('demo_projects')
      .select('id, preview_generated_at')
      .eq('user_email', email.toLowerCase())
      .not('preview_generated_at', 'is', null)
      .single()

    if (existingSession) {
      return NextResponse.json(
        { error: 'You have already generated a preview with this email. Each email can only generate one free preview.' },
        { status: 429 }
      )
    }

    // Validate promo code if provided
    let entryFeePaid = false
    let promoCodeUsed = null

    if (promoCode) {
      const normalizedCode = promoCode.toUpperCase().trim()
      if (VALID_PROMO_CODES.includes(normalizedCode)) {
        entryFeePaid = true
        promoCodeUsed = normalizedCode
      } else {
        return NextResponse.json(
          { error: 'Invalid promo code' },
          { status: 400 }
        )
      }
    }

    // If no valid promo code, require payment
    if (!entryFeePaid) {
      // Create Stripe checkout session for $5 entry fee
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

      // Create a pending session first
      const sessionId = randomUUID()

      const { error: insertError } = await supabase
        .from('demo_projects')
        .insert({
          id: sessionId,
          user_email: email.toLowerCase(),
          status: 'pending_payment',
          entry_fee_paid: false,
          current_step: 1
        })

      if (insertError) {
        console.error('Error creating pending session:', insertError)
        throw insertError
      }

      // Create Stripe checkout
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ENTRY_FEE || 'price_entry_fee',
            quantity: 1,
          },
        ],
        allow_promotion_codes: true,
        success_url: `${baseUrl}/get-started/build/${sessionId}?paid=true`,
        cancel_url: `${baseUrl}/get-started?canceled=true`,
        customer_email: email.toLowerCase(),
        client_reference_id: sessionId,
        metadata: {
          sessionId,
          type: 'entry_fee'
        },
      })

      return NextResponse.json({
        requiresPayment: true,
        checkoutUrl: checkoutSession.url,
        sessionId
      })
    }

    // Promo code valid - create session directly
    const sessionId = randomUUID()

    const { data: session, error } = await supabase
      .from('demo_projects')
      .insert({
        id: sessionId,
        user_email: email.toLowerCase(),
        status: 'building',
        entry_fee_paid: true,
        promo_code_used: promoCodeUsed,
        current_step: 1
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      throw error
    }

    return NextResponse.json({
      sessionId: session.id,
      requiresPayment: false
    })

  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
