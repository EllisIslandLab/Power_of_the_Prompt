import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VideoSessionStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params
    const userId = session.user.id

    // Get session details
    const videoSession = await prisma.videoSession.findUnique({
      where: { id: sessionId },
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
      }
    })

    if (!videoSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const isHost = videoSession.hostUserId === userId
    const isParticipant = videoSession.participants.some(p => p.id === userId)
    
    // Check basic authorization
    if (!isHost && !isParticipant) {
      return NextResponse.json({ 
        hasAccess: false,
        reason: 'Not authorized to access this session',
        canRequest: false
      }, { status: 403 })
    }

    // Check session status
    if (videoSession.sessionStatus === VideoSessionStatus.CANCELLED) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'Session has been cancelled',
        canRequest: false,
        session: {
          id: videoSession.id,
          sessionName: videoSession.sessionName,
          sessionStatus: videoSession.sessionStatus
        }
      })
    }

    // Check timing
    const now = new Date()
    const startTime = new Date(videoSession.scheduledStart)
    const endTime = new Date(videoSession.scheduledEnd)
    
    // Allow joining 15 minutes before scheduled start
    const joinWindow = new Date(startTime.getTime() - 15 * 60 * 1000)
    
    if (now < joinWindow) {
      const minutesUntilJoin = Math.ceil((joinWindow.getTime() - now.getTime()) / (1000 * 60))
      return NextResponse.json({
        hasAccess: false,
        reason: `Session starts in ${minutesUntilJoin} minutes. You can join 15 minutes before the scheduled time.`,
        canRequest: false,
        timeUntilAccess: joinWindow.toISOString(),
        session: {
          id: videoSession.id,
          sessionName: videoSession.sessionName,
          scheduledStart: videoSession.scheduledStart,
          sessionStatus: videoSession.sessionStatus
        }
      })
    }
    
    if (now > endTime) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'Session has ended',
        canRequest: false,
        session: {
          id: videoSession.id,
          sessionName: videoSession.sessionName,
          scheduledEnd: videoSession.scheduledEnd,
          sessionStatus: videoSession.sessionStatus,
          recordingUrl: videoSession.recordingUrl
        }
      })
    }

    // Check payment for paid sessions
    if (videoSession.sessionType === 'PAID_SESSION' && !videoSession.stripePaymentIntentId && !isHost) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'Payment required to access this session',
        canRequest: true,
        paymentRequired: true,
        session: {
          id: videoSession.id,
          sessionName: videoSession.sessionName,
          sessionType: videoSession.sessionType
        }
      }, { status: 402 })
    }

    // Check participant limit
    const currentParticipantCount = videoSession.participants.length
    const maxParticipants = videoSession.maxParticipants || 10
    
    if (!isHost && !isParticipant && currentParticipantCount >= maxParticipants) {
      return NextResponse.json({
        hasAccess: false,
        reason: `Session is at maximum capacity (${maxParticipants} participants)`,
        canRequest: false,
        session: {
          id: videoSession.id,
          sessionName: videoSession.sessionName,
          currentParticipants: currentParticipantCount,
          maxParticipants: maxParticipants
        }
      })
    }

    // Check waiting room settings
    const waitingRoomRequired = videoSession.waitingRoomEnabled && 
                               !isHost && 
                               videoSession.sessionStatus === VideoSessionStatus.SCHEDULED

    // All checks passed - user has access
    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
    
    return NextResponse.json({
      hasAccess: true,
      waitingRoomRequired,
      session: {
        id: videoSession.id,
        sessionName: videoSession.sessionName,
        jitsiRoomId: videoSession.jitsiRoomId,
        joinUrl: `https://${jitsiDomain}/${videoSession.jitsiRoomId}`,
        sessionType: videoSession.sessionType,
        scheduledStart: videoSession.scheduledStart,
        scheduledEnd: videoSession.scheduledEnd,
        sessionStatus: videoSession.sessionStatus,
        waitingRoomEnabled: videoSession.waitingRoomEnabled,
        maxParticipants: videoSession.maxParticipants,
        currentParticipants: currentParticipantCount,
        jitsiConfig: videoSession.jitsiConfig,
        host: videoSession.host,
        participants: videoSession.participants,
        isHost,
        isParticipant,
        recordingEnabled: videoSession.sessionType !== 'FREE_CONSULTATION'
      }
    })

  } catch (error) {
    console.error('Error checking session access:', error)
    return NextResponse.json(
      { error: 'Failed to verify session access' },
      { status: 500 }
    )
  }
}