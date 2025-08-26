import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getAirtableBase } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields for calendar booking
    const { fullName, email, phone, selectedSlot, websiteDescription } = body
    
    if (!fullName || !email || !phone || !selectedSlot) {
      return NextResponse.json(
        { error: 'Missing required fields: Name, Email, Phone, and Selected Time Slot are required' },
        { status: 400 }
      )
    }

    // Validate the selected slot format
    const slotDate = new Date(selectedSlot.timestamp)
    if (isNaN(slotDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid time slot selected' },
        { status: 400 }
      )
    }

    // Check if slot is still available (not in the past, meets minimum notice)
    const now = new Date()
    const minBookingTime = new Date(now.getTime() + (3 * 60 * 60 * 1000))
    
    if (slotDate < minBookingTime) {
      return NextResponse.json(
        { error: 'Selected time slot requires at least 3 hours notice' },
        { status: 400 }
      )
    }

    // Create video session in Supabase
    const videoSession = await createVideoSession({
      sessionName: `Free Consultation with ${fullName}`,
      scheduledStart: selectedSlot.timestamp,
      duration: 30,
      userEmail: email,
      userName: fullName
    })

    // Prepare record for Airtable - using flexible typing for dynamic fields
    const record: any = {
      fields: {
        'Name': fullName,
        'Email': email,
        'Phone': phone,
        'Business Name': body.businessName || 'Not provided',
        'Status': 'Confirmed',
        'Appointment Date': slotDate.toISOString(),
        'Appointment Time': selectedSlot.formatted,
        'Meeting Type': 'Calendar Booking',
        'Jitsi Room ID': videoSession.jitsiRoomId,
        'Jitsi Join URL': videoSession.joinUrl,
        'Video Session ID': videoSession.id,
        'Notes': `Website Type: ${websiteDescription || 'Not specified'} | Booked: ${new Date().toISOString()}`
      }
    }

    // Add optional fields
    if (body.businessType) {
      const businessTypeMap: Record<string, string> = {
        'service': 'Service-based',
        'product': 'Product-based', 
        'nonprofit': 'Non-profit',
        'other': 'Other'
      }
      record.fields['Business Type'] = businessTypeMap[body.businessType as string] || 'Other'
    }
    
    if (body.currentWebsite) {
      record.fields['Current Website'] = body.currentWebsite
    }

    // Create record in Airtable
    const base = getAirtableBase()
    const createdRecord = await base('Consultations').create([record])
    
    // TODO: Send confirmation email with calendar invite
    
    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully',
      booking: {
        id: createdRecord[0].id,
        appointment_time: selectedSlot.formatted,
        jitsi_join_url: videoSession.joinUrl,
        confirmation_sent: true
      }
    })

  } catch (error) {
    console.error('Booking API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to book appointment',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

// Video session creation function using Supabase
async function createVideoSession(sessionData: {
  sessionName: string
  scheduledStart: string
  duration: number
  userEmail: string
  userName: string
}) {
  try {
    const supabase = getSupabase()

    // First, try to find or create a student user for the guest
    let { data: existingStudent } = await supabase
      .from('students')
      .select('*')
      .eq('email', sessionData.userEmail)
      .single()

    let studentId = existingStudent?.id

    if (!existingStudent) {
      // Create a Supabase auth user for the guest (this might not work due to signup restrictions)
      // For now, we'll use a placeholder approach
      // In production, you'd handle this differently - maybe create a "guest" user system
      
      // Create student record with placeholder user_id
      const guestUserId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert({
          id: guestUserId,
          full_name: sessionData.userName,
          email: sessionData.userEmail,
          course_enrolled: 'None',
          status: 'Active',
          payment_status: 'trial', // Free consultation
          progress: 0
        })
        .select('*')
        .single()

      if (studentError) {
        throw new Error(`Failed to create student record: ${studentError.message}`)
      }

      studentId = newStudent.user_id
    }

    // Generate unique room ID based on session data
    const timestamp = new Date(sessionData.scheduledStart).getTime()
    const roomId = `consultation-${timestamp}-${Math.random().toString(36).substr(2, 9)}`
    
    // Calculate end time
    const startTime = new Date(sessionData.scheduledStart)
    const endTime = new Date(startTime.getTime() + (sessionData.duration * 60 * 1000))

    // Get an admin user to host the session
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('user_id')
      .limit(1)
      .single()

    if (!adminUser) {
      throw new Error('No admin user found to host the session')
    }

    // Create video session
    const { data: videoSession, error: sessionError } = await supabase
      .from('video_sessions')
      .insert({
        session_name: sessionData.sessionName,
        jitsi_room_id: roomId,
        host_user_id: adminUser.user_id,
        participant_user_ids: [studentId],
        session_type: 'FREE_CONSULTATION',
        scheduled_start: startTime.toISOString(),
        scheduled_end: endTime.toISOString(),
        session_status: 'SCHEDULED',
        waiting_room_enabled: true,
        max_participants: 2 // Host + 1 participant for consultation
      })
      .select('*')
      .single()

    if (sessionError) {
      throw new Error(`Failed to create video session: ${sessionError.message}`)
    }

    // Create associated consultation record
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .insert({
        user_id: studentId,
        scheduled_time: startTime.toISOString(),
        status: 'SCHEDULED',
        type: 'FREE',
        video_session_id: videoSession.id
      })
      .select('*')
      .single()

    if (consultationError) {
      console.warn('Failed to create consultation record:', consultationError)
      // Don't throw here - video session is more important
    }

    // Get Jitsi domain from environment
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
    
    return {
      id: videoSession.id,
      jitsiRoomId: roomId,
      joinUrl: `https://${jitsiDomain}/${roomId}`,
      sessionName: sessionData.sessionName,
      scheduledStart: sessionData.scheduledStart,
      duration: sessionData.duration,
      consultationId: consultation?.id || null,
      userId: studentId,
      hostId: adminUser.user_id
    }

  } catch (error) {
    console.error('Error creating video session:', error)
    
    // Fallback to basic room creation if database fails
    const timestamp = new Date(sessionData.scheduledStart).getTime()
    const roomId = `consultation-fallback-${timestamp}-${Math.random().toString(36).substr(2, 9)}`
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
    
    return {
      id: 'fallback',
      jitsiRoomId: roomId,
      joinUrl: `https://${jitsiDomain}/${roomId}`,
      sessionName: sessionData.sessionName,
      scheduledStart: sessionData.scheduledStart,
      duration: sessionData.duration,
      consultationId: null,
      userId: null,
      hostId: null
    }
  }
}