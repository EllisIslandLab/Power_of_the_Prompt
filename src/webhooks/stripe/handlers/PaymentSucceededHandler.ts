import Stripe from 'stripe'
import { BaseWebhookHandler } from '../BaseWebhookHandler'
import { logger } from '@/lib/logger'

/**
 * Payment Succeeded Handler
 *
 * Handles the payment_intent.succeeded webhook event from Stripe.
 * This is triggered when a payment is successfully processed.
 *
 * Note: Most payment handling happens in CheckoutCompletedHandler.
 * This handler is primarily for logging and monitoring purposes.
 */
export class PaymentSucceededHandler extends BaseWebhookHandler {
  readonly eventType = 'payment_intent.succeeded'

  async handle(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    logger.info(
      {
        type: 'payment',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerId: paymentIntent.customer,
        metadata: paymentIntent.metadata
      },
      'Payment intent succeeded'
    )

    // Most payment processing happens in checkout.session.completed
    // This event is mainly for logging and potential future use cases
    // like subscription renewals or manual payment intents
  }
}
