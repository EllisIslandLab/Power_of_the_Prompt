import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const { builderType } = await req.json()

    if (!builderType || !['free', 'ai_premium'].includes(builderType)) {
      return NextResponse.json(
        { error: 'Invalid builder type' },
        { status: 400 }
      )
    }

    const supabase = getSupabase(true)

    // Create new demo session
    const sessionId = nanoid()
    // @ts-expect-error - demo_sessions table exists but not in generated types yet
    const { data: session, error } = await supabase
      .from('demo_sessions')
      .insert({
        id: sessionId,
        builder_type: builderType,
        ai_premium_paid: builderType === 'ai_premium' ? false : null,
        ai_credits_total: builderType === 'ai_premium' ? 30 : 0,
        status: 'building',
        user_email: '' // Will be filled in Step 1
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
