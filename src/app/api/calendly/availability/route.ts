import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // In a real implementation, this would connect to Calendly API
    // For now, we'll calculate the next available slot based on business hours
    
    const now = new Date()
    const bufferTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)) // 3 hours ahead
    
    // Business hours: 6:00-10:00 AM and 2:00-6:00 PM EST
    const availableSlots = []
    
    // Check next 7 days
    for (let day = 0; day < 7; day++) {
      const checkDate = new Date(bufferTime.getTime() + (day * 24 * 60 * 60 * 1000))
      
      // Skip weekends
      if (checkDate.getDay() === 0 || checkDate.getDay() === 6) continue
      
      // Morning slots: 6:00-10:00 AM
      for (let hour = 6; hour < 10; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(checkDate)
          slotTime.setHours(hour, minute, 0, 0)
          
          if (slotTime > bufferTime) {
            availableSlots.push(slotTime)
          }
        }
      }
      
      // Afternoon slots: 2:00-6:00 PM
      for (let hour = 14; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(checkDate)
          slotTime.setHours(hour, minute, 0, 0)
          
          if (slotTime > bufferTime) {
            availableSlots.push(slotTime)
          }
        }
      }
    }
    
    // Get the next available slot
    const nextSlot = availableSlots.length > 0 ? availableSlots[0] : null
    
    if (nextSlot) {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
        timeZone: 'America/New_York'
      }
      
      const formattedTime = nextSlot.toLocaleDateString('en-US', options)
      
      return NextResponse.json({
        success: true,
        next_available: formattedTime,
        next_available_timestamp: nextSlot.toISOString(),
        total_slots_available: availableSlots.length
      })
    } else {
      return NextResponse.json({
        success: true,
        next_available: "No slots available",
        message: "Please check back later or request a call back"
      })
    }
    
  } catch (error) {
    console.error('Error calculating availability:', error)
    
    // Fallback availability
    const fallbackTime = new Date(Date.now() + (4 * 60 * 60 * 1000))
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: 'America/New_York'
    }
    
    return NextResponse.json({
      success: true,
      next_available: fallbackTime.toLocaleDateString('en-US', options),
      fallback: true
    })
  }
}

/* 
To integrate with real Calendly API, replace the above logic with:

export async function GET() {
  try {
    const response = await fetch(`https://api.calendly.com/users/${process.env.CALENDLY_USER_UUID}/availability_schedules`, {
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    // Process Calendly response to find next available slot
    
    return NextResponse.json({
      success: true,
      next_available: processedAvailability,
      source: 'calendly'
    })
  } catch (error) {
    // Fallback logic here
  }
}
*/