import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { validateRequest } from '@/lib/validation'
import { signInSchema } from '@/lib/schemas'
import { logger, logSecurity } from '@/lib/logger'
import { UserRepository } from '@/repositories'
import { rateLimiter, RateLimitConfigs } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Rate limiting - prevent brute force attacks
    // Extract IP address for rate limiting
    const ip = request.headers.get('x-real-ip') ||
              request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
              'anonymous'

    const rateLimit = await rateLimiter.checkLimit('/api/auth/signin', ip, RateLimitConfigs.AUTH)

    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.reset - Date.now()) / 1000)
      logger.warn(
        { type: 'ratelimit', route: '/api/auth/signin', ip, retryAfter },
        'Rate limit exceeded for signin'
      )

      return NextResponse.json(
        {
          error: 'Too many sign-in attempts',
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
    const validation = await validateRequest(request, signInSchema)
    if (!validation.success) {
      return validation.error
    }

    const { email, password } = validation.data

    logger.info({ type: 'auth', email, action: 'signin_attempt' }, 'Sign-in attempt')

    // Create Supabase client with cookie handling
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    })

    if (error) {
      // Handle email not confirmed error specifically
      if (error.message.includes('Email not confirmed')) {
        logSecurity('login_failed', 'low', { email, reason: 'email_not_confirmed' })

        // Try to resend verification email
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: email.toLowerCase(),
        })

        if (!resendError) {
          logger.info({ type: 'auth', email }, 'Resent verification email')
          return NextResponse.json({
            error: 'Please verify your email address before signing in.',
            needsVerification: true,
            message: 'We\'ve sent a new verification link to your email. Please check your inbox and click the verification link to activate your account.',
          }, { status: 400 })
        } else {
          return NextResponse.json({
            error: 'Please verify your email address before signing in.',
            needsVerification: true,
            message: 'Your email is not verified. Please check your inbox for the verification link.',
          }, { status: 400 })
        }
      }

      // Handle other errors with better messages
      if (error.message.includes('Invalid login credentials')) {
        logSecurity('login_failed', 'medium', { email, reason: 'invalid_credentials' })
        logger.warn({ type: 'auth', email, error: error.message }, 'Sign-in failed: invalid credentials')
        return NextResponse.json(
          { error: 'Invalid email or password. Please try again.' },
          { status: 400 }
        )
      }

      // Generic error
      logSecurity('login_failed', 'medium', { email, reason: error.message })
      logger.error({ type: 'auth', email, error: error.message }, 'Sign-in failed')
      return NextResponse.json(
        { error: error.message || 'Sign-in failed. Please try again.' },
        { status: 400 }
      )
    }

    if (!data.user || !data.session) {
      logSecurity('login_failed', 'high', { email, reason: 'no_user_or_session' })
      logger.error({ type: 'auth', email }, 'Sign-in failed: no user or session returned')
      return NextResponse.json(
        { error: 'Authentication failed. Please try again.' },
        { status: 400 }
      )
    }

    // Defensive check: Ensure user exists in public.users
    // This handles cases where the handle_new_user trigger may have failed
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const userRepo = new UserRepository(supabaseAdmin)
      const userProfile = await userRepo.findById(data.user.id)

      if (!userProfile) {
        // User missing from public.users - create profile now
        logger.warn(
          { type: 'auth', userId: data.user.id, email: data.user.email },
          'Creating missing user profile'
        )

        const createdUser = await userRepo.createUser({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || '',
          email_verified: !!data.user.email_confirmed_at,
          role: 'student',
          tier: 'basic',
          payment_status: 'pending',
        })

        if (!createdUser) {
          logger.error(
            { type: 'auth', userId: data.user.id },
            'Failed to create user profile'
          )
          // Don't fail signin - user can still access portal
        } else {
          logger.info({ type: 'auth', userId: data.user.id }, 'Created missing user profile')
        }
      }
    } catch (profileCheckError) {
      logger.error(
        { type: 'auth', userId: data.user.id, error: profileCheckError },
        'Error checking user profile'
      )
      // Don't fail signin - continue
    }

    // Success - cookies are automatically set by the Supabase client
    logSecurity('login_success', 'low', { userId: data.user.id, email: data.user.email })

    const duration = Date.now() - startTime
    logger.info(
      { type: 'auth', userId: data.user.id, email: data.user.email, duration },
      `Sign-in successful (${duration}ms)`
    )

    // Return minimal user info for security
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      { type: 'auth', error, duration },
      'Sign-in error'
    )
    return NextResponse.json(
      { error: 'An error occurred during sign-in' },
      { status: 500 }
    )
  }
}