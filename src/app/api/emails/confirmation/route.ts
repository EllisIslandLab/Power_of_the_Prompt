import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, confirmationLink } = await request.json()

    if (!email || !confirmationLink) {
      return NextResponse.json(
        { error: 'Email and confirmation link are required' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'Web Launch Academy <noreply@weblaunchacademy.com>',
      to: [email],
      subject: '	 Confirm Your Email - Web Launch Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <!-- Header -->
          <div style="background-color: #1e40af; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">	 Confirm Your Email</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">One last step to get started!</p>
          </div>

          <!-- Main Content -->
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi ${fullName || 'there'}! =K
            </p>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 25px;">
              Welcome to Web Launch Academy! We're excited to have you join our community of aspiring web developers.
            </p>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 30px;">
              Before you can access your portal, please confirm your email address by clicking the button below:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationLink}"
                 style="background-color: #ffdb57; color: #11296b; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                Confirm My Email
              </a>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 25px;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="font-size: 14px; color: #1e40af; word-break: break-all;">
              ${confirmationLink}
            </p>

            <!-- Info Box -->
            <div style="background-color: #f0f9ff; border-left: 4px solid #1e40af; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="color: #1e3a8a; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>What's Next?</strong> After confirming your email, you can sign in and start exploring your student portal, accessing resources, and beginning your web development journey!
              </p>
            </div>

            <p style="color: #333; margin-top: 25px; font-size: 16px;">
              Let's build something amazing together!<br>
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

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Confirmation email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
