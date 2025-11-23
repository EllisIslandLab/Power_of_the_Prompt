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
export { AIPremiumHandler } from './handlers/AIPremiumHandler'
export { TextbookHandler } from './handlers/TextbookHandler'

// Factory function to create a registry with all handlers registered
import { WebhookRegistry } from './WebhookRegistry'
import { CheckoutCompletedHandler } from './handlers/CheckoutCompletedHandler'
import { PaymentSucceededHandler } from './handlers/PaymentSucceededHandler'
import { ToolkitPurchaseHandler } from './handlers/ToolkitPurchaseHandler'
import { AIPremiumHandler } from './handlers/AIPremiumHandler'
import { TextbookHandler } from './handlers/TextbookHandler'

/**
 * Create a Stripe webhook registry with all handlers registered
 */
export function createStripeWebhookRegistry(): WebhookRegistry {
  const registry = new WebhookRegistry()

  // Register all handlers
  // NOTE: Handlers are checked in order via canHandle() method
  // More specific handlers should be registered first
  registry.registerAll([
    new PaymentSucceededHandler(),
    new AIPremiumHandler(),        // Phase 2A: AI Premium Builder ($5)
    new TextbookHandler(),          // Phase 2A: Launch Guide ($19)
    new ToolkitPurchaseHandler(),   // Architecture Mastery Toolkit ($190)
    new CheckoutCompletedHandler(), // Fallback for other purchases
  ])

  return registry
}
