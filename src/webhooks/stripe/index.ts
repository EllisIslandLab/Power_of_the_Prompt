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
export { ToolkitPurchaseHandler } from './handlers/ToolkitPurchaseHandler'

// Factory function to create a registry with all handlers registered
import { WebhookRegistry } from './WebhookRegistry'
import { CheckoutCompletedHandler } from './handlers/CheckoutCompletedHandler'
import { PaymentSucceededHandler } from './handlers/PaymentSucceededHandler'
import { ToolkitPurchaseHandler } from './handlers/ToolkitPurchaseHandler'

/**
 * Create a Stripe webhook registry with all handlers registered
 */
export function createStripeWebhookRegistry(): WebhookRegistry {
  const registry = new WebhookRegistry()

  // Register all handlers
  // NOTE: Later registrations overwrite earlier ones for the same event type
  // ToolkitPurchaseHandler must be registered LAST to take precedence
  registry.registerAll([
    new CheckoutCompletedHandler(), // Handles course/tier purchases
    new PaymentSucceededHandler(),
    new ToolkitPurchaseHandler(), // Must be last - overrides CheckoutCompletedHandler
  ])

  return registry
}
