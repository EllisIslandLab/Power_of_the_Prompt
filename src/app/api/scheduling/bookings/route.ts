import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const upcoming = searchParams.get('upcoming') === 'true'

    // Build query
    let query = supabase
      .from('session_bookings' as any)
      .select(`
        *,
        user:user_id(id, email, full_name),
        coach:coach_id(id, email, full_name)
      `)
      .eq('user_id', user.id)
      .order('start_time', { ascending: true })

    // Filter by status if specified
    if (status) {
      query = query.eq('status', status)
    }

    // Filter for upcoming sessions only
    if (upcoming) {
      const now = new Date().toISOString()
      query = query
        .gte('start_time', now)
        .in('status', ['pending', 'confirmed'])
    }

    const { data: bookings, error: bookingsError } = await query

    if (bookingsError) {
      throw bookingsError
    }

    const duration = Date.now() - startTime
    logger.info(
      {
        type: 'api',
        route: '/api/scheduling/bookings',
        duration,
        count: bookings?.length || 0
      },
      `Bookings fetched (${duration}ms)`
    )

    return NextResponse.json({
      success: true,
      data: bookings || []
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      { type: 'api', route: '/api/scheduling/bookings', error, duration },
      'Bookings API Error'
    )

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

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

    const body = await request.json()
    const { booking_id, status } = body

    if (!booking_id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing booking_id or status' },
        { status: 400 }
      )
    }

    // Verify the booking belongs to the user
    const { data: booking, error: verifyError } = await supabase
      .from('session_bookings' as any)
      .select('*')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single() as any

    if (verifyError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update the booking
    const { data: updated, error: updateError } = await supabase
      .from('session_bookings' as any)
      .update({ status })
      .eq('id', booking_id)
      .select()
      .single() as any

    if (updateError) {
      throw updateError
    }

    const duration = Date.now() - startTime
    logger.info(
      {
        type: 'api',
        route: '/api/scheduling/bookings',
        method: 'PATCH',
        duration,
        booking_id,
        new_status: status
      },
      `Booking updated (${duration}ms)`
    )

    return NextResponse.json({
      success: true,
      data: updated
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      { type: 'api', route: '/api/scheduling/bookings', method: 'PATCH', error, duration },
      'Booking Update API Error'
    )

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update booking'
      },
      { status: 500 }
    )
  }
}
