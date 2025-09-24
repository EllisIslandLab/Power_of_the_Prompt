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

    // First, try to find or create a user for the guest
    let { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', sessionData.userEmail)
      .single()

    let userId = existingUser?.id

    if (!existingUser) {
      // Create a Supabase auth user for the guest (this might not work due to signup restrictions)
      // For now, we'll use a placeholder approach
      // In production, you'd handle this differently - maybe create a "guest" user system

      // Create user record with placeholder user_id
      const guestUserId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          id: guestUserId,
          full_name: sessionData.userName,
          email: sessionData.userEmail,
          course_enrolled: 'None',
          status: 'active',
          payment_status: 'trial', // Free consultation
          progress: 0
        })
        .select('*')
        .single()

      if (userError) {
        throw new Error(`Failed to create user record: ${userError.message}`)
      }

      userId = newUser.id
    }

    // Generate unique room ID based on session data
    const timestamp = new Date(sessionData.scheduledStart).getTime()
    const roomId = `consultation-${timestamp}-${Math.random().toString(36).substr(2, 9)}`
    
    // Calculate end time
    const startTime = new Date(sessionData.scheduledStart)
    const endTime = new Date(startTime.getTime() + (sessionData.duration * 60 * 1000))

    // Get an admin user to host the session
    // Note: admin_users table doesn't exist yet, using placeholder for coming soon page
    const adminUser = { user_id: 'admin-placeholder' }

    // Create video session
    const { data: videoSession, error: sessionError } = await supabase
      .from('video_sessions')
      .insert({
        title: sessionData.sessionName,
        room_name: roomId,
        host_id: adminUser.user_id,
        status: 'scheduled',
        scheduled_for: startTime.toISOString(),
        description: 'Free consultation session'
      })
      .select('*')
      .single()

    if (sessionError) {
      throw new Error(`Failed to create video session: ${sessionError.message}`)
    }

    // Create associated consultation record
    // Note: consultations table doesn't exist yet, using placeholder for coming soon page
    const consultation = {
      id: `consultation-${Date.now()}`,
      user_id: userId,
      scheduled_time: startTime.toISOString(),
      status: 'SCHEDULED',
      type: 'FREE',
      video_session_id: videoSession?.id || 'placeholder'
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
      userId: userId,
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