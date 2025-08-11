import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VideoSessionType, VideoSessionStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      sessionName,
      sessionType,
      scheduledStart,
      scheduledEnd,
      participantUserIds = [],
      maxParticipants = 10,
      waitingRoomEnabled = true,
      recordingEnabled = false,
      jitsiConfig = {},
      consultationId
    } = body

    // Validate required fields
    if (!sessionName || !scheduledStart || !scheduledEnd) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionName, scheduledStart, scheduledEnd' },
        { status: 400 }
      )
    }

    // Generate unique Jitsi room ID
    const timestamp = new Date(scheduledStart).getTime()
    const randomId = Math.random().toString(36).substr(2, 9)
    const jitsiRoomId = `session-${timestamp}-${randomId}`

    // Create video session
    const videoSession = await prisma.videoSession.create({
      data: {
        sessionName,
        jitsiRoomId,
        hostUserId: session.user.id,
        participantUserIds,
        sessionType: sessionType as VideoSessionType,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        sessionStatus: VideoSessionStatus.SCHEDULED,
        waitingRoomEnabled,
        maxParticipants,
        jitsiConfig,
        consultationId,
        participants: {
          connect: participantUserIds.map((id: string) => ({ id }))
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
        },
        consultation: true
      }
    })

    // Get Jitsi domain from environment
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
    
    // Return session with join URL
    return NextResponse.json({
      ...videoSession,
      joinUrl: `https://${jitsiDomain}/${jitsiRoomId}`,
      isHost: true
    })

  } catch (error) {
    console.error('Error creating video session:', error)
    return NextResponse.json(
      { error: 'Failed to create video session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionType = searchParams.get('sessionType')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      OR: [
        { hostUserId: session.user.id },
        { participants: { some: { id: session.user.id } } }
      ]
    }

    if (sessionType) {
      where.sessionType = sessionType as VideoSessionType
    }

    if (status) {
      where.sessionStatus = status as VideoSessionStatus
    }

    const sessions = await prisma.videoSession.findMany({
      where,
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
        },
        consultation: true
      },
      orderBy: {
        scheduledStart: 'asc'
      },
      take: limit,
      skip: offset
    })

    // Add join URLs and user role
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
    const sessionsWithUrls = sessions.map(videoSession => ({
      ...videoSession,
      joinUrl: `https://${jitsiDomain}/${videoSession.jitsiRoomId}`,
      isHost: videoSession.hostUserId === session.user.id,
      isParticipant: videoSession.participants.some(p => p.id === session.user.id)
    }))

    return NextResponse.json(sessionsWithUrls)

  } catch (error) {
    console.error('Error fetching video sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video sessions' },
      { status: 500 }
    )
  }
}