import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { ResendAdapter } from '@/adapters/ResendAdapter'

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

    // Check if slot is still available (not in the past)
    const now = new Date()

    if (slotDate < now) {
      return NextResponse.json(
        { error: 'Selected time slot is in the past' },
        { status: 400 }
      )
    }

    const supabase = getSupabase(true) // Use service role

    // Check if slot is already booked
    const slotEnd = new Date(slotDate.getTime() + (60 * 60 * 1000))
    const { data: existingBlocks } = await supabase
      .from('consultation_blocks' as any)
      .select('*')
      .or(`and(start_time.lte.${slotDate.toISOString()},end_time.gt.${slotDate.toISOString()}),and(start_time.lt.${slotEnd.toISOString()},end_time.gte.${slotEnd.toISOString()})`)

    if (existingBlocks && existingBlocks.length > 0) {
      return NextResponse.json(
        { error: 'This time slot has just been booked. Please select another time.' },
        { status: 409 }
      )
    }

    // Create video session
    const videoSession = await createVideoSession({
      sessionName: `Free Consultation with ${fullName}`,
      scheduledStart: selectedSlot.timestamp,
      duration: 60,
      userEmail: email,
      userName: fullName
    })

    // Create consultation in Supabase
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations' as any)
      .insert({
        full_name: fullName,
        email: email,
        phone: phone,
        business_name: body.businessName || null,
        scheduled_date: slotDate.toISOString(),
        duration_minutes: 60,
        timezone: 'America/New_York',
        status: 'scheduled',
        jitsi_room_id: videoSession.jitsiRoomId,
        jitsi_join_url: videoSession.joinUrl,
        video_session_id: videoSession.id,
        website_description: websiteDescription || null,
        notes: `Booked via calendar at ${new Date().toISOString()}`
      })
      .select()
      .single() as any

    if (consultationError) {
      console.error('Error creating consultation:', consultationError)
      throw new Error(`Failed to create consultation: ${consultationError.message}`)
    }

    // Send confirmation email
    try {
      const resend = ResendAdapter.getInstance()

      // Get email template
      const { data: template } = await supabase
        .from('email_templates' as any)
        .select('*')
        .eq('name', 'Consultation Confirmation')
        .single() as any

      if (template) {
        let emailContent = template.content_template
          .replace(/{{name}}/g, fullName)
          .replace(/{{formatted_date}}/g, selectedSlot.formatted)
          .replace(/{{join_url}}/g, videoSession.joinUrl)

        let emailSubject = template.subject_template
          .replace(/{{formatted_date}}/g, selectedSlot.formatted)

        await resend.sendEmail({
          to: email,
          from: 'Web Launch Academy <hello@weblaunchacademy.com>',
          subject: emailSubject,
          html: emailContent
        })

        // Update consultation to mark confirmation sent
        await supabase
          .from('consultations' as any)
          .update({
            confirmation_sent: true,
            confirmation_sent_at: new Date().toISOString()
          })
          .eq('id', consultation.id)

        // Send copy to admin
        await resend.sendEmail({
          to: 'hello@weblaunchacademy.com',
          from: 'Web Launch Academy <hello@weblaunchacademy.com>',
          subject: `New Consultation Booked: ${fullName} - ${selectedSlot.formatted}`,
          html: `
            <h2>New Consultation Booked</h2>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Business:</strong> ${body.businessName || 'Not provided'}</p>
            <p><strong>Time:</strong> ${selectedSlot.formatted}</p>
            <p><strong>Website Description:</strong> ${websiteDescription || 'Not provided'}</p>
            <p><strong>Join URL:</strong> <a href="${videoSession.joinUrl}">${videoSession.joinUrl}</a></p>
          `
        })
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully',
      booking: {
        id: consultation.id,
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
      .from('users' as any)
      .select('*')
      .eq('email', sessionData.userEmail)
      .single() as any

    let userId = existingUser?.id

    if (!existingUser) {
      // Create a Supabase auth user for the guest (this might not work due to signup restrictions)
      // For now, we'll use a placeholder approach
      // In production, you'd handle this differently - maybe create a "guest" user system

      // Create user record with placeholder user_id
      const guestUserId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const { data: newUser, error: userError } = await supabase
        .from('users' as any)
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
        .single() as any

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

    // Create course session for consultation
    const { data: courseSession, error: sessionError } = await supabase
      .from('course_sessions' as any)
      .insert({
        session_name: sessionData.sessionName,
        session_date: startTime.toISOString(),
        recording_url: null, // Will be added after consultation if recorded
        live_points: 0, // Consultations don't award points
        recording_points: 0
      })
      .select('*')
      .single() as any

    if (sessionError) {
      throw new Error(`Failed to create consultation session: ${sessionError.message}`)
    }

    // Get Jitsi domain from environment
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'

    return {
      id: courseSession.id,
      jitsiRoomId: roomId,
      joinUrl: `https://${jitsiDomain}/${roomId}`,
      sessionName: sessionData.sessionName,
      scheduledStart: sessionData.scheduledStart,
      duration: sessionData.duration,
      consultationId: courseSession.id,
      userId: userId
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