import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VideoSessionType, VideoSessionStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const viewMode = searchParams.get('viewMode') || 'all'
    const includePast = searchParams.get('includePast') === 'true'

    // Check if user can access these sessions
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build where clause based on view mode
    let where: any = {}

    switch (viewMode) {
      case 'host':
        where.hostUserId = userId
        break
      case 'participant':
        where.participants = { some: { id: userId } }
        break
      case 'all':
      default:
        where.OR = [
          { hostUserId: userId },
          { participants: { some: { id: userId } } }
        ]
        break
    }

    // Filter by time if needed
    if (!includePast) {
      where.scheduledEnd = {
        gte: new Date()
      }
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
        consultation: {
          select: {
            id: true,
            type: true,
            status: true
          }
        }
      },
      orderBy: [
        { scheduledStart: 'asc' }
      ]
    })

    // Add join URLs and user permissions
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
    const sessionsWithMetadata = sessions.map(session => ({
      ...session,
      joinUrl: `https://${jitsiDomain}/${session.jitsiRoomId}`,
      isHost: session.hostUserId === userId,
      isParticipant: session.participants.some(p => p.id === userId),
      canJoin: canUserJoinSession(session, userId),
      timeUntilStart: getTimeUntilStart(session.scheduledStart),
      duration: getDurationMinutes(session.scheduledStart, session.scheduledEnd)
    }))

    return NextResponse.json(sessionsWithMetadata)

  } catch (error) {
    console.error('Error fetching user sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

function canUserJoinSession(session: any, userId: string): boolean {
  const now = new Date()
  const startTime = new Date(session.scheduledStart)
  const endTime = new Date(session.scheduledEnd)
  
  // Can join 15 minutes before scheduled start
  const joinWindow = new Date(startTime.getTime() - 15 * 60 * 1000)
  
  // Check if within join window and session isn't cancelled
  const withinTimeWindow = now >= joinWindow && now <= endTime
  const sessionActive = session.sessionStatus !== VideoSessionStatus.CANCELLED
  const userAuthorized = session.hostUserId === userId || 
                        session.participants.some((p: any) => p.id === userId)
  
  // For paid sessions, check if payment is completed
  const paymentValid = session.sessionType !== VideoSessionType.PAID_SESSION || 
                      !!session.stripePaymentIntentId
  
  return withinTimeWindow && sessionActive && userAuthorized && paymentValid
}

function getTimeUntilStart(scheduledStart: Date): number {
  const now = new Date()
  const start = new Date(scheduledStart)
  return Math.max(0, start.getTime() - now.getTime())
}

function getDurationMinutes(start: Date, end: Date): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60))
}