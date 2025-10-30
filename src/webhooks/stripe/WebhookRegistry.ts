import Stripe from 'stripe'
import { BaseWebhookHandler } from './BaseWebhookHandler'
import { logger } from '@/lib/logger'

/**
 * Webhook Handler Registry
 *
 * Central registry for all Stripe webhook event handlers.
 * Allows registering handlers and dispatching events to the appropriate handler.
 *
 * Benefits:
 * - Extensible: Add new handlers without modifying existing code
 * - Type-safe: Full TypeScript support
 * - Testable: Easy to mock individual handlers
 * - Maintainable: Each handler is its own class
 *
 * Usage:
 * ```typescript
 * const registry = new WebhookRegistry()
 * registry.register(new CheckoutCompletedHandler())
 * registry.register(new PaymentSucceededHandler())
 *
 * // Dispatch event to appropriate handler
 * await registry.dispatch(event)
 * ```
 */
export class WebhookRegistry {
  private handlers: Map<string, BaseWebhookHandler> = new Map()

  /**
   * Register a webhook handler for a specific event type
   */
  register(handler: BaseWebhookHandler): void {
    const eventType = handler.eventType

    if (this.handlers.has(eventType)) {
      logger.warn(
        {
          type: 'webhook_registry',
          eventType,
          existingHandler: this.handlers.get(eventType)?.constructor.name,
          newHandler: handler.constructor.name
        },
        `Overwriting existing handler for event type: ${eventType}`
      )
    }

    this.handlers.set(eventType, handler)

    logger.debug(
      {
        type: 'webhook_registry',
        eventType,
        handler: handler.constructor.name
      },
      `Registered handler for ${eventType}`
    )
  }

  /**
   * Register multiple handlers at once
   */
  registerAll(handlers: BaseWebhookHandler[]): void {
    handlers.forEach(handler => this.register(handler))
  }

  /**
   * Get a handler for a specific event type
   */
  get(eventType: string): BaseWebhookHandler | undefined {
    return this.handlers.get(eventType)
  }

  /**
   * Check if a handler exists for an event type
   */
  has(eventType: string): boolean {
    return this.handlers.has(eventType)
  }

  /**
   * Get all registered event types
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Dispatch an event to the appropriate handler
   * Returns true if handled, false if no handler found
   */
  async dispatch(event: Stripe.Event): Promise<boolean> {
    const handler = this.handlers.get(event.type)

    if (!handler) {
      logger.debug(
        {
          type: 'webhook_registry',
          eventType: event.type,
          eventId: event.id,
          registeredTypes: this.getRegisteredEventTypes()
        },
        `No handler registered for event type: ${event.type}`
      )
      return false
    }

    try {
      await handler.execute(event)
      return true
    } catch (error: any) {
      // Error already logged by BaseWebhookHandler
      // Re-throw to allow caller to handle
      throw error
    }
  }

  /**
   * Clear all registered handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear()
    logger.debug({ type: 'webhook_registry' }, 'Cleared all handlers')
  }

  /**
   * Get count of registered handlers
   */
  count(): number {
    return this.handlers.size
  }
}
