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

    // Split name into first_name and last_name if provided
    // ALWAYS populate first_name, even with single name
    let firstName = ''
    let lastName = ''
    let fullName = name || ''

    if (name && name.trim()) {
      const nameParts = name.trim().split(/\s+/)
      if (nameParts.length === 1) {
        // Single name: use for both first_name and name
        firstName = nameParts[0]
        fullName = nameParts[0]
      } else if (nameParts.length >= 2) {
        // Multiple parts: split into first and last
        firstName = nameParts[0]
        lastName = nameParts.slice(1).join(' ') // Handle middle names
        fullName = name.trim()
      }
    }

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
          name: fullName || null,
          first_name: firstName || null,
          last_name: lastName || null,
          wants_ownership: validated.wantsOwnership ?? true, // Default to true if not provided
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
    const displayName = firstName || 'there'
    try {
      await resendAdapter.sendEmail({
        from: 'Web Launch Academy <hello@weblaunchacademy.com>',
        to: email,
        subject: `🚀 Welcome${firstName ? `, ${firstName}` : ''}! Let's get started...`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">Welcome to Web Launch Academy${firstName ? `, ${firstName}` : ''}!</h1>
              <p style="color: #64748b; font-size: 16px;">Thanks for signing up for updates ✨</p>
            </div>

            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #2563eb; margin-bottom: 25px;">
              <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 15px;">What You'll Learn</h2>
              <ul style="color: #475569; line-height: 1.6; padding-left: 20px;">
                <li><strong>Own Your Code Forever</strong> - No monthly fees, complete ownership</li>
                <li><strong>AI-Powered Development</strong> - Build professional sites with Claude CLI</li>
                <li><strong>Lightning Fast Results</strong> - Go from idea to live website in record time</li>
                <li><strong>Professional Training</strong> - Learn the skills that matter</li>
              </ul>
            </div>

            <div style="background: #ffdb57; padding: 25px; border-radius: 10px; margin-bottom: 25px; text-align: center;">
              <h3 style="color: #11296b; font-size: 20px; margin-bottom: 15px;">🎁 Free 1-on-1 Introduction Session</h3>
              <p style="color: #11296b; margin-bottom: 15px; line-height: 1.6;">
                Want to learn more about what to expect in the course? Reply to this email or send a message to
                <a href="mailto:hello@weblaunchacademy.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">hello@weblaunchacademy.com</a>
                to schedule your free 1-on-1 session with Matthew!
              </p>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
              <p style="color: #92400e; margin: 0; font-style: italic; text-align: center;">
                "Build Once, Own Forever" - The philosophy that changes everything
              </p>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="https://weblaunchacademy.com" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Explore Our Courses</a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #475569; font-size: 14px; margin-bottom: 10px;">
                Questions? Just reply to this email - I personally read and respond to every message.
              </p>
              <p style="color: #475569; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>Matthew Ellis</strong><br>
                Founder, Web Launch Academy
              </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                You're receiving this because you signed up for Web Launch Academy updates.<br>
                Questions or feedback? Email us at <a href="mailto:hello@weblaunchacademy.com" style="color: #64748b;">hello@weblaunchacademy.com</a>
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