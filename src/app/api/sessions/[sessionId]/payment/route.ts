import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(
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
    const { 
      paymentMethodId, 
      amount, 
      currency = 'usd',
      confirmPayment = true 
    } = body

    // Get session details
    const videoSession = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        host: true,
        consultation: true
      }
    })

    if (!videoSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Check if session requires payment
    if (videoSession.sessionType !== 'PAID_SESSION') {
      return NextResponse.json({ 
        error: 'This session does not require payment' 
      }, { status: 400 })
    }

    // Check if already paid
    if (videoSession.stripePaymentIntentId) {
      return NextResponse.json({ 
        error: 'Payment already completed for this session',
        paymentIntentId: videoSession.stripePaymentIntentId
      }, { status: 400 })
    }

    // Check if user is authorized to pay for this session
    const isParticipant = videoSession.participantUserIds.includes(session.user.id)
    const isHost = videoSession.hostUserId === session.user.id
    
    if (!isParticipant && !isHost) {
      return NextResponse.json({ 
        error: 'You are not authorized to pay for this session' 
      }, { status: 403 })
    }

    // Validate amount (you might want to define pricing in your system)
    const sessionPricing = getSessionPricing(videoSession.sessionType, videoSession.consultation?.type)
    
    if (!amount || amount !== sessionPricing.amount) {
      return NextResponse.json({ 
        error: `Invalid amount. Expected ${sessionPricing.amount} ${sessionPricing.currency}` 
      }, { status: 400 })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency,
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: confirmPayment,
      metadata: {
        sessionId: sessionId,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        userEmail: session.user.email || 'unknown@example.com',
        sessionName: videoSession.sessionName,
        sessionType: videoSession.sessionType
      },
      description: `Payment for ${videoSession.sessionName}`,
      receipt_email: session.user.email || undefined
    })

    // If payment succeeded, update the session
    if (paymentIntent.status === 'succeeded') {
      await prisma.videoSession.update({
        where: { id: sessionId },
        data: {
          stripePaymentIntentId: paymentIntent.id
        }
      })

      // Add user as participant if not already
      if (!isParticipant) {
        await prisma.videoSession.update({
          where: { id: sessionId },
          data: {
            participants: {
              connect: { id: session.user.id }
            }
          }
        })
      }

      return NextResponse.json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        },
        session: {
          id: videoSession.id,
          accessGranted: true,
          jitsiRoomId: videoSession.jitsiRoomId,
          joinUrl: `https://${process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'}/${videoSession.jitsiRoomId}`
        }
      })
    }

    // Payment needs additional action (like 3D Secure)
    if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        requiresAction: true,
        paymentIntent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          status: paymentIntent.status
        }
      })
    }

    // Payment failed
    return NextResponse.json({
      error: 'Payment failed',
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        last_payment_error: paymentIntent.last_payment_error
      }
    }, { status: 400 })

  } catch (error) {
    console.error('Error processing session payment:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        error: error.message,
        type: error.type,
        code: error.code
      }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params

    // Get session details
    const videoSession = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        consultation: true
      }
    })

    if (!videoSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get pricing info
    const pricing = getSessionPricing(videoSession.sessionType, videoSession.consultation?.type)
    
    // Check payment status
    let paymentStatus = 'pending'
    let stripePaymentIntent = null

    if (videoSession.stripePaymentIntentId) {
      try {
        stripePaymentIntent = await stripe.paymentIntents.retrieve(videoSession.stripePaymentIntentId)
        paymentStatus = stripePaymentIntent.status
      } catch (error) {
        console.error('Error retrieving payment intent:', error)
      }
    }

    return NextResponse.json({
      sessionId: sessionId,
      sessionName: videoSession.sessionName,
      sessionType: videoSession.sessionType,
      pricing: pricing,
      paymentStatus: paymentStatus,
      paymentRequired: videoSession.sessionType === 'PAID_SESSION' && !videoSession.stripePaymentIntentId,
      stripePaymentIntentId: videoSession.stripePaymentIntentId,
      paymentDetails: stripePaymentIntent ? {
        id: stripePaymentIntent.id,
        amount: stripePaymentIntent.amount,
        currency: stripePaymentIntent.currency,
        status: stripePaymentIntent.status,
        created: stripePaymentIntent.created
      } : null
    })

  } catch (error) {
    console.error('Error fetching session payment info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment information' },
      { status: 500 }
    )
  }
}

// Helper function to get session pricing
function getSessionPricing(sessionType: string, consultationType?: string) {
  // Define your pricing structure here
  // This is just an example - adjust based on your business model
  
  const pricing: Record<string, { amount: number; currency: string; description: string }> = {
    'PAID_SESSION': {
      amount: 9900, // $99.00 in cents
      currency: 'usd',
      description: 'Individual Coaching Session (60 minutes)'
    },
    'GROUP_COACHING': {
      amount: 4900, // $49.00 in cents
      currency: 'usd',
      description: 'Group Coaching Session (90 minutes)'
    },
    'WORKSHOP': {
      amount: 2900, // $29.00 in cents
      currency: 'usd',
      description: 'Workshop Session (120 minutes)'
    }
  }

  // Special pricing for premium consultations
  if (consultationType === 'PREMIUM') {
    return {
      amount: 14900, // $149.00 in cents
      currency: 'usd',
      description: 'Premium Consultation (90 minutes)'
    }
  }

  return pricing[sessionType] || {
    amount: 9900,
    currency: 'usd',
    description: 'Coaching Session'
  }
}