import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { builderType, stripeSessionId } = await req.json()

    if (!builderType || !['free', 'ai_premium'].includes(builderType)) {
      return NextResponse.json(
        { error: 'Invalid builder type' },
        { status: 400 }
      )
    }

    // For AI Premium, verify Stripe session if provided
    let isPaid = false
    if (builderType === 'ai_premium' && stripeSessionId) {
      // TODO: Verify Stripe session with Stripe API
      // For now, trust that if stripeSessionId is provided, payment was successful
      isPaid = true
    }

    const supabase = getSupabase(true)

    // Create new demo session
    const sessionId = randomUUID()
    const { data: session, error } = await supabase
      .from('demo_sessions')
      .insert({
        id: sessionId,
        builder_type: builderType,
        ai_premium_paid: builderType === 'ai_premium' ? isPaid : false,
        ai_premium_payment_intent: stripeSessionId || null,
        ai_credits_total: builderType === 'ai_premium' ? 30 : 0,
        ai_credits_used: 0,
        current_step: 1,
        status: 'building',
        user_email: '', // Will be filled in Step 1
        form_data: {},
        selected_components: [],
        ai_interactions: []
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      throw error
    }

    return NextResponse.json({
      sessionId: session.id,
      builderType: session.builder_type
    })

  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
