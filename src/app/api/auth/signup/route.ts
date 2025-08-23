import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password } = await request.json()

    // Validate input
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    console.log('🔧 Starting Supabase auth signup for:', email)

    // Use Supabase's built-in auth system
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    console.log('🔧 Supabase signup result:', { data, error })

    if (error) {
      console.error('❌ Supabase signup error:', error)
      
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to create account. Please try again.' },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    console.log('✅ Supabase user created:', data.user.id)
    console.log('📧 Email confirmed:', data.user.email_confirmed_at)

    // Create student profile in our custom table
    try {
      const { data: studentProfile, error: profileError } = await supabase
        .from('students')
        .insert([
          {
            id: data.user.id, // Use the same ID as the auth user
            full_name: fullName,
            email: email.toLowerCase(),
            email_verified: !!data.user.email_confirmed_at,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (profileError) {
        console.error('Failed to create student profile:', profileError)
        // Don't fail the signup if profile creation fails - they can still verify email
      } else {
        console.log('✅ Student profile created:', studentProfile.id)
      }
    } catch (profileErr) {
      console.error('Profile creation error:', profileErr)
    }

    // Check if email verification is needed
    if (!data.user.email_confirmed_at) {
      console.log('📧 Email verification required - Supabase will send verification email')
      return NextResponse.json({
        success: true,
        message: 'Account created successfully. Please check your email for verification.',
        userId: data.user.id,
        needsEmailVerification: true,
      })
    } else {
      console.log('✅ Email already verified')
      return NextResponse.json({
        success: true,
        message: 'Account created and verified successfully.',
        userId: data.user.id,
        needsEmailVerification: false,
      })
    }

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

