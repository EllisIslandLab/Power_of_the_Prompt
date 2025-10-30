import Stripe from 'stripe'
import { BaseWebhookHandler } from '../BaseWebhookHandler'
import { renderPaymentConfirmationEmail, EmailSubjects, EMAIL_FROM } from '@/lib/email-builder'
import { logger, logPayment, logSecurity } from '@/lib/logger'
import { UserRepository, LeadRepository } from '@/repositories'
import { stripeAdapter, resendAdapter, getAdminClient } from '@/adapters'

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

      const product = lineItems.data[0].price?.product as Stripe.Product
      const metadata = product.metadata

      checkoutLogger.debug({ metadata }, 'Retrieved product metadata')

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

      if (existingUser) {
        // User already exists - handle upgrade
        userId = await this.handleExistingUser(
          existingUser,
          tier,
          paymentStatus,
          userRepo,
          checkoutLogger
        )
      } else {
        // Create new user
        userId = await this.handleNewUser(
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
        sessionsToCredit
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

    if (metadata.tier) {
      // A+ Program (premium_vip tier with 12 sessions)
      tier = metadata.tier === 'premium_vip' ? 'vip' : metadata.tier
      sessionsToCredit = parseInt(metadata.total_lvl_ups) || 0
    } else if (metadata.course_type === 'basic_course') {
      // Basic Course (standard tier, no sessions unless they buy add-ons)
      tier = 'basic'
      sessionsToCredit = metadata.includes_lvl_ups === 'true' ? 3 : 0
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
  ): Promise<string> {
    checkoutLogger.info('Creating new auth user')

    // Generate a random password (user will reset via email link)
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: customerEmail.toLowerCase(),
      password: tempPassword,
      email_confirm: true, // Auto-confirm since they paid
      user_metadata: {
        full_name: lead?.name || customerName || '',
      }
    })

    if (authError) {
      checkoutLogger.error({ error: authError }, 'Failed to create auth user')
      throw authError
    }

    const userId = authUser.user.id
    checkoutLogger.info({ userId }, 'Created new auth user')
    logSecurity('signup', 'low', { userId, email: customerEmail, source: 'payment' })

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

    return userId
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
    sessions: number
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
        portalUrl: process.env.NEXT_PUBLIC_URL
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
