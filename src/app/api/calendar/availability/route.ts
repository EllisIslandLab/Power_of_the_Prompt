import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabase(true) // Use service role for database access

    const now = new Date()
    const bufferTime = new Date(now.getTime()) // No buffer as per requirements
    const highlight72h = new Date(now.getTime() + (72 * 60 * 60 * 1000)) // 72 hours for green highlight

    // Business hours: 9:00 AM - 5:00 PM EST (60-minute slots)
    const availableSlots = []

    // Check next 60 days (2 months) for availability
    for (let day = 0; day < 60; day++) {
      const checkDate = new Date(bufferTime.getTime() + (day * 24 * 60 * 60 * 1000))

      // Skip weekends
      if (checkDate.getDay() === 0 || checkDate.getDay() === 6) continue

      // Check if it's a federal holiday
      const dateStr = checkDate.toISOString().split('T')[0]
      const { data: holidays } = await supabase
        .from('federal_holidays')
        .select('*')
        .eq('holiday_date', dateStr)
        .limit(1)

      if (holidays && holidays.length > 0) continue

      // Generate slots from 9 AM to 4 PM (last slot starts at 4 PM, ends at 5 PM)
      // Slots at: 9:00, 10:00, 11:00, 12:00, 1:00, 2:00, 3:00, 4:00
      for (let hour = 9; hour <= 16; hour++) {
        const slotTime = new Date(checkDate)
        slotTime.setHours(hour, 0, 0, 0)

        // Convert to EST/EDT
        const estTime = new Date(slotTime.toLocaleString('en-US', { timeZone: 'America/New_York' }))

        if (slotTime < bufferTime) continue

        // Check if slot is blocked in database
        const slotEnd = new Date(slotTime.getTime() + (60 * 60 * 1000))
        const { data: blocks } = await supabase
          .from('consultation_blocks')
          .select('*')
          .or(`and(start_time.lte.${slotTime.toISOString()},end_time.gt.${slotTime.toISOString()}),and(start_time.lt.${slotEnd.toISOString()},end_time.gte.${slotEnd.toISOString()}),and(start_time.gte.${slotTime.toISOString()},end_time.lte.${slotEnd.toISOString()})`)

        if (blocks && blocks.length > 0) continue

        // Format the time
        const formatted = slotTime.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
          timeZone: 'America/New_York'
        })

        const dateFormatted = slotTime.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })

        const timeFormatted = slotTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/New_York'
        })

        // Determine period for UI grouping
        const period = hour < 12 ? 'morning' : 'afternoon'

        // Check if within 72 hours for green highlight
        const isWithin72h = slotTime <= highlight72h

        availableSlots.push({
          timestamp: slotTime.toISOString(),
          formatted,
          date: dateFormatted,
          time: timeFormatted,
          period,
          isWithin72h,
          monthYear: slotTime.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          })
        })
      }
    }

    const nextSlot = availableSlots.length > 0 ? availableSlots[0] : null

    return NextResponse.json({
      success: true,
      next_available: nextSlot?.formatted || "No slots available",
      next_available_timestamp: nextSlot?.timestamp || null,
      total_slots_available: availableSlots.length,
      available_slots: availableSlots, // Return all slots for full calendar display
      business_hours: {
        hours: "9:00 AM - 5:00 PM EST",
        timezone: "America/New_York",
        weekdays_only: true,
        slot_duration: "60 minutes",
        booking_window: "2 months"
      }
    })

  } catch (error) {
    console.error('Error calculating availability:', error)

    // Fallback availability
    const fallbackTime = new Date(Date.now() + (24 * 60 * 60 * 1000))
    const fallbackFormatted = fallbackTime.toLocaleDateString('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: 'America/New_York'
    })

    return NextResponse.json({
      success: true,
      next_available: fallbackFormatted,
      next_available_timestamp: fallbackTime.toISOString(),
      available_slots: [],
      fallback: true,
      error: "Using fallback availability calculation"
    })
  }
}