import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  let response: NextResponse

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

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
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
                response.cookies.set(name, value, options)
              })
            } catch (e) {
              console.error('Error setting cookies:', e)
            }
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

        response = NextResponse.json({
          error: 'Please verify your email address before signing in.',
          needsVerification: true,
          message: 'We\'ve sent a new verification link to your email address. Please check your inbox and click the verification link to activate your account.',
          emailSent: !resendError
        }, { status: 400 })
        return response
      }

      // Standard invalid credentials error
      response = NextResponse.json(
        { error: 'Invalid credentials. Please check your email and password and try again.' },
        { status: 400 }
      )
      return response
    }

    if (!data.user || !data.session) {
      response = NextResponse.json(
        { error: 'Invalid credentials. Please check your email and password and try again.' },
        { status: 400 }
      )
      return response
    }

    // Success - return response with cookies
    response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at
      }
    })

    return response

  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'An error occurred during sign-in' },
      { status: 500 }
    )
  }
}