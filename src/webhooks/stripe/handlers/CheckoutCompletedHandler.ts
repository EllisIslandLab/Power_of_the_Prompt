import Stripe from 'stripe'
import { BaseWebhookHandler } from '../BaseWebhookHandler'
import { renderPaymentConfirmationEmail, EmailSubjects, EMAIL_FROM } from '@/lib/email-builder'
import { logger, logPayment, logSecurity } from '@/lib/logger'
import { UserRepository, LeadRepository } from '@/repositories'
import { stripeAdapter, resendAdapter, getAdminClient } from '@/adapters'
import { alertCriticalError } from '@/lib/error-alerts'

/**
 * Checkout Completed Handler
 *
 * Handles the checkout.session.completed webhook event from Stripe.
 * This is triggered when a customer completes payment.
 *
 * Responsibilities:
 * 1. Verify customer email exists
 * 2. Create or update user account
 * 3. Update user tier based on purchase
 * 4. Credit session packages if applicable
 * 5. Mark lead as converted
 * 6. Send welcome/confirmation email
 * 7. Log payment completion
 */
export class CheckoutCompletedHandler extends BaseWebhookHandler {
  readonly eventType = 'checkout.session.completed'

  async handle(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session
    const startTime = Date.now()
    const customerEmail = session.customer_details?.email
    const customerName = session.customer_details?.name
    const sessionId = session.id

    // Create child logger with checkout context
    const checkoutLogger = logger.child({
      type: 'checkout',
      sessionId,
      customerEmail,
    })

    if (!customerEmail) {
      checkoutLogger.error('No customer email in checkout session')
      throw new Error('No customer email in checkout session')
    }

    checkoutLogger.info('Processing checkout session')

    const supabase = getAdminClient()

    try {
      // Get the product details from Stripe
      const lineItems = await stripeAdapter.listLineItems(session.id, ['data.price.product'])

      const product = lineItems.data[0]?.price?.product as Stripe.Product | undefined
      const metadata = product?.metadata || {}

      checkoutLogger.info({
        metadata,
        hasProduct: !!product,
        lineItemsCount: lineItems.data.length,
        productName: product?.name
      }, 'Retrieved product details')

      // Determine user tier and sessions based on product
      const { tier, sessionsToCredit, paymentStatus } = this.parseProductMetadata(metadata)

      // Initialize repositories
      const userRepo = new UserRepository(supabase)
      const leadRepo = new LeadRepository(supabase)

      // 1. Check if lead exists
      const lead = await leadRepo.findByEmail(customerEmail)

      // 2. Check if user already exists
      const existingUser = await userRepo.findByEmail(customerEmail)

      let userId: string
      let passwordResetUrl = ''

      if (existingUser) {
        // User already exists - handle upgrade
        checkoutLogger.info({ userId: existingUser.id }, 'User already exists, handling as upgrade')
        userId = await this.handleExistingUser(
          existingUser,
          tier,
          paymentStatus,
          userRepo,
          checkoutLogger
        )
      } else {
        // Create new user
        checkoutLogger.info({ customerEmail }, 'No existing user found, creating new user')
        const result = await this.handleNewUser(
          customerEmail,
          customerName ?? null,
          lead,
          tier,
          paymentStatus,
          userRepo,
          leadRepo,
          supabase,
          checkoutLogger
        )
        userId = result.userId
        passwordResetUrl = result.passwordResetUrl
      }

      // 3. Credit session packages if applicable
      await this.creditSessions(userId, sessionsToCredit, supabase, checkoutLogger)

      // 4. Log payment completion
      const amount = session.amount_total || 0
      const currency = session.currency || 'usd'
      logPayment('charge', 'succeeded', amount, currency, {
        userId,
        tier,
        sessionsToCredit,
        customerId: session.customer,
      })

      // 5. Send welcome email
      await this.sendWelcomeEmail(
        customerEmail,
        customerName || lead?.name || '',
        tier,
        sessionsToCredit,
        customerEmail,
        passwordResetUrl
      )

      const duration = Date.now() - startTime
      checkoutLogger.info(
        { userId, tier, duration },
        `Successfully processed checkout (${duration}ms)`
      )

    } catch (error) {
      const duration = Date.now() - startTime
      checkoutLogger.error(
        { error, duration },
        'Failed to process checkout'
      )

      // Send critical alert for checkout processing failures
      await alertCriticalError(
        error instanceof Error ? error : new Error('Unknown checkout processing error'),
        'Stripe Checkout Processing Failed',
        {
          sessionId,
          customerEmail,
          duration
        }
      )

      // Re-throw to trigger webhook retry
      throw error
    }
  }

  /**
   * Parse product metadata to determine tier and sessions
   */
  private parseProductMetadata(metadata: Stripe.Metadata): {
    tier: string
    sessionsToCredit: number
    paymentStatus: string
  } {
    let tier = 'basic'
    let sessionsToCredit = 0
    let paymentStatus = 'paid'

    // Log what metadata we received for debugging
    logger.debug({ metadata }, 'Parsing product metadata')

    if (metadata.tier) {
      // A+ Program (premium_vip tier with 12 sessions)
      tier = metadata.tier === 'premium_vip' ? 'vip' : metadata.tier
      sessionsToCredit = parseInt(metadata.total_lvl_ups) || 0
      logger.info({ tier, sessionsToCredit }, 'Parsed from metadata.tier')
    } else if (metadata.course_type === 'basic_course') {
      // Basic Course (standard tier, no sessions unless they buy add-ons)
      tier = 'basic'
      sessionsToCredit = metadata.includes_lvl_ups === 'true' ? 3 : 0
      logger.info({ tier, sessionsToCredit }, 'Parsed from metadata.course_type')
    } else {
      // Default: treat as basic course if no metadata
      logger.warn({ metadata }, 'No recognized metadata - defaulting to basic tier')
      tier = 'basic'
      sessionsToCredit = 0
    }

    return { tier, sessionsToCredit, paymentStatus }
  }

  /**
   * Handle existing user upgrade
   */
  private async handleExistingUser(
    existingUser: any,
    tier: string,
    paymentStatus: string,
    userRepo: UserRepository,
    checkoutLogger: any
  ): Promise<string> {
    const userId = existingUser.id
    checkoutLogger.info({ userId, currentTier: existingUser.tier }, 'User already exists')

    // Upgrade tier if needed (vip > premium > basic)
    const tierHierarchy: Record<string, number> = { basic: 1, premium: 2, vip: 3 }
    const currentTierLevel = tierHierarchy[existingUser.tier] || 0
    const newTierLevel = tierHierarchy[tier] || 0

    if (newTierLevel > currentTierLevel) {
      await userRepo.updateTierAndPayment(
        userId,
        tier as 'basic' | 'premium' | 'vip',
        'paid'
      )
      checkoutLogger.info(
        { userId, oldTier: existingUser.tier, newTier: tier },
        `Upgraded user tier from ${existingUser.tier} to ${tier}`
      )
    }

    return userId
  }

  /**
   * Handle new user creation
   */
  private async handleNewUser(
    customerEmail: string,
    customerName: string | null,
    lead: any,
    tier: string,
    paymentStatus: string,
    userRepo: UserRepository,
    leadRepo: LeadRepository,
    supabase: any,
    checkoutLogger: any
  ): Promise<{ userId: string; passwordResetUrl: string }> {
    checkoutLogger.info({ customerEmail, customerName, leadName: lead?.name }, 'Creating new auth user')

    // Generate a secure random password (user will be prompted to reset it)
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!'

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: customerEmail.toLowerCase(),
      password: tempPassword,
      email_confirm: true, // Auto-confirm since they paid
      user_metadata: {
        full_name: lead?.name || customerName || '',
      }
    })

    if (authError) {
      checkoutLogger.error({
        error: authError,
        code: authError.code,
        message: authError.message,
        status: authError.status,
        name: authError.name,
        customerEmail
      }, 'Failed to create auth user')

      // Send detailed alert about the specific failure
      await alertCriticalError(
        authError,
        'Auth User Creation Failed During Purchase',
        {
          customerEmail,
          errorCode: authError.code,
          errorMessage: authError.message,
          leadExists: !!lead
        }
      )

      // Check if error is due to user already existing
      if (authError.message?.includes('already') || authError.code === 'user_already_exists' || authError.message?.includes('Database error')) {
        checkoutLogger.warn({ customerEmail }, 'User might already exist, attempting to find existing user')

        // Try to find existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        const existingAuthUser = users?.find((u: any) => u.email?.toLowerCase() === customerEmail.toLowerCase())

        if (existingAuthUser) {
          checkoutLogger.info({ userId: existingAuthUser.id }, 'Found existing auth user, will treat as upgrade')
          // Return the existing user's ID and let handleExistingUser handle it
          return existingAuthUser.id
        } else {
          checkoutLogger.error({ error: authError }, 'Could not create or find auth user')
          throw authError
        }
      } else {
        throw authError
      }
    }

    const userId = authUser.user.id
    checkoutLogger.info({ userId, email: customerEmail }, 'Created new auth user successfully')
    logSecurity('signup', 'low', { userId, email: customerEmail, source: 'payment' })

    // Generate password reset link for user to set their password
    let passwordResetUrl = ''
    try {
      const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: customerEmail.toLowerCase(),
      })

      if (resetError) {
        checkoutLogger.error({ error: resetError }, 'Failed to generate password reset link')
      } else if (resetData?.properties?.action_link) {
        passwordResetUrl = resetData.properties.action_link
        checkoutLogger.info({ userId }, 'Password reset link generated successfully')
      }
    } catch (resetErr) {
      checkoutLogger.error({ error: resetErr }, 'Exception generating password reset link')
    }

    // Wait a moment for the trigger to fire
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify the public.users record was created by trigger
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .select('id, email, tier, payment_status')
      .eq('id', userId)
      .single()

    if (publicUserError) {
      checkoutLogger.error({ error: publicUserError, userId }, 'public.users record not found - trigger may not have fired!')
      // Create it manually if trigger failed
      checkoutLogger.warn({ userId }, 'Attempting to manually create public.users record')
      const { error: manualInsertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: customerEmail.toLowerCase(),
          full_name: lead?.name || customerName || '',
          email_verified: true,
          role: 'student',
          tier: 'basic',
          payment_status: 'pending'
        })

      if (manualInsertError) {
        checkoutLogger.error({ error: manualInsertError }, 'Failed to manually create public.users record')
        throw new Error(`Failed to create user profile for ${userId}`)
      } else {
        checkoutLogger.info({ userId }, 'Successfully created public.users record manually')
      }
    } else {
      checkoutLogger.info({ userId, publicUser }, 'Confirmed public.users record exists')
    }

    // Update the public.users record created by trigger with payment info
    await userRepo.updateTierAndPayment(
      userId,
      tier as 'basic' | 'premium' | 'vip',
      'paid'
    )

    // Mark lead as converted if exists
    if (lead) {
      await leadRepo.markAsConvertedByEmail(customerEmail)
    }

    return { userId, passwordResetUrl }
  }

  /**
   * Credit session packages to user
   */
  private async creditSessions(
    userId: string,
    sessionsToCredit: number,
    supabase: any,
    checkoutLogger: any
  ): Promise<void> {
    if (sessionsToCredit <= 0) {
      return
    }

    checkoutLogger.info(
      { userId, sessionsToCredit },
      `TODO: Credit ${sessionsToCredit} LevelUp sessions for user ${userId}`
    )

    // Temporary: Award bonus points instead
    try {
      await supabase.rpc('add_bonus_points', {
        p_user_id: userId,
        p_points: sessionsToCredit * 100 // 100 points per session credit
      })
      checkoutLogger.info(
        { userId, bonusPoints: sessionsToCredit * 100 },
        'Awarded bonus points instead of session credits'
      )
    } catch (err) {
      checkoutLogger.error({ error: err, userId }, 'Failed to award bonus points')
    }
  }

  /**
   * Send welcome/payment confirmation email
   */
  private async sendWelcomeEmail(
    email: string,
    name: string,
    tier: string,
    sessions: number,
    customerEmail: string,
    passwordResetUrl: string
  ): Promise<void> {
    const startTime = Date.now()

    try {
      // Map tier to payment confirmation email tier type
      const emailTier = (tier === 'vip' ? 'vip' : tier === 'premium' ? 'premium' : 'basic') as 'basic' | 'premium' | 'vip'

      // Render payment confirmation email template
      const html = await renderPaymentConfirmationEmail({
        customerName: name,
        tier: emailTier,
        sessions,
        portalUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.weblaunchacademy.com',
        email: customerEmail,
        passwordResetUrl
      })

      await resendAdapter.sendEmail({
        from: EMAIL_FROM,
        to: email,
        subject: EmailSubjects.PAYMENT_CONFIRMATION(tier),
        html,
      })

      logger.info(
        { type: 'email', email, tier, totalDuration: Date.now() - startTime },
        'Payment confirmation email sent successfully'
      )
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(
        { type: 'email', email, tier, error, duration },
        'Failed to send payment confirmation email'
      )
      // Don't re-throw - email failure shouldn't fail the webhook
    }
  }
}
