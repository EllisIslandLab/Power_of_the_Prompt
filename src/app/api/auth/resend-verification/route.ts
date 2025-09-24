import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user with this email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      // Don't reveal whether email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an unverified account exists with this email, a verification link has been sent.',
      })
    }

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json(
        { error: 'This email is already verified. Please sign in instead.' },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update verification token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verification_token: verificationToken,
        email_verification_expires_at: verificationExpires.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update verification token:', updateError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    // Send verification email
    try {
      // Use production URL - get from request headers or fallback to environment
      const host = request.headers.get('host') || 'weblaunchacademy.com'
      const protocol = request.headers.get('x-forwarded-proto') || 'https'
      const baseUrl = `${protocol}://${host}`
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`
      
      await sendVerificationEmail(email, user.full_name, verificationUrl)
      
      console.log('✅ Verification email resent to:', email)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email has been sent. Please check your email.',
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendVerificationEmail(email: string, name: string, verificationUrl: string) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured - verification email not sent')
    return
  }

  const emailData = {
    from: 'Web Launch Academy <noreply@weblaunchacademy.com>',
    to: [email],
    subject: 'Verify your Web Launch Academy account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Web Launch Academy, ${name}!</h2>
        
        <p>Thank you for creating your student account. To get started, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #ffdb57; color: #11296b; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Verify Email Address
          </a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <p>This verification link will expire in 24 hours.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="color: #666; font-size: 14px;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send email: ${error}`)
  }

  return await response.json()
}