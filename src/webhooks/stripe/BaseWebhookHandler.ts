import Stripe from 'stripe'
import { logger } from '@/lib/logger'

/**
 * Base Webhook Handler
 *
 * Abstract base class for all Stripe webhook event handlers.
 * Provides common functionality like logging and error handling.
 *
 * Usage:
 * ```typescript
 * export class CheckoutCompletedHandler extends BaseWebhookHandler {
 *   async handle(event: Stripe.Event): Promise<void> {
 *     const session = event.data.object as Stripe.Checkout.Session
 *     // ... business logic
 *   }
 * }
 * ```
 */
export abstract class BaseWebhookHandler {
  /**
   * The Stripe event type this handler is responsible for
   */
  abstract readonly eventType: string

  /**
   * Handle the webhook event
   * Subclasses must implement this method with their specific logic
   */
  abstract handle(event: Stripe.Event): Promise<void>

  /**
   * Validate that the event type matches what this handler expects
   */
  protected validateEventType(event: Stripe.Event): void {
    if (event.type !== this.eventType) {
      throw new Error(
        `Event type mismatch: expected ${this.eventType}, got ${event.type}`
      )
    }
  }

  /**
   * Log handler start
   */
  protected logStart(event: Stripe.Event, context?: Record<string, any>): void {
    logger.info(
      {
        type: 'stripe_webhook_handler',
        eventType: event.type,
        eventId: event.id,
        handler: this.constructor.name,
        ...context
      },
      `${this.constructor.name} started`
    )
  }

  /**
   * Log handler success
   */
  protected logSuccess(event: Stripe.Event, duration: number, context?: Record<string, any>): void {
    logger.info(
      {
        type: 'stripe_webhook_handler',
        eventType: event.type,
        eventId: event.id,
        handler: this.constructor.name,
        duration,
        ...context
      },
      `${this.constructor.name} completed successfully (${duration}ms)`
    )
  }

  /**
   * Log handler error
   */
  protected logError(event: Stripe.Event, error: any, duration: number, context?: Record<string, any>): void {
    logger.error(
      {
        type: 'stripe_webhook_handler',
        eventType: event.type,
        eventId: event.id,
        handler: this.constructor.name,
        error: error.message || error,
        stack: error.stack,
        duration,
        ...context
      },
      `${this.constructor.name} failed`
    )
  }

  /**
   * Execute the handler with automatic logging and error handling
   */
  async execute(event: Stripe.Event): Promise<void> {
    const startTime = Date.now()

    this.validateEventType(event)
    this.logStart(event)

    try {
      await this.handle(event)
      const duration = Date.now() - startTime
      this.logSuccess(event, duration)
    } catch (error: any) {
      const duration = Date.now() - startTime
      this.logError(event, error, duration)
      // Re-throw to allow caller to handle
      throw error
    }
  }
}
