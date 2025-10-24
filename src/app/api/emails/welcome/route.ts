import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, fullName } = await request.json()

    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Email and full name are required' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'Web Launch Academy <noreply@weblaunchacademy.com>',
      to: [email],
      subject: 'Welcome to Web Launch Academy!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #1e40af; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to Web Launch Academy!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your journey to building professional websites starts here</p>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi ${fullName}!
            </p>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 25px;">
              Welcome to Web Launch Academy! We're excited to have you join our community of aspiring web developers. You're about to embark on an amazing journey to build professional websites with modern technology.
            </p>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 30px;">
              You can now sign in to access your student portal and start exploring resources and lessons.
            </p>

            <div style="background-color: #f0f9ff; border-left: 4px solid #1e40af; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h2>
              <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Sign in to your student portal</li>
                <li>Complete your profile</li>
                <li>Start exploring resources and lessons</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/portal"
                 style="background-color: #ffdb57; color: #11296b; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                Visit Your Portal
              </a>
            </div>

            <p style="color: #333; margin-top: 30px; font-size: 16px;">
              Let's build something amazing together!<br>
              <strong>The Web Launch Academy Team</strong>
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p style="margin: 0;">Web Launch Academy | Professional Website Development Coaching</p>
            <p style="margin: 5px 0 0 0;">
              <a href="https://weblaunchacademy.com" style="color: #1e40af;">weblaunchacademy.com</a>
            </p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
