import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { resendAdapter } from '@/adapters/ResendAdapter'
import { renderInviteEmail, EMAIL_FROM, EmailSubjects } from '@/lib/email-builder'
import { logger } from '@/lib/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, tier, expiresInDays = 7, createdBy, stripeSessionId } = await request.json()

    // Create a Supabase client with cookie access for server-side auth
    const cookieStore = await cookies()

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    // Get the authenticated user's ID
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    // Allow unauthenticated requests from payment flow if Stripe session is provided
    let authenticatedUserId: string | null = null

    if (authUser) {
      // User is authenticated - use their ID
      authenticatedUserId = authUser.id
    } else if (stripeSessionId && createdBy === 'payment-system') {
      // Payment flow - verify the Stripe session exists and matches the email
      try {
        const stripe = await import('stripe')
        const stripeClient = new stripe.default(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2025-06-30.basil'
        })

        const session = await stripeClient.checkout.sessions.retrieve(stripeSessionId)

        if (!session || session.customer_details?.email?.toLowerCase() !== email.toLowerCase()) {
          return NextResponse.json(
            { error: 'Invalid Stripe session or email mismatch' },
            { status: 401 }
          )
        }

        // Valid payment session - use 'payment-system' as the creator
        authenticatedUserId = null // Will be stored as NULL in created_by
        logger.info(
          { sessionId: stripeSessionId, email },
          'Processing invite for verified payment session'
        )
      } catch (stripeError) {
        logger.error(
          { error: stripeError, sessionId: stripeSessionId },
          'Failed to verify Stripe session'
        )
        return NextResponse.json(
          { error: 'Failed to verify payment session' },
          { status: 401 }
        )
      }
    } else {
      // No authentication and no valid payment session
      return NextResponse.json(
        { error: 'Unauthorized - must be signed in to create invites' },
        { status: 401 }
      )
    }

    // Use service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Validate input
    if (!email || !tier) {
      return NextResponse.json(
        { error: 'Email and tier are required' },
        { status: 400 }
      )
    }

    if (!['free', 'full'].includes(tier)) {
      return NextResponse.json(
        { error: 'Tier must be either "free" or "full"' },
        { status: 400 }
      )
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex')

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Check if there's already an active invite for this email (use admin client)
    const { data: existingInvite } = await supabaseAdmin
      .from('invite_tokens' as any)
      .select('*')
      .eq('email', email.toLowerCase())
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single() as any

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An active invite already exists for this email' },
        { status: 409 }
      )
    }

    // Create invite token (use admin client for insert)
    const { data: invite, error } = await supabaseAdmin
      .from('invite_tokens' as any)
      .insert({
        token,
        email: email.toLowerCase(),
        full_name: fullName || null,
        tier,
        expires_at: expiresAt.toISOString(),
        created_by: authenticatedUserId // Use authenticated user's UUID or NULL for payment system
      })
      .select()
      .single() as any

    if (error) {
      console.error('Failed to create invite token:', error)
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      )
    }

    // Generate signup URL
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || 'weblaunchacademy.com'
    const signupUrl = `${protocol}://${host}/signup?token=${token}`

    // Send invite email
    try {
      // Get the inviter's name from the users table (if authenticated)
      let inviterName = 'Web Launch Academy'

      if (authenticatedUserId) {
        const { data: inviter } = await supabaseAdmin
          .from('users' as any)
          .select('full_name')
          .eq('id', authenticatedUserId)
          .single() as any

        inviterName = inviter?.full_name || 'Web Launch Academy'
      }

      // Render the email
      const emailHtml = await renderInviteEmail({
        recipientName: fullName,
        signupUrl,
        inviterName,
        tier: tier as 'basic' | 'full',
        expiresInDays
      })

      // Send via Resend
      await resendAdapter.sendEmail({
        from: EMAIL_FROM,
        to: email,
        subject: EmailSubjects.INVITE,
        html: emailHtml,
        tags: [
          { name: 'type', value: 'invite' },
          { name: 'tier', value: tier }
        ]
      })

      logger.info(
        { type: 'email', email, tier, inviteId: invite.id },
        'Invite email sent successfully'
      )
    } catch (emailError) {
      // Log the error but don't fail the invite creation
      logger.error(
        { type: 'email', email, error: emailError },
        'Failed to send invite email'
      )
      // Still return success since the invite was created
    }

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        token: invite.token,
        email: invite.email,
        tier: invite.tier,
        expires_at: invite.expires_at,
        signup_url: signupUrl
      },
      message: `Invite created and email sent to ${email}`
    })

  } catch (error) {
    console.error('Generate invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}