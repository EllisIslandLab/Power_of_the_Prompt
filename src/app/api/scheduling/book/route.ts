import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const resend = new Resend(process.env.RESEND_API_KEY!)

type SessionType = 'check-in' | 'lvl-up-session' | 'group-coaching' | 'custom'

interface BookingRequest {
  session_type: SessionType
  booking_date: string // YYYY-MM-DD
  start_time: string // ISO timestamp
  notes?: string
  coach_id?: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get the authenticated user from the request
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse request body
    const body: BookingRequest = await request.json()
    const { session_type, booking_date, start_time, notes, coach_id } = body

    // Validate required fields
    if (!session_type || !booking_date || !start_time) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user from cookie/header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get coach (default to first admin if not specified)
    let targetCoachId = coach_id
    if (!targetCoachId) {
      const { data: adminUsers } = await supabase
        .from('users' as any)
        .select('id')
        .eq('role', 'admin')
        .limit(1)

      if (adminUsers && adminUsers.length > 0) {
        targetCoachId = adminUsers[0].id
      } else {
        return NextResponse.json(
          { success: false, error: 'No coaches available' },
          { status: 404 }
        )
      }
    }

    // Determine duration based on session type
    const durationMap: Record<SessionType, number> = {
      'check-in': 15,
      'lvl-up-session': 60,
      'group-coaching': 60,
      'custom': 30
    }
    const duration = durationMap[session_type]

    // Generate meeting link (Jitsi room name)
    const meetingLink = `${session_type}-${Date.now()}`

    // Check for conflicts
    const bookingStart = new Date(start_time)
    const bookingEnd = new Date(bookingStart.getTime() + duration * 60 * 1000)

    const { data: conflicts, error: conflictError } = await supabase
      .from('session_bookings' as any)
      .select('id')
      .eq('coach_id', targetCoachId)
      .eq('booking_date', booking_date)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', bookingStart.toISOString())
      .lt('start_time', bookingEnd.toISOString())

    if (conflictError) {
      throw conflictError
    }

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Time slot is no longer available' },
        { status: 409 }
      )
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('session_bookings' as any)
      .insert({
        user_id: user.id,
        coach_id: targetCoachId,
        session_type,
        booking_date,
        start_time: bookingStart.toISOString(),
        duration_minutes: duration,
        meeting_link: meetingLink,
        notes: notes || null,
        status: 'confirmed',
        confirmation_email_sent: false
      })
      .select()
      .single() as any

    if (bookingError) {
      throw bookingError
    }

    // Get user details for email
    const { data: userData } = await supabase
      .from('users' as any)
      .select('email, full_name')
      .eq('id', user.id)
      .single() as any

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Web Launch Academy <hello@weblaunchacademy.com>',
        to: userData?.email || user.email || '',
        subject: `Session Confirmed: ${session_type.replace('-', ' ').toUpperCase()}`,
        html: `
          <h2>Your session has been confirmed!</h2>
          <p><strong>Session Type:</strong> ${session_type.replace('-', ' ')}</p>
          <p><strong>Date:</strong> ${new Date(booking_date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(start_time).toLocaleTimeString()}</p>
          <p><strong>Duration:</strong> ${duration} minutes</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          <p><strong>Meeting Link:</strong> <a href="/portal/collaboration">Join here at session time</a></p>
          <p>Room name: ${meetingLink}</p>
          <p>We'll send you a reminder 24 hours and 1 hour before your session.</p>
        `
      })

      // Update booking to mark email sent
      await supabase
        .from('session_bookings' as any)
        .update({ confirmation_email_sent: true })
        .eq('id', booking.id)

    } catch (emailError) {
      logger.error(
        { type: 'email', error: emailError },
        'Failed to send booking confirmation email'
      )
      // Don't fail the booking if email fails
    }

    const duration_ms = Date.now() - startTime
    logger.info(
      {
        type: 'api',
        route: '/api/scheduling/book',
        duration: duration_ms,
        booking_id: booking.id,
        session_type
      },
      `Session booked (${duration_ms}ms)`
    )

    return NextResponse.json({
      success: true,
      data: booking
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      { type: 'api', route: '/api/scheduling/book', error, duration },
      'Booking API Error'
    )

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create booking'
      },
      { status: 500 }
    )
  }
}
