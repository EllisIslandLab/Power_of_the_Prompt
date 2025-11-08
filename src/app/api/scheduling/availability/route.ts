import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD format
    const coachId = searchParams.get('coach_id')

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Create admin client for service role queries
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse the requested date
    const requestedDate = new Date(date)
    const dayOfWeek = requestedDate.getDay() // 0=Sunday, 6=Saturday

    // Get coach (default to first admin if not specified)
    let targetCoachId = coachId
    if (!targetCoachId) {
      const { data: adminUsers } = await supabase
        .from('users')
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

    // Fetch availability slots for this day
    const { data: availabilitySlots, error: availError } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('coach_id', targetCoachId)
      .eq('is_active', true)
      .or(`day_of_week.eq.${dayOfWeek},specific_date.eq.${date}`)

    if (availError) {
      throw availError
    }

    if (!availabilitySlots || availabilitySlots.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          date,
          coach_id: targetCoachId,
          slots: []
        }
      })
    }

    // Fetch existing bookings for this date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: existingBookings, error: bookingError } = await supabase
      .from('session_bookings')
      .select('start_time, duration_minutes')
      .eq('coach_id', targetCoachId)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed'])

    if (bookingError) {
      throw bookingError
    }

    // Generate available time slots in 15-minute increments
    const availableSlots: Array<{
      start_time: string
      end_time: string
      available: boolean
      slot_type: 'check-in' | 'lvl-up' | 'both'
    }> = []

    for (const slot of availabilitySlots) {
      const [startHour, startMin] = slot.start_time.split(':').map(Number)
      const [endHour, endMin] = slot.end_time.split(':').map(Number)

      let currentTime = new Date(date)
      currentTime.setHours(startHour, startMin, 0, 0)

      const slotEnd = new Date(date)
      slotEnd.setHours(endHour, endMin, 0, 0)

      while (currentTime < slotEnd) {
        const slotStart = new Date(currentTime)
        const slot15End = new Date(currentTime.getTime() + 15 * 60 * 1000)
        const slot60End = new Date(currentTime.getTime() + 60 * 60 * 1000)

        // Check if this 15-min slot is booked
        const isBooked = existingBookings?.some(booking => {
          const bookingStart = new Date(booking.start_time)
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration_minutes * 60 * 1000)
          return slotStart >= bookingStart && slotStart < bookingEnd
        })

        // Check if the next 4 slots (60 min total) are all available for LVL UP
        let canFitLvlUp = true
        if (slot60End <= slotEnd) {
          for (let i = 0; i < 4; i++) {
            const checkSlotStart = new Date(currentTime.getTime() + i * 15 * 60 * 1000)
            const checkBooked = existingBookings?.some(booking => {
              const bookingStart = new Date(booking.start_time)
              const bookingEnd = new Date(bookingStart.getTime() + booking.duration_minutes * 60 * 1000)
              return checkSlotStart >= bookingStart && checkSlotStart < bookingEnd
            })
            if (checkBooked) {
              canFitLvlUp = false
              break
            }
          }
        } else {
          canFitLvlUp = false
        }

        const slotType = !isBooked && canFitLvlUp ? 'both' : !isBooked ? 'check-in' : null

        if (!isBooked) {
          availableSlots.push({
            start_time: slotStart.toISOString(),
            end_time: slot15End.toISOString(),
            available: true,
            slot_type: slotType as any
          })
        }

        // Move to next 15-minute slot
        currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000)
      }
    }

    const duration = Date.now() - startTime
    logger.info(
      {
        type: 'api',
        route: '/api/scheduling/availability',
        duration,
        date,
        coach_id: targetCoachId,
        slot_count: availableSlots.length
      },
      `Availability fetched (${duration}ms)`
    )

    return NextResponse.json({
      success: true,
      data: {
        date,
        coach_id: targetCoachId,
        slots: availableSlots
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      { type: 'api', route: '/api/scheduling/availability', error, duration },
      'Availability API Error'
    )

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch availability'
      },
      { status: 500 }
    )
  }
}
