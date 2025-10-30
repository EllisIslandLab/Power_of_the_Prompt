import Stripe from 'stripe'
import { BaseAdapter } from './BaseAdapter'
import { logger } from '@/lib/logger'

/**
 * Stripe Adapter
 *
 * Centralized adapter for Stripe payment processing operations.
 * Provides consistent error handling, retry logic, and logging for all Stripe operations.
 *
 * Features:
 * - Singleton pattern for consistent client instance
 * - Automatic retry logic for transient failures
 * - Structured logging for all operations
 * - Type-safe payment operations
 * - Easy to mock for testing
 *
 * Usage:
 * ```typescript
 * const stripe = StripeAdapter.getInstance()
 * const session = await stripe.getCheckoutSession(sessionId)
 * const intent = await stripe.createPaymentIntent(amount, currency, metadata)
 * ```
 */

export class StripeAdapter extends BaseAdapter {
  private static instance: StripeAdapter
  private client: Stripe

  private constructor() {
    super('stripe')

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }

    this.client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    })

    logger.info({ type: 'service', service: 'stripe' }, 'Stripe adapter initialized')
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): StripeAdapter {
    if (!StripeAdapter.instance) {
      StripeAdapter.instance = new StripeAdapter()
    }
    return StripeAdapter.instance
  }

  /**
   * Get the raw Stripe client (for operations not yet wrapped)
   */
  public getClient(): Stripe {
    return this.client
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    const startTime = Date.now()

    try {
      const paymentIntent = await this.executeWithRetry(
        () =>
          this.client.paymentIntents.create({
            amount,
            currency,
            metadata,
          }),
        'createPaymentIntent'
      )

      const duration = Date.now() - startTime
      this.logSuccess('createPaymentIntent', duration, {
        amount,
        currency,
        paymentIntentId: paymentIntent.id,
      })

      return paymentIntent
    } catch (error) {
      const duration = Date.now() - startTime
      this.logError('createPaymentIntent', error, duration, { amount, currency })
      throw error
    }
  }

  /**
   * Get checkout session details
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    const startTime = Date.now()

    try {
      const session = await this.executeWithRetry(
        () => this.client.checkout.sessions.retrieve(sessionId),
        'getCheckoutSession'
      )

      const duration = Date.now() - startTime
      this.logSuccess('getCheckoutSession', duration, { sessionId })

      return session
    } catch (error) {
      const duration = Date.now() - startTime
      this.logError('getCheckoutSession', error, duration, { sessionId })
      throw error
    }
  }

  /**
   * List line items for a checkout session
   */
  async listLineItems(
    sessionId: string,
    expand?: string[]
  ): Promise<Stripe.ApiList<Stripe.LineItem>> {
    const startTime = Date.now()

    try {
      const lineItems = await this.executeWithRetry(
        () =>
          this.client.checkout.sessions.listLineItems(sessionId, {
            expand,
          }),
        'listLineItems'
      )

      const duration = Date.now() - startTime
      this.logSuccess('listLineItems', duration, {
        sessionId,
        itemCount: lineItems.data.length,
      })

      return lineItems
    } catch (error) {
      const duration = Date.now() - startTime
      this.logError('listLineItems', error, duration, { sessionId })
      throw error
    }
  }

  /**
   * Construct webhook event from raw body and signature
   */
  constructWebhookEvent(
    rawBody: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    const startTime = Date.now()

    try {
      const event = this.client.webhooks.constructEvent(rawBody, signature, webhookSecret)

      const duration = Date.now() - startTime
      logger.debug(
        {
          type: 'service',
          service: 'stripe',
          operation: 'constructWebhookEvent',
          eventType: event.type,
          eventId: event.id,
          duration,
        },
        `Stripe webhook event constructed (${duration}ms)`
      )

      return event
    } catch (error) {
      const duration = Date.now() - startTime
      this.logError('constructWebhookEvent', error, duration)
      throw error
    }
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(
    params: Stripe.Checkout.SessionCreateParams
  ): Promise<Stripe.Checkout.Session> {
    const startTime = Date.now()

    try {
      const session = await this.executeWithRetry(
        () => this.client.checkout.sessions.create(params),
        'createCheckoutSession'
      )

      const duration = Date.now() - startTime
      this.logSuccess('createCheckoutSession', duration, {
        sessionId: session.id,
        mode: params.mode,
      })

      return session
    } catch (error) {
      const duration = Date.now() - startTime
      this.logError('createCheckoutSession', error, duration, { mode: params.mode })
      throw error
    }
  }

  /**
   * Get customer details
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    const startTime = Date.now()

    try {
      const customer = await this.executeWithRetry(
        () => this.client.customers.retrieve(customerId),
        'getCustomer'
      )

      const duration = Date.now() - startTime
      this.logSuccess('getCustomer', duration, { customerId })

      return customer
    } catch (error) {
      const duration = Date.now() - startTime
      this.logError('getCustomer', error, duration, { customerId })
      throw error
    }
  }

  /**
   * List products
   */
  async listProducts(params?: Stripe.ProductListParams): Promise<Stripe.ApiList<Stripe.Product>> {
    const startTime = Date.now()

    try {
      const products = await this.executeWithRetry(
        () => this.client.products.list(params),
        'listProducts'
      )

      const duration = Date.now() - startTime
      this.logSuccess('listProducts', duration, { productCount: products.data.length })

      return products
    } catch (error) {
      const duration = Date.now() - startTime
      this.logError('listProducts', error, duration)
      throw error
    }
  }
}

// Export singleton instance for convenience
export const stripeAdapter = StripeAdapter.getInstance()
