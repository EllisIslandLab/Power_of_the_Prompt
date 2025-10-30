/**
 * Stripe Webhook Handler Framework
 *
 * Exports all webhook handlers and registry for use in API routes.
 *
 * Usage:
 * ```typescript
 * import { createStripeWebhookRegistry } from '@/webhooks/stripe'
 *
 * const registry = createStripeWebhookRegistry()
 * await registry.dispatch(event)
 * ```
 */

export { BaseWebhookHandler } from './BaseWebhookHandler'
export { WebhookRegistry } from './WebhookRegistry'

// Export all handlers
export { CheckoutCompletedHandler } from './handlers/CheckoutCompletedHandler'
export { PaymentSucceededHandler } from './handlers/PaymentSucceededHandler'

// Factory function to create a registry with all handlers registered
import { WebhookRegistry } from './WebhookRegistry'
import { CheckoutCompletedHandler } from './handlers/CheckoutCompletedHandler'
import { PaymentSucceededHandler } from './handlers/PaymentSucceededHandler'

/**
 * Create a Stripe webhook registry with all handlers registered
 */
export function createStripeWebhookRegistry(): WebhookRegistry {
  const registry = new WebhookRegistry()

  // Register all handlers
  registry.registerAll([
    new CheckoutCompletedHandler(),
    new PaymentSucceededHandler(),
  ])

  return registry
}
