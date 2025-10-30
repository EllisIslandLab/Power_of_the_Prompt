import { NextRequest, NextResponse } from 'next/server'
import { resendAdapter } from '@/adapters'

export async function POST(request: NextRequest) {
  try {
    const { email, fullName } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const result = await resendAdapter.sendEmail({
      from: 'Matthew Ellis - Web Launch Academy <noreply@weblaunchacademy.com>',
      replyTo: 'hello@weblaunchacademy.com',
      to: email,
      subject: 'Welcome to Web Launch Academy - Let\'s Get Started!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #1e40af; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to Web Launch Academy!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your 8-Week Journey to Building Your Website Starts Here</p>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi ${fullName || 'there'}!
            </p>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
              I want to thank you for your interest in my technique for building websites. It means a lot for someone like me who is trying to get something new going when there are people interested.
            </p>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
              I've been continuing to work so that the coming 8 week course is not a disappointment to you and to everyone who signed up. I deeply appreciate your time, so I will strive to make this well worth it to everyone.
            </p>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 25px;">
              <strong>The end goal is to get you a website by the end of the 8 weeks</strong> (or less if possible), and I'm excited to share my methods with you. In order to do this effectively, I need to ask you a handful of questions so you can be prepared.
            </p>

            <div style="background-color: #f0f9ff; border-left: 4px solid #1e40af; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Preparation Questions</h2>
              <p style="color: #333; line-height: 1.6; margin-bottom: 15px;">
                It would be great if you could at least read all of these on your own and, if possible, be able to give me an answer to the first 9 (although question no. 3 can be tricky so don't worry if you can't figure that one out).
              </p>
              <ol style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">What are the reasons you want a website?</li>
                <li style="margin-bottom: 10px;">How would a website benefit your business/life?</li>
                <li style="margin-bottom: 10px;">What computer setup are you working with? (Mac/PC, how old is it, RAM amount if known)</li>
                <li style="margin-bottom: 10px;">Are you comfortable investing approximately $50/month in required tools during development (more if new computer equipment is needed)?</li>
                <li style="margin-bottom: 10px;">What time(s) would work for 1-on-1 sessions?</li>
                <li style="margin-bottom: 10px;">If you couldn't attend in person, do you think you could be consistent with just recordings?</li>
                <li style="margin-bottom: 10px;">When learning something complex, do you prefer figuring things out independently or having expert guidance?</li>
                <li style="margin-bottom: 10px;">What would a professional, fully-functional website be worth to your business annually?</li>
                <li style="margin-bottom: 10px;">How important is having a website that scores 95+ on performance, SEO, accessibility, and best practices?</li>
                <li style="margin-bottom: 10px;">Have you priced professional web development? What did you find?</li>
              </ol>
            </div>

            <div style="background-color: #ffdb57; border-left: 4px solid #11296b; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h2 style="color: #11296b; margin: 0 0 10px 0; font-size: 18px;">📅 Schedule Your Initial 1-on-1 Meeting</h2>
              <p style="color: #11296b; line-height: 1.6; margin: 0;">
                Would you be free for an initial 1-on-1 video meeting within the next 5 business days? This will serve a few purposes:
              </p>
              <ul style="color: #11296b; line-height: 1.8; margin: 10px 0 0 0; padding-left: 20px;">
                <li>First, and foremost, I get to finally meet you in person</li>
                <li>Second, it allows me to find out how I can best serve you</li>
              </ul>
              <p style="color: #11296b; line-height: 1.6; margin: 15px 0 0 0; font-weight: bold;">
                Please reply to this email with a few dates/times that work for you<br>
                (e.g. "Next Tuesday 5-7 PM or Thursday 3-5 PM")
              </p>
            </div>

            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 30px 0 25px 0; text-align: center; font-size: 18px; font-weight: bold; color: #1e40af;">
              I'm excited to see the incredible website you can build with these methods!
            </p>

            <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px;">
              <p style="color: #333; margin: 0; font-size: 16px; line-height: 1.8;">
                <strong style="color: #1e40af;">Web Launch Academy LLC</strong><br>
                Matthew Ellis<br>
                <span style="color: #666;">Founder and Web Coach</span><br>
                <a href="tel:+14403549904" style="color: #1e40af; text-decoration: none;">(440) 354-9904</a>
              </p>
              <p style="margin: 15px 0 0 0; text-align: center; font-size: 18px; font-weight: bold; color: #11296b; font-style: italic;">
                - Build Once, Own Forever! -
              </p>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p style="margin: 0;">Web Launch Academy | Professional Website Development Coaching</p>
            <p style="margin: 5px 0 0 0;">
              <a href="https://weblaunchacademy.com" style="color: #1e40af; text-decoration: none;">weblaunchacademy.com</a>
            </p>
          </div>
        </div>
      `
    })

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('Student onboarding email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
