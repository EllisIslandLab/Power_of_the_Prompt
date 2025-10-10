import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists (using service role to bypass RLS)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (user) {
      // Generate password recovery link using Supabase Auth
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email.toLowerCase(),
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`
        }
      })

      if (error) {
        console.error('Token generation error:', error)
      } else if (data.properties?.action_link) {
        // Send password reset email via Resend
        try {
          await resend.emails.send({
            from: 'Web Launch Academy <noreply@weblaunchacademy.com>',
            to: [email.toLowerCase()],
            subject: '🔑 Reset Your Password - Web Launch Academy',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <!-- Header -->
                <div style="background-color: #1e40af; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">🔑 Reset Your Password</h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Get back into your Web Launch Academy portal</p>
                </div>

                <!-- Main Content -->
                <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                    Hi there! 👋
                  </p>

                  <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 25px;">
                    We received a request to reset your password for your Web Launch Academy account. No worries - it happens to the best of us!
                  </p>

                  <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 30px;">
                    Click the button below to create a new password and get back to building your website:
                  </p>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.properties.action_link}"
                       style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                      Reset My Password
                    </a>
                  </div>

                  <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 25px;">
                    If the button doesn't work, copy and paste this link:
                  </p>
                  <p style="font-size: 14px; color: #1e40af; word-break: break-all;">
                    ${data.properties.action_link}
                  </p>

                  <!-- Security Notice -->
                  <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="color: #991b1b; margin: 0; font-size: 14px; line-height: 1.5;">
                      <strong>Security Note:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email - your account is still secure.
                    </p>
                  </div>

                  <p style="color: #333; margin-top: 25px; font-size: 16px;">
                    Keep building!<br>
                    <strong>The Web Launch Academy Team</strong>
                  </p>
                </div>

                <!-- Footer -->
                <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
                  <p style="margin: 0;">Web Launch Academy | Professional Website Development Coaching</p>
                  <p style="margin: 5px 0 0 0;">
                    <a href="https://weblaunchacademy.com" style="color: #1e40af;">weblaunchacademy.com</a>
                  </p>
                </div>
              </div>
            `
          })
        } catch (emailError) {
          console.error('Resend error:', emailError)
          // Don't fail the request - still return success for security
        }
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
