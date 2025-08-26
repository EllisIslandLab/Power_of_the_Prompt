import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Simple, clean signin approach
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

        return NextResponse.json({
          error: 'Please verify your email address before signing in.',
          needsVerification: true,
          message: 'We\'ve sent a new verification link to your email address. Please check your inbox and click the verification link to activate your account.',
          emailSent: !resendError
        }, { status: 400 })
      }

      // Standard invalid credentials error
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your email and password and try again.' },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your email and password and try again.' },
        { status: 400 }
      )
    }

    // Success
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at
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