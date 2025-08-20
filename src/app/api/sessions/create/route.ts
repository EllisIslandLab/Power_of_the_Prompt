import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { VideoSession } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    
    // Get user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      sessionName,
      sessionType = 'FREE_CONSULTATION',
      scheduledStart,
      scheduledEnd,
      participantUserIds = [],
      maxParticipants = 10,
      waitingRoomEnabled = true,
      jitsiConfig = {},
      consultationId
    } = body

    // Validate required fields
    if (!sessionName || !scheduledStart || !scheduledEnd) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionName, scheduledStart, scheduledEnd' },
        { status: 400 }
      )
    }

    // Generate unique Jitsi room ID
    const timestamp = new Date(scheduledStart).getTime()
    const randomId = Math.random().toString(36).substr(2, 9)
    const jitsiRoomId = `session-${timestamp}-${randomId}`

    // Create video session
    const { data: videoSession, error } = await supabase
      .from('video_sessions')
      .insert({
        session_name: sessionName,
        jitsi_room_id: jitsiRoomId,
        host_user_id: user.id,
        participant_user_ids: participantUserIds,
        session_type: sessionType,
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        session_status: 'SCHEDULED',
        waiting_room_enabled: waitingRoomEnabled,
        max_participants: maxParticipants,
        jitsi_config: jitsiConfig,
        consultation_id: consultationId
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating video session:', error)
      return NextResponse.json(
        { error: 'Failed to create video session' },
        { status: 500 }
      )
    }

    // Get Jitsi domain from environment
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
    
    // Return session with join URL
    return NextResponse.json({
      ...videoSession,
      joinUrl: `https://${jitsiDomain}/${jitsiRoomId}`,
      isHost: true
    })

  } catch (error) {
    console.error('Error creating video session:', error)
    return NextResponse.json(
      { error: 'Failed to create video session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    
    // Get user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionType = searchParams.get('sessionType')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('video_sessions')
      .select('*')
      .or(`host_user_id.eq.${user.id},participant_user_ids.cs.{${user.id}}`)
      .order('scheduled_start', { ascending: true })
      .range(offset, offset + limit - 1)

    if (sessionType) {
      query = query.eq('session_type', sessionType)
    }

    if (status) {
      query = query.eq('session_status', status)
    }

    const { data: sessions, error } = await query

    if (error) {
      console.error('Error fetching video sessions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch video sessions' },
        { status: 500 }
      )
    }

    // Add join URLs and user role
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
    const sessionsWithUrls = sessions?.map(videoSession => ({
      ...videoSession,
      joinUrl: `https://${jitsiDomain}/${videoSession.jitsi_room_id}`,
      isHost: videoSession.host_user_id === user.id,
      isParticipant: videoSession.participant_user_ids?.includes(user.id)
    })) || []

    return NextResponse.json(sessionsWithUrls)

  } catch (error) {
    console.error('Error fetching video sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video sessions' },
      { status: 500 }
    )
  }
}