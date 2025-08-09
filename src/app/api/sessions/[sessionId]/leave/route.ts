import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VideoSessionStatus } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params
    const body = await request.json()
    const { userId } = body

    // Verify user is trying to leave as themselves (unless admin)
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get session details
    const videoSession = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        host: true,
        participants: true
      }
    })

    if (!videoSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const isHost = videoSession.hostUserId === userId
    const isParticipant = videoSession.participants.some(p => p.id === userId)

    if (!isHost && !isParticipant) {
      return NextResponse.json({ error: 'You are not in this session' }, { status: 400 })
    }

    // Remove user from participants if they're a participant (not host)
    if (isParticipant && !isHost) {
      await prisma.videoSession.update({
        where: { id: sessionId },
        data: {
          participants: {
            disconnect: { id: userId }
          }
        }
      })
    }

    // If host is leaving or everyone has left, check if session should be marked as completed
    const updatedSession = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: true
      }
    })

    let sessionComplete = false

    // Mark session as completed if:
    // 1. Host leaves and there are no participants
    // 2. Last participant leaves
    // 3. Session has passed its scheduled end time
    const now = new Date()
    const endTime = new Date(videoSession.scheduledEnd)
    const noParticipantsLeft = !updatedSession || updatedSession.participants.length === 0
    const pastEndTime = now > endTime

    if ((isHost && noParticipantsLeft) || pastEndTime || (noParticipantsLeft && !isHost)) {
      await prisma.videoSession.update({
        where: { id: sessionId },
        data: {
          sessionStatus: VideoSessionStatus.COMPLETED,
          actualEnd: now
        }
      })
      sessionComplete = true
    }

    // Log leave event (optional - could be used for analytics)
    console.log(`User ${userId} left session ${sessionId}${sessionComplete ? ' (session completed)' : ''}`)

    return NextResponse.json({
      message: 'Successfully left session',
      sessionCompleted: sessionComplete,
      userId: userId,
      sessionId: sessionId
    })

  } catch (error) {
    console.error('Error leaving session:', error)
    return NextResponse.json(
      { error: 'Failed to leave session' },
      { status: 500 }
    )
  }
}