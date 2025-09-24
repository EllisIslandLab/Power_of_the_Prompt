import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Check required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const { email } = await request.json()

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if email already exists in leads table
    const { data: existingEmail, error: checkError } = await supabase
      .from('leads')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is what we want
      console.error('Database error:', checkError)
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      )
    }

    if (existingEmail) {
      return NextResponse.json(
        { error: 'You\'re already on our waitlist! We\'ll notify you when we launch.' },
        { status: 409 }
      )
    }

    // Add email to leads table with waitlist status
    const { data: newSignup, error: insertError } = await supabase
      .from('leads')
      .insert([
        {
          email: email.toLowerCase(),
          status: 'waitlist',
          source: 'coming-soon-page',
          signup_date: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
      return NextResponse.json(
        { error: 'Failed to add email to leads' },
        { status: 500 }
      )
    }

    // Send welcome email via Resend
    try {
      await resend.emails.send({
        from: 'Web Launch Academy <noreply@weblaunchacademy.com>',
        to: [email],
        subject: '🚀 You\'re on the list! Something amazing is coming...',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">Welcome to Web Launch Academy!</h1>
              <p style="color: #64748b; font-size: 16px;">Thanks for joining our waitlist ✨</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #2563eb; margin-bottom: 25px;">
              <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 15px;">What's Coming Soon?</h2>
              <ul style="color: #475569; line-height: 1.6; padding-left: 20px;">
                <li><strong>Own Your Code Forever</strong> - No monthly fees, complete ownership</li>
                <li><strong>AI-Powered Development</strong> - Build professional sites with Claude CLI</li>
                <li><strong>Lightning Fast Results</strong> - Go from idea to live website in record time</li>
                <li><strong>Professional Training</strong> - Learn the skills that matter</li>
              </ul>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
              <p style="color: #92400e; margin: 0; font-style: italic; text-align: center;">
                "Build Once, Own Forever" - The philosophy that changes everything
              </p>
            </div>

            <div style="text-align: center; margin-bottom: 25px;">
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                We're putting the finishing touches on something special. As a waitlist member, you'll be the first to know when we launch and get exclusive early access.
              </p>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="https://weblaunchacademy.com" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Visit Our Site</a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                You're receiving this because you signed up for the Web Launch Academy waitlist.<br>
                <a href="#" style="color: #64748b;">Unsubscribe</a> | <a href="#" style="color: #64748b;">Update Preferences</a>
              </p>
            </div>
          </div>
        `,
        text: `
Welcome to Web Launch Academy!

Thanks for joining our waitlist! 

What's Coming Soon?
• Own Your Code Forever - No monthly fees, complete ownership
• AI-Powered Development - Build professional sites with Claude CLI  
• Lightning Fast Results - Go from idea to live website in record time
• Professional Training - Learn the skills that matter

"Build Once, Own Forever" - The philosophy that changes everything

We're putting the finishing touches on something special. As a waitlist member, you'll be the first to know when we launch and get exclusive early access.

Visit our site: https://weblaunchacademy.com

You're receiving this because you signed up for the Web Launch Academy waitlist.
        `
      })
    } catch (emailError) {
      console.error('Email send error:', emailError)
      // Don't fail the signup if email fails - they're still on the list
      console.log('Email failed to send, but signup was successful')
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist! Check your email for confirmation.',
      email: email.toLowerCase()
    })

  } catch (error) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}