import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { validateRequest } from '@/lib/validation'
import { signInSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    // Validate request with Zod schema
    const validation = await validateRequest(request, signInSchema)
    if (!validation.success) {
      return validation.error
    }

    const { email, password } = validation.data

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
        // Try to resend verification email
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: email.toLowerCase(),
        })

        if (!resendError) {
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
        return NextResponse.json(
          { error: 'Invalid email or password. Please try again.' },
          { status: 400 }
        )
      }

      // Generic error
      return NextResponse.json(
        { error: error.message || 'Sign-in failed. Please try again.' },
        { status: 400 }
      )
    }

    if (!data.user || !data.session) {
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

      const { data: userProfile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (profileError || !userProfile) {
        // User missing from public.users - create profile now
        console.warn('Creating missing user profile for:', data.user.email)

        const { error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || '',
            email_verified: !!data.user.email_confirmed_at,
            role: 'student',
            tier: 'basic',
            payment_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (createError) {
          console.error('Failed to create user profile:', createError)
          // Don't fail signin - user can still access portal
        }
      }
    } catch (profileCheckError) {
      console.error('Error checking user profile:', profileCheckError)
      // Don't fail signin - continue
    }

    // Success - cookies are automatically set by the Supabase client
    // Return minimal user info for security
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    })

  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'An error occurred during sign-in' },
      { status: 500 }
    )
  }
}