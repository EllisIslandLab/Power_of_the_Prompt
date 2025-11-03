import { NextRequest } from 'next/server'
import { waitlistSignupSchema } from '@/lib/schemas'
import { getAdminClient } from '@/adapters'
import { resendAdapter } from '@/adapters'
import { withMiddleware, withValidation, withLogging, withErrorHandling, ConflictError } from '@/api-middleware'
import { logger } from '@/lib/logger'
import { alertCriticalError } from '@/lib/error-alerts'

const supabase = getAdminClient()

/**
 * Waitlist Signup
 *
 * Adds a user to the waitlist and sends confirmation email.
 * Uses middleware for validation, logging, and error handling.
 */
export const POST = withMiddleware(
  [withErrorHandling, withLogging, withValidation(waitlistSignupSchema)],
  async (req: NextRequest, { validated }) => {
    const { email, name, source, referrer } = validated

    // Check if email already exists in leads table
    const { data: existingEmail, error: checkError } = await supabase
      .from('leads')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is what we want
      logger.error({ error: checkError }, 'Database error checking email')
      await alertCriticalError(
        new Error('Database error in waitlist signup'),
        'Waitlist Signup - Database Check',
        { email, errorCode: checkError.code }
      )
      throw new Error('Database error occurred')
    }

    if (existingEmail) {
      throw new ConflictError('You\'re already on our waitlist! We\'ll notify you when we launch.')
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
      logger.error({ error: insertError }, 'Failed to add email to leads')
      await alertCriticalError(
        insertError,
        'Waitlist Signup - Database Insert Failed',
        { email, name }
      )
      throw new Error('Failed to add email to leads')
    }

    // Send welcome email via Resend
    try {
      await resendAdapter.sendEmail({
        from: 'Web Launch Academy <noreply@weblaunchacademy.com>',
        to: email,
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
        `
      })
    } catch (emailError) {
      logger.error({ error: emailError }, 'Email send error')
      // Don't fail the signup if email fails - they're still on the list
      logger.info('Email failed to send, but signup was successful')
    }

    return {
      success: true,
      message: 'Successfully joined the waitlist! Check your email for confirmation.',
      email: email.toLowerCase()
    }
  }
)