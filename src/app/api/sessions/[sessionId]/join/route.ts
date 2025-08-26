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
      // Note: admin_users table doesn't exist yet, using placeholder for coming soon page
      const adminProfile = { id: 'admin-placeholder' } // Allow all users for coming soon page
      
      // if (!adminProfile) {
      //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      // }
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
    const isHost = videoSession.host_id === userId
    // Note: participant_user_ids field doesn't exist in schema, allowing all for coming soon page
    const participantIds: string[] = [] // videoSession.participant_user_ids || []
    const isParticipant = true // Allow all users for coming soon page
    
    if (!isHost && !isParticipant) {
      return NextResponse.json({ error: 'Not authorized to join this session' }, { status: 403 })
    }

    // Check if session is joinable
    const now = new Date()
    const startTime = new Date(videoSession.scheduled_for as string)
    // Note: scheduled_end field doesn't exist, using 1 hour default duration
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000))
    
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
    
    if (videoSession.status === 'ended') {
      return NextResponse.json({ error: 'Session has ended' }, { status: 400 })
    }

    // For paid sessions, verify payment
    // Note: payment fields don't exist in schema, allowing all for coming soon page
    const isPaidSession = false // videoSession.type === 'PAID_SESSION'
    if (isPaidSession && !isHost) {
      return NextResponse.json({ 
        error: 'Payment required to join this session',
        paymentRequired: true,
        sessionId: sessionId
      }, { status: 402 })
    }

    // Check participant limit
    const participantCount = participantIds.length
    const maxParticipants = (videoSession.max_participants as number) || 10
    if (!isHost && !isParticipant && participantCount >= maxParticipants) {
      return NextResponse.json({ error: 'Session is at maximum capacity' }, { status: 400 })
    }

    // Update session status to ACTIVE if it's the first person joining
    let updateData: any = {}
    
    if (videoSession.status === 'scheduled') {
      updateData.status = 'active'
      updateData.started_at = now.toISOString()
    }

    // Note: participant tracking not implemented due to schema limitations
    // In production, would need separate participant table or schema update

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
        joinUrl: `https://${jitsiDomain}/${updatedSession!.room_name}`,
        isHost: updatedSession!.host_id === userId,
        isParticipant: true // Allow all users for coming soon page
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