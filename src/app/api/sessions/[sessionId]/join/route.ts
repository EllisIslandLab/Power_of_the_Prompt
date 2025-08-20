import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = getSupabase()
    
    // Get user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params
    const body = await request.json()
    const { userId } = body

    // Verify user is trying to join as themselves (unless admin)
    // For now, anyone can join - in production you'd check admin status via admin_users table
    if (userId !== user.id) {
      // Check if user is admin
      const { data: adminProfile } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single()
        
      if (!adminProfile) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Get session details
    const { data: videoSession, error: sessionError } = await supabase
      .from('video_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !videoSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Check if user is authorized to join
    const isHost = videoSession.host_user_id === userId
    const isParticipant = videoSession.participant_user_ids?.includes(userId)
    
    if (!isHost && !isParticipant) {
      return NextResponse.json({ error: 'Not authorized to join this session' }, { status: 403 })
    }

    // Check if session is joinable
    const now = new Date()
    const startTime = new Date(videoSession.scheduled_start)
    const endTime = new Date(videoSession.scheduled_end)
    
    // Allow joining 15 minutes before scheduled start
    const joinWindow = new Date(startTime.getTime() - 15 * 60 * 1000)
    
    if (now < joinWindow) {
      return NextResponse.json({ 
        error: 'Session has not started yet. You can join 15 minutes before the scheduled time.' 
      }, { status: 400 })
    }
    
    if (now > endTime) {
      return NextResponse.json({ error: 'Session has ended' }, { status: 400 })
    }
    
    if (videoSession.session_status === 'CANCELLED') {
      return NextResponse.json({ error: 'Session has been cancelled' }, { status: 400 })
    }

    // For paid sessions, verify payment
    if (videoSession.session_type === 'PAID_SESSION' && !videoSession.stripe_payment_intent_id && !isHost) {
      return NextResponse.json({ 
        error: 'Payment required to join this session',
        paymentRequired: true,
        sessionId: sessionId
      }, { status: 402 })
    }

    // Check participant limit
    const participantCount = videoSession.participant_user_ids?.length || 0
    if (!isHost && !isParticipant && participantCount >= (videoSession.max_participants || 10)) {
      return NextResponse.json({ error: 'Session is at maximum capacity' }, { status: 400 })
    }

    // Update session status to ACTIVE if it's the first person joining
    let updateData: any = {}
    
    if (videoSession.session_status === 'SCHEDULED') {
      updateData.session_status = 'ACTIVE'
      updateData.actual_start = now.toISOString()
    }

    // If user is not already a participant, add them
    if (!isParticipant && !isHost) {
      const currentParticipants = videoSession.participant_user_ids || []
      updateData.participant_user_ids = [...currentParticipants, userId]
    }

    // Update session if needed
    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('video_sessions')
        .update(updateData)
        .eq('id', sessionId)
    }

    // Log join event (optional - could be used for analytics)
    console.log(`User ${userId} joined session ${sessionId}`)

    // Get updated session info
    const { data: updatedSession } = await supabase
      .from('video_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'

    return NextResponse.json({
      message: 'Successfully joined session',
      session: {
        ...updatedSession,
        joinUrl: `https://${jitsiDomain}/${updatedSession!.jitsi_room_id}`,
        isHost: updatedSession!.host_user_id === userId,
        isParticipant: updatedSession!.participant_user_ids?.includes(userId)
      }
    })

  } catch (error) {
    console.error('Error joining session:', error)
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    )
  }
}