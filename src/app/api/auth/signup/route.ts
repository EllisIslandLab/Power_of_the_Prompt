import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateRequest } from '@/lib/validation'
import { signUpSchema } from '@/lib/schemas'
import { logger, logSecurity } from '@/lib/logger'
import { rateLimiter, RateLimitConfigs } from '@/lib/rate-limiter'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Rate limiting - prevent automated account creation
    const ip = request.headers.get('x-real-ip') ||
              request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
              'anonymous'

    const rateLimit = await rateLimiter.checkLimit('/api/auth/signup', ip, RateLimitConfigs.AUTH)

    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.reset - Date.now()) / 1000)
      logger.warn(
        { type: 'ratelimit', route: '/api/auth/signup', ip, retryAfter },
        'Rate limit exceeded for signup'
      )

      return NextResponse.json(
        {
          error: 'Too many sign-up attempts',
          message: `Please try again in ${retryAfter} seconds`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      )
    }

    // Validate request with Zod schema
    const validation = await validateRequest(request, signUpSchema)
    if (!validation.success) {
      return validation.error
    }

    const { fullName, email, password, token: inviteToken } = validation.data

    logger.info({ type: 'auth', email, action: 'signup_attempt' }, 'Sign-up attempt')

    // Check if invite token is provided (required for invite-based signup)
    if (!inviteToken) {
      logger.warn({ type: 'auth', email }, 'Sign-up attempt without invite token')
      return NextResponse.json(
        { error: 'Invite token is required' },
        { status: 400 }
      )
    }

    // Validate invite token
    const { data: invite, error: inviteError } = await supabase
      .from('invite_tokens' as any)
      .select('*')
      .eq('token', inviteToken)
      .single() as any

    if (inviteError || !invite) {
      logger.warn({ type: 'auth', email, inviteToken }, 'Invalid invite token')
      return NextResponse.json(
        { error: 'Invalid invite token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date(invite.expires_at) < new Date()) {
      logger.warn({ type: 'auth', email, inviteToken, expiresAt: invite.expires_at }, 'Invite token expired')
      return NextResponse.json(
        { error: 'Invite token has expired' },
        { status: 400 }
      )
    }

    // Check if token has already been used
    if (invite.used_at) {
      logger.warn({ type: 'auth', email, inviteToken, usedAt: invite.used_at }, 'Invite token already used')
      return NextResponse.json(
        { error: 'Invite token has already been used' },
        { status: 400 }
      )
    }

    // Ensure email matches the invite
    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      logger.warn(
        { type: 'auth', email, inviteEmail: invite.email, inviteToken },
        'Email does not match invite'
      )
      return NextResponse.json(
        { error: 'Email does not match the invite' },
        { status: 400 }
      )
    }

    logger.info({ type: 'auth', email, tier: invite.tier }, 'Invite token validated')

    // Check if user already exists in auth.users
    const { data: { users: existingAuthUsers } } = await supabase.auth.admin.listUsers()
    const existingAuthUser = existingAuthUsers?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingAuthUser) {
      logger.warn(
        { type: 'auth', email, userId: existingAuthUser.id, emailConfirmed: !!existingAuthUser.email_confirmed_at },
        'User already exists in auth.users'
      )

      if (existingAuthUser.email_confirmed_at) {
        return NextResponse.json(
          { error: 'This email is already registered and verified. Please sign in instead.' },
          { status: 409 }
        )
      } else {
        return NextResponse.json(
          { error: 'This email is already registered but not verified. Please check your email for the verification link, or contact support.' },
          { status: 409 }
        )
      }
    }

    // Use Supabase's built-in auth system
    logger.info(
      { type: 'auth', email: email.toLowerCase(), fullName },
      'Attempting to create auth user'
    )

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    logger.info(
      { type: 'auth', email, hasData: !!data, hasError: !!error, hasUser: !!data?.user },
      'Auth signUp response'
    )

    if (error) {
      // Log the full error for debugging
      logger.error(
        { type: 'auth', email, error: error.message, errorCode: error.code, fullError: error },
        'Supabase Auth signUp failed'
      )
      console.error('Signup error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        email
      })

      // Handle specific error cases
      if (error.message.includes('already registered')) {
        // For existing users, update their profile and resend verification email
        try {
          // First, get the existing user to update their auth metadata
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

          if (listError) {
            logger.error({ type: 'auth', email, error: listError }, 'Failed to list users')
          }

          const existingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

          if (existingUser) {
            // Check if user is already verified
            if (existingUser.email_confirmed_at) {
              logger.info({ type: 'auth', email, userId: existingUser.id }, 'User already verified, redirecting to sign-in')
              return NextResponse.json(
                { error: 'This email is already verified. Please sign in instead.' },
                { status: 409 }
              )
            }

            // Update auth user metadata with new full name
            await supabase.auth.admin.updateUserById(existingUser.id, {
              user_metadata: { full_name: fullName }
            })
            logger.info({ type: 'auth', email, userId: existingUser.id }, 'Updated user metadata')
          }

          // Update the user profile with new full name
          const { error: updateError } = await supabase
            .from('users' as any)
            .update({
              full_name: fullName,
              updated_at: new Date().toISOString()
            })
            .eq('email', email.toLowerCase())

          if (updateError) {
            logger.error({ type: 'auth', email, error: updateError }, 'Failed to update user profile')
          }

          // Resend verification email via Supabase
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email.toLowerCase()
          })

          if (resendError) {
            logger.error({ type: 'auth', email, error: resendError }, 'Failed to resend verification email')
            return NextResponse.json(
              { error: 'Profile updated but failed to send verification email. Please try again or use the resend option.' },
              { status: 500 }
            )
          }

          logger.info({ type: 'auth', email }, 'Profile updated and verification email resent')
          return NextResponse.json({
            success: true,
            message: 'Account exists but not verified. Profile updated and new verification email sent!',
            isResend: true
          })
        } catch (profileErr) {
          logger.error({ type: 'auth', email, error: profileErr }, 'Profile update error')
        }
        
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        )
      }

      // Return detailed error message for debugging
      const errorMessage = error.message || 'Failed to create account. Please try again.'
      return NextResponse.json(
        {
          error: errorMessage,
          details: error.code ? `Error code: ${error.code}` : undefined
        },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    const userId = data.user.id

    // Wait briefly for auth trigger to fire (if it exists)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check if public.users record exists, create if not
    const { data: existingUser, error: checkError } = await supabase
      .from('users' as any)
      .select('id')
      .eq('id', userId)
      .single() as any

    if (checkError || !existingUser) {
      // Trigger didn't create the record, create it manually
      logger.info({ type: 'auth', userId }, 'Creating public.users record manually')

      const { error: insertError } = await supabase
        .from('users' as any)
        .insert({
          id: userId,
          email: email.toLowerCase(),
          full_name: fullName,
          email_verified: false,
          role: 'student',
          tier: invite.tier,
          payment_status: invite.tier === 'full' ? 'paid' : 'trial'
        })

      if (insertError) {
        logger.error(
          { type: 'auth', userId, error: insertError },
          'Failed to create public.users record'
        )
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }

      logger.info({ type: 'auth', userId, tier: invite.tier }, 'Created public.users record')
    } else {
      // Record exists, update it with invite data
      logger.info({ type: 'auth', userId }, 'Updating existing public.users record')

      const { error: updateError } = await supabase
        .from('users' as any)
        .update({
          tier: invite.tier,
          payment_status: invite.tier === 'full' ? 'paid' : 'trial',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        logger.error(
          { type: 'auth', userId, error: updateError },
          'Failed to update user profile with invite data'
        )
      } else {
        logger.info(
          { type: 'auth', userId, tier: invite.tier },
          'Updated user profile with invite data'
        )
      }
    }

    // Auto-assign to active cohort (if exists)
    try {
      const { data: activeCohort } = await supabase
        .from('cohorts' as any)
        .select('id')
        .eq('is_active', true)
        .single() as any

      if (activeCohort) {
        const { error: cohortError } = await supabase
          .from('cohort_members' as any)
          .insert({
            cohort_id: activeCohort.id,
            user_id: userId,
            status: 'active'
          })

        if (cohortError) {
          logger.error(
            { type: 'auth', userId: userId, cohortId: activeCohort.id, error: cohortError },
            'Failed to add user to active cohort'
          )
        } else {
          logger.info(
            { type: 'auth', userId: userId, cohortId: activeCohort.id },
            'Added user to active cohort'
          )
        }
      }
    } catch (cohortErr) {
      logger.error({ type: 'auth', userId: userId, error: cohortErr }, 'Cohort assignment error')
    }

    // Mark invite token as used
    try {
      await supabase
        .from('invite_tokens' as any)
        .update({
          used_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('token', inviteToken)
      logger.info({ type: 'auth', inviteToken }, 'Marked invite token as used')
    } catch (tokenErr) {
      logger.error({ type: 'auth', inviteToken, error: tokenErr }, 'Failed to mark invite token as used')
    }

    // Log successful signup
    logSecurity('signup', 'low', { userId: userId, email, tier: invite.tier })

    const duration = Date.now() - startTime
    logger.info(
      { type: 'auth', userId: userId, email, duration },
      `Sign-up successful (${duration}ms)`
    )

    // Check if email verification is needed
    if (!data.user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Account created successfully. Please check your email for verification.',
        userId: userId,
        needsEmailVerification: true,
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'Account created and verified successfully.',
        userId: userId,
        needsEmailVerification: false,
      })
    }

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error({ type: 'auth', error, duration }, 'Sign-up error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

