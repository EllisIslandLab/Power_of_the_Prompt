import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Get Supabase client with service role
    const supabase = getSupabase(true)

    const body = await req.json()
    const { demoProjectId, interactionType, metadata = {} } = body

    // Validate required fields
    if (!demoProjectId || !interactionType) {
      return NextResponse.json(
        { error: 'Demo project ID and interaction type are required' },
        { status: 400 }
      )
    }

    // Validate interaction type
    const validInteractionTypes = [
      'viewed_preview',
      'clicked_textbook',
      'purchased_textbook',
      'clicked_book_call',
      'booked_call',
      'opened_email',
      'clicked_email_link',
    ]

    if (!validInteractionTypes.includes(interactionType)) {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      )
    }

    // Track interaction in database
    const { data: interaction, error: interactionError } = await supabase
      .from('demo_interactions')
      .insert({
        demo_project_id: demoProjectId,
        interaction_type: interactionType,
        metadata,
      })
      .select('id')
      .single()

    if (interactionError) {
      console.error('Error tracking interaction:', interactionError)
      return NextResponse.json(
        { error: 'Failed to track interaction' },
        { status: 500 }
      )
    }

    // Update demo project status based on interaction type
    if (interactionType === 'viewed_preview') {
      await supabase
        .from('demo_projects')
        .update({
          status: 'viewed',
          viewed_at: new Date().toISOString(),
        })
        .eq('id', demoProjectId)
        .eq('status', 'generated') // Only update if still in 'generated' status
    } else if (interactionType === 'purchased_textbook' || interactionType === 'booked_call') {
      await supabase
        .from('demo_projects')
        .update({
          status: 'converted',
        })
        .eq('id', demoProjectId)
    }

    return NextResponse.json({
      success: true,
      interactionId: interaction.id,
    })
  } catch (error) {
    console.error('Error in track-interaction:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
