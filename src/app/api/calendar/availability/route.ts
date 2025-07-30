import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Custom availability calculation based on business hours
    // This integrates with our Airtable booking system to check for conflicts
    
    const now = new Date()
    const bufferTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)) // 3 hours minimum notice
    
    // Business hours: 6:00-10:00 AM and 2:00-6:00 PM EST
    const availableSlots = []
    
    // Check next 14 days for better availability display
    for (let day = 0; day < 14; day++) {
      const checkDate = new Date(bufferTime.getTime() + (day * 24 * 60 * 60 * 1000))
      
      // Skip weekends
      if (checkDate.getDay() === 0 || checkDate.getDay() === 6) continue
      
      // Morning slots: 6:00-10:00 AM EST
      for (let hour = 6; hour < 10; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(checkDate)
          slotTime.setHours(hour, minute, 0, 0)
          
          if (slotTime > bufferTime) {
            availableSlots.push({
              timestamp: slotTime.toISOString(),
              formatted: slotTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short',
                timeZone: 'America/New_York'
              }),
              date: slotTime.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }),
              time: slotTime.toLocaleDateString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZone: 'America/New_York'
              }),
              period: 'morning'
            })
          }
        }
      }
      
      // Afternoon slots: 2:00-6:00 PM EST
      for (let hour = 14; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(checkDate)
          slotTime.setHours(hour, minute, 0, 0)
          
          if (slotTime > bufferTime) {
            availableSlots.push({
              timestamp: slotTime.toISOString(),
              formatted: slotTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short',
                timeZone: 'America/New_York'
              }),
              date: slotTime.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }),
              time: slotTime.toLocaleDateString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZone: 'America/New_York'
              }),
              period: 'afternoon'
            })
          }
        }
      }
    }
    
    // TODO: Check Airtable for existing bookings and remove booked slots
    // This will be implemented in the booking management system
    
    const nextSlot = availableSlots.length > 0 ? availableSlots[0] : null
    
    return NextResponse.json({
      success: true,
      next_available: nextSlot?.formatted || "No slots available",
      next_available_timestamp: nextSlot?.timestamp || null,
      total_slots_available: availableSlots.length,
      available_slots: availableSlots.slice(0, 20), // Return first 20 slots for calendar display
      business_hours: {
        morning: "6:00 AM - 10:00 AM EST",
        afternoon: "2:00 PM - 6:00 PM EST",
        timezone: "America/New_York",
        weekdays_only: true,
        minimum_notice: "3 hours"
      }
    })
    
  } catch (error) {
    console.error('Error calculating availability:', error)
    
    // Fallback availability
    const fallbackTime = new Date(Date.now() + (4 * 60 * 60 * 1000))
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
      fallback: true,
      error: "Using fallback availability calculation"
    })
  }
}