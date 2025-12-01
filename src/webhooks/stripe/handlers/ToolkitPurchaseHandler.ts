import Stripe from 'stripe'
import { BaseWebhookHandler } from '../BaseWebhookHandler'
import { logger, logPayment } from '@/lib/logger'
import { getAdminClient } from '@/adapters'

/**
 * Toolkit Purchase Handler
 *
 * Handles checkout.session.completed for Architecture Mastery Toolkit purchases
 *
 * Responsibilities:
 * 1. Verify toolkit purchase via metadata
 * 2. Create purchase record in database
 * 3. Grant access to product contents
 * 4. Log payment completion
 */
export class ToolkitPurchaseHandler extends BaseWebhookHandler {
  readonly eventType = 'checkout.session.completed'

  async handle(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session
    const startTime = Date.now()
    const sessionId = session.id

    // Check if this is a toolkit purchase
    const productSlug = session.metadata?.product_slug
    if (productSlug !== 'architecture-mastery-toolkit') {
      // Not a toolkit purchase, skip
      return
    }

    const userId = session.metadata?.user_id
    if (!userId) {
      logger.error(
        { type: 'toolkit_purchase', sessionId },
        'Missing user_id in metadata'
      )
      throw new Error('Missing user_id in checkout session metadata')
    }

    // Create child logger with purchase context
    const purchaseLogger = logger.child({
      type: 'toolkit_purchase',
      sessionId,
      userId,
      productSlug,
    })

    purchaseLogger.info('Processing toolkit purchase')

    const supabase = getAdminClient()

    try {
      // Get product from database
      const { data: product, error: productError } = await supabase
        .from('products' as any)
        .select('id, name, price')
        .eq('slug', productSlug)
        .single() as any

      if (productError || !product) {
        purchaseLogger.error({ error: productError }, 'Product not found')
        throw new Error(`Product not found: ${productSlug}`)
      }

      // Check if purchase already recorded (idempotency)
      // Use payment_intent if available, otherwise use session.id for $0 purchases
      const idempotencyKey = session.payment_intent || session.id
      const { data: existingPurchase } = await supabase
        .from('purchases' as any)
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .eq('stripe_payment_intent', idempotencyKey)
        .maybeSingle()

      if (existingPurchase) {
        purchaseLogger.info(
          { purchaseId: existingPurchase.id },
          'Purchase already recorded (idempotent)'
        )
        return
      }

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases' as any)
        .insert({
          user_id: userId,
          product_id: product.id,
          stripe_payment_intent: idempotencyKey, // Use session.id for $0 purchases
          amount_paid: (session.amount_total || 0) / 100, // Convert cents to dollars
          status: 'completed',
          access_granted: true,
        })
        .select('id')
        .single() as any

      if (purchaseError) {
        purchaseLogger.error({ error: purchaseError }, 'Failed to create purchase record')
        throw purchaseError
      }

      purchaseLogger.info({ purchaseId: purchase.id }, 'Purchase record created')

      // Increment total purchases counter
      const { error: updateError } = await (supabase as any).rpc('increment_product_purchases', {
        product_id: product.id
      })

      if (updateError) {
        purchaseLogger.error({ error: updateError }, 'Failed to increment purchase counter')
        // Don't throw - non-critical
      }

      // Log payment completion
      const amount = session.amount_total || 0
      const currency = session.currency || 'usd'
      logPayment('charge', 'succeeded', amount, currency, {
        userId,
        productSlug,
        productName: product.name,
        purchaseId: purchase.id,
      })

      const duration = Date.now() - startTime
      purchaseLogger.info(
        { purchaseId: purchase.id, duration },
        `Successfully processed toolkit purchase (${duration}ms)`
      )

    } catch (error) {
      const duration = Date.now() - startTime
      purchaseLogger.error(
        { error, duration },
        'Failed to process toolkit purchase'
      )
      // Re-throw to trigger webhook retry
      throw error
    }
  }
}
