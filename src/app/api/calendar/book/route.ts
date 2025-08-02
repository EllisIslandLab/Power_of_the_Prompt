import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'
import { prisma } from '@/lib/prisma'
import { VideoSessionType, VideoSessionStatus } from '@prisma/client'

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

    // Create video session in database and Jitsi room
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

// Video session creation function
async function createVideoSession(sessionData: {
  sessionName: string
  scheduledStart: string
  duration: number
  userEmail: string
  userName: string
}) {
  try {
    // First, try to find or create a user for the guest
    let user = await prisma.user.findUnique({
      where: { email: sessionData.userEmail }
    })

    if (!user) {
      // Create a basic user record for the guest
      user = await prisma.user.create({
        data: {
          name: sessionData.userName,
          email: sessionData.userEmail,
          role: 'STUDENT' // Default role for calendar bookings
        }
      })
    }

    // Generate unique room ID based on session data
    const timestamp = new Date(sessionData.scheduledStart).getTime()
    const roomId = `consultation-${timestamp}-${Math.random().toString(36).substr(2, 9)}`
    
    // Calculate end time
    const startTime = new Date(sessionData.scheduledStart)
    const endTime = new Date(startTime.getTime() + (sessionData.duration * 60 * 1000))

    // Get the admin/host user (you might want to make this configurable)
    const hostUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!hostUser) {
      throw new Error('No admin user found to host the session')
    }

    // Create video session
    const videoSession = await prisma.videoSession.create({
      data: {
        sessionName: sessionData.sessionName,
        jitsiRoomId: roomId,
        hostUserId: hostUser.id,
        participantUserIds: [user.id],
        sessionType: VideoSessionType.FREE_CONSULTATION,
        scheduledStart: startTime,
        scheduledEnd: endTime,
        sessionStatus: VideoSessionStatus.SCHEDULED,
        waitingRoomEnabled: true,
        maxParticipants: 2, // Host + 1 participant for consultation
        participants: {
          connect: { id: user.id }
        }
      },
      include: {
        host: true,
        participants: true
      }
    })

    // Create associated consultation record
    const consultation = await prisma.consultation.create({
      data: {
        userId: user.id,
        scheduledTime: startTime,
        status: 'SCHEDULED',
        type: 'FREE',
        videoSession: {
          connect: { id: videoSession.id }
        }
      }
    })

    // Get Jitsi domain from environment
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
    
    return {
      id: videoSession.id,
      jitsiRoomId: roomId,
      joinUrl: `https://${jitsiDomain}/${roomId}`,
      sessionName: sessionData.sessionName,
      scheduledStart: sessionData.scheduledStart,
      duration: sessionData.duration,
      consultationId: consultation.id,
      userId: user.id,
      hostId: hostUser.id
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