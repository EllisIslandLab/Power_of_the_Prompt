import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import { stripeAdapter } from '@/adapters';
import { createStripeWebhookRegistry } from '@/webhooks/stripe';

// Stripe webhook needs the raw body, so we disable body parsing
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Create webhook registry with all handlers
const webhookRegistry = createStripeWebhookRegistry();

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error({ type: 'stripe_webhook' }, 'Stripe not configured - missing credentials');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      logger.warn({ type: 'stripe_webhook' }, 'Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      event = stripeAdapter.constructWebhookEvent(body, sig, webhookSecret);
    } catch (err: any) {
      logger.error(
        { type: 'stripe_webhook', error: err.message },
        'Webhook signature verification failed'
      );
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    logger.info(
      { type: 'stripe_webhook', eventType: event.type, eventId: event.id },
      `Received Stripe webhook: ${event.type}`
    );

    // Dispatch event to appropriate handler
    const handled = await webhookRegistry.dispatch(event);

    if (!handled) {
      logger.debug(
        { type: 'stripe_webhook', eventType: event.type },
        `No handler for event type: ${event.type}`
      );
    }

    const duration = Date.now() - startTime;
    logger.info(
      { type: 'stripe_webhook', eventType: event.type, duration, handled },
      `Webhook processed ${handled ? 'successfully' : '(unhandled)'} (${duration}ms)`
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      { type: 'stripe_webhook', error, duration },
      'Webhook handler failed'
    );
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
