import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VideoSessionStatus } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = params
    const body = await request.json()
    const { userId } = body

    // Verify user is trying to join as themselves (unless admin)
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get session details
    const videoSession = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        host: true,
        participants: true,
        consultation: true
      }
    })

    if (!videoSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Check if user is authorized to join
    const isHost = videoSession.hostUserId === userId
    const isParticipant = videoSession.participants.some(p => p.id === userId)
    
    if (!isHost && !isParticipant) {
      return NextResponse.json({ error: 'Not authorized to join this session' }, { status: 403 })
    }

    // Check if session is joinable
    const now = new Date()
    const startTime = new Date(videoSession.scheduledStart)
    const endTime = new Date(videoSession.scheduledEnd)
    
    // Allow joining 15 minutes before scheduled start
    const joinWindow = new Date(startTime.getTime() - 15 * 60 * 1000)
    
    if (now < joinWindow) {
      return NextResponse.json({ 
        error: 'Session has not started yet. You can join 15 minutes before the scheduled time.' 
      }, { status: 400 })
    }
    
    if (now > endTime) {
      return NextResponse.json({ error: 'Session has ended' }, { status: 400 })
    }
    
    if (videoSession.sessionStatus === VideoSessionStatus.CANCELLED) {
      return NextResponse.json({ error: 'Session has been cancelled' }, { status: 400 })
    }

    // For paid sessions, verify payment
    if (videoSession.sessionType === 'PAID_SESSION' && !videoSession.stripePaymentIntentId && !isHost) {
      return NextResponse.json({ 
        error: 'Payment required to join this session',
        paymentRequired: true,
        sessionId: sessionId
      }, { status: 402 })
    }

    // Check participant limit
    if (!isHost && !isParticipant && videoSession.participants.length >= (videoSession.maxParticipants || 10)) {
      return NextResponse.json({ error: 'Session is at maximum capacity' }, { status: 400 })
    }

    // Update session status to ACTIVE if it's the first person joining
    let updateData: any = {}
    
    if (videoSession.sessionStatus === VideoSessionStatus.SCHEDULED) {
      updateData.sessionStatus = VideoSessionStatus.ACTIVE
      updateData.actualStart = now
    }

    // If user is not already a participant, add them
    if (!isParticipant && !isHost) {
      updateData.participants = {
        connect: { id: userId }
      }
    }

    // Update session if needed
    if (Object.keys(updateData).length > 0) {
      await prisma.videoSession.update({
        where: { id: sessionId },
        data: updateData
      })
    }

    // Log join event (optional - could be used for analytics)
    console.log(`User ${userId} joined session ${sessionId}`)

    // Get updated session info
    const updatedSession = await prisma.videoSession.findUnique({
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
        }
      }
    })

    const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'

    return NextResponse.json({
      message: 'Successfully joined session',
      session: {
        ...updatedSession,
        joinUrl: `https://${jitsiDomain}/${updatedSession!.jitsiRoomId}`,
        isHost: updatedSession!.hostUserId === userId,
        isParticipant: updatedSession!.participants.some(p => p.id === userId)
      }
    })

  } catch (error) {
    console.error('Error joining session:', error)
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    )
  }
}