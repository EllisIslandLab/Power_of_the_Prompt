import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VideoSessionType, VideoSessionStatus } from '@prisma/client'

// Test endpoint to create video sessions without Airtable dependency
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sessionName = "Test Session",
      sessionType = "FREE_CONSULTATION",
      scheduledStart,
      duration = 30,
      userEmail = "test@example.com",
      userName = "Test User"
    } = body

    // Use provided time or default to 10 minutes from now
    const startTime = scheduledStart ? new Date(scheduledStart) : new Date(Date.now() + 10 * 60 * 1000)
    const endTime = new Date(startTime.getTime() + (duration * 60 * 1000))

    // Find or create test user
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userName,
          email: userEmail,
          role: 'STUDENT'
        }
      })
    }

    // Find admin user to host
    const hostUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!hostUser) {
      return NextResponse.json({
        error: 'No admin user found. Please create an admin user first.'
      }, { status: 400 })
    }

    // Generate room ID
    const timestamp = startTime.getTime()
    const roomId = `test-session-${timestamp}-${Math.random().toString(36).substr(2, 9)}`

    // Create video session
    const videoSession = await prisma.videoSession.create({
      data: {
        sessionName,
        jitsiRoomId: roomId,
        hostUserId: hostUser.id,
        participantUserIds: [user.id],
        sessionType: sessionType as VideoSessionType,
        scheduledStart: startTime,
        scheduledEnd: endTime,
        sessionStatus: VideoSessionStatus.SCHEDULED,
        waitingRoomEnabled: true,
        maxParticipants: 2,
        participants: {
          connect: { id: user.id }
        }
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Create consultation record
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

    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'

    return NextResponse.json({
      success: true,
      message: 'Test video session created successfully',
      session: {
        id: videoSession.id,
        sessionName: videoSession.sessionName,
        jitsiRoomId: roomId,
        joinUrl: `https://${jitsiDomain}/${roomId}`,
        scheduledStart: startTime.toISOString(),
        scheduledEnd: endTime.toISOString(),
        host: videoSession.host,
        participants: videoSession.participants,
        consultationId: consultation.id
      },
      testInstructions: {
        portal: 'Go to /portal/collaboration to see this session',
        directJoin: `Visit https://${jitsiDomain}/${roomId} to join directly`,
        apiCheck: `GET /api/sessions/user/${user.id} to see user's sessions`
      }
    })

  } catch (error) {
    console.error('Error creating test session:', error)
    return NextResponse.json({
      error: 'Failed to create test session',
      details: (error as Error)?.message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error)?.stack : undefined
    }, { status: 500 })
  }
}