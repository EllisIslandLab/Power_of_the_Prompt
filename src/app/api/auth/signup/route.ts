import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, inviteToken } = await request.json()

    // Validate input
    if (!fullName || !email || !password || !inviteToken) {
      return NextResponse.json(
        { error: 'Full name, email, password, and invite token are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate invite token
    const { data: invite, error: inviteError } = await supabase
      .from('invite_tokens')
      .select('*')
      .eq('token', inviteToken)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid invite token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invite token has expired' },
        { status: 400 }
      )
    }

    // Check if token has already been used
    if (invite.used_at) {
      return NextResponse.json(
        { error: 'Invite token has already been used' },
        { status: 400 }
      )
    }

    // Ensure email matches the invite
    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match the invite' },
        { status: 400 }
      )
    }

    // console.log('🔧 Starting Supabase auth signup for:', email) // Commented out for auth transition

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

    // console.log('🔧 Supabase signup result:', { data, error }) // Commented out for auth transition

    if (error) {
      // console.error('❌ Supabase signup error:', error) // Commented out for auth transition
      
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        // For existing users, update their profile and resend verification email
        try {
          // First, get the existing user to update their auth metadata
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
          
          if (listError) {
            // console.error('Failed to list users:', listError) // Commented out for auth transition
            // Continue with profile update even if we can't check auth users
          }
          
          const existingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
          
          if (existingUser) {
            // Check if user is already verified
            if (existingUser.email_confirmed_at) {
              return NextResponse.json(
                { error: 'This email is already verified. Please sign in instead.' },
                { status: 409 }
              )
            }
            
            // Update auth user metadata with new full name
            await supabase.auth.admin.updateUserById(existingUser.id, {
              user_metadata: { full_name: fullName }
            })
          }
          
          // Update the student profile with new full name
          const { error: updateError } = await supabase
            .from('students')
            .update({ 
              full_name: fullName,
              updated_at: new Date().toISOString()
            })
            .eq('email', email.toLowerCase())
          
          if (updateError) {
            // console.error('Failed to update student profile:', updateError) // Commented out for auth transition
          }
          
          // Resend verification email via Supabase
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email.toLowerCase()
          })
          
          if (resendError) {
            return NextResponse.json(
              { error: 'Profile updated but failed to send verification email. Please try again or use the resend option.' },
              { status: 500 }
            )
          }
          
          return NextResponse.json({
            success: true,
            message: 'Account exists but not verified. Profile updated and new verification email sent!',
            isResend: true
          })
        } catch (profileErr) {
          // console.error('Profile update error:', profileErr) // Commented out for auth transition
        }
        
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

    // console.log('✅ Supabase user created:', data.user.id) // Commented out for auth transition
    // console.log('📧 Email confirmed:', data.user.email_confirmed_at) // Commented out for auth transition

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
            tier: invite.tier, // Set tier from invite
            payment_status: invite.tier === 'full' ? 'paid' : 'trial',
            invited_by: invite.created_by,
            invited_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (profileError) {
        // console.error('Failed to create student profile:', profileError) // Commented out for auth transition
        // Don't fail the signup if profile creation fails - they can still verify email
      } else {
        // console.log('✅ Student profile created:', studentProfile.id) // Commented out for auth transition
      }
    } catch (profileErr) {
      // console.error('Profile creation error:', profileErr) // Commented out for auth transition
    }

    // Mark invite token as used
    try {
      await supabase
        .from('invite_tokens')
        .update({
          used_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('token', inviteToken)
    } catch (tokenErr) {
      // console.error('Failed to mark invite token as used:', tokenErr) // Commented out for auth transition
    }

    // Check if email verification is needed
    if (!data.user.email_confirmed_at) {
      // console.log('📧 Email verification required - Supabase will send verification email') // Commented out for auth transition
      return NextResponse.json({
        success: true,
        message: 'Account created successfully. Please check your email for verification.',
        userId: data.user.id,
        needsEmailVerification: true,
      })
    } else {
      // console.log('✅ Email already verified') // Commented out for auth transition
      return NextResponse.json({
        success: true,
        message: 'Account created and verified successfully.',
        userId: data.user.id,
        needsEmailVerification: false,
      })
    }

  } catch (error) {
    // console.error('Signup error:', error) // Commented out for auth transition
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

