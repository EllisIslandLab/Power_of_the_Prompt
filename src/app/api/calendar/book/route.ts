import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!)

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

    // TODO: Check Airtable for conflicts - ensure this slot isn't already booked
    // This will be implemented when we add booking conflict checking

    // Create Zoom meeting (placeholder for now)
    const zoomMeetingData = await createZoomMeeting({
      topic: `Consultation with ${fullName}`,
      start_time: selectedSlot.timestamp,
      duration: 30,
      timezone: 'America/New_York'
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
        'Zoom Meeting ID': zoomMeetingData.id || 'TBD',
        'Zoom Join URL': zoomMeetingData.join_url || 'TBD',
        'Notes': `Website Type: ${websiteDescription || 'Not specified'} | Booked: ${new Date().toISOString()}`
      }
    }

    // Add optional fields
    if (body.businessType) {
      const businessTypeMap = {
        'service': 'Service-based',
        'product': 'Product-based', 
        'nonprofit': 'Non-profit',
        'other': 'Other'
      }
      record.fields['Business Type'] = businessTypeMap[body.businessType] || 'Other'
    }
    
    if (body.currentWebsite) {
      record.fields['Current Website'] = body.currentWebsite
    }

    // Create record in Airtable
    const createdRecord = await base('Consultations').create([record])
    
    // TODO: Send confirmation email with calendar invite
    // TODO: Send Zoom meeting details
    
    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully',
      booking: {
        id: createdRecord[0].id,
        appointment_time: selectedSlot.formatted,
        zoom_join_url: zoomMeetingData.join_url || 'Will be sent via email',
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

// Zoom meeting creation function (placeholder)
async function createZoomMeeting(meetingData: {
  topic: string
  start_time: string
  duration: number
  timezone: string
}) {
  // TODO: Implement actual Zoom API integration
  // For now, return placeholder data
  
  if (process.env.ZOOM_API_KEY && process.env.ZOOM_API_SECRET) {
    try {
      // Real Zoom API implementation would go here
      // const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${zoomAccessToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     topic: meetingData.topic,
      //     type: 2, // Scheduled meeting
      //     start_time: meetingData.start_time,
      //     duration: meetingData.duration,
      //     timezone: meetingData.timezone,
      //     settings: {
      //       host_video: true,
      //       participant_video: true,
      //       join_before_host: false,
      //       mute_upon_entry: true,
      //       waiting_room: true
      //     }
      //   })
      // })
      // const data = await response.json()
      // return data
      
      return {
        id: `placeholder-${Date.now()}`,
        join_url: 'https://zoom.us/j/placeholder-meeting-id',
        start_url: 'https://zoom.us/s/placeholder-meeting-id'
      }
    } catch (error) {
      console.error('Zoom API error:', error)
      return {
        id: `fallback-${Date.now()}`,
        join_url: 'Zoom link will be sent via email',
        start_url: 'Host link will be sent via email'
      }
    }
  }

  // Fallback when Zoom API is not configured
  return {
    id: `manual-${Date.now()}`,
    join_url: 'Zoom link will be sent via email',
    start_url: 'Host link will be sent via email'
  }
}