import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { renderPaymentConfirmationEmail, EmailSubjects, EMAIL_FROM } from '@/lib/email-builder';
import { logger, logPayment, logService, logSecurity } from '@/lib/logger';

// Stripe webhook needs the raw body, so we disable body parsing
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY!);

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
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
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

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.info(
          { type: 'stripe_webhook', paymentIntentId: paymentIntent.id, amount: paymentIntent.amount },
          'Payment succeeded'
        );
        break;

      default:
        logger.debug({ type: 'stripe_webhook', eventType: event.type }, `Unhandled event type: ${event.type}`);
    }

    const duration = Date.now() - startTime;
    logger.info(
      { type: 'stripe_webhook', eventType: event.type, duration },
      `Webhook processed successfully (${duration}ms)`
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

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const startTime = Date.now();
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;
  const sessionId = session.id;

  // Create child logger with checkout context
  const checkoutLogger = logger.child({
    type: 'checkout',
    sessionId,
    customerEmail,
  });

  if (!customerEmail) {
    checkoutLogger.error('No customer email in checkout session');
    return;
  }

  checkoutLogger.info('Processing checkout session');

  try {
    // Get the product details from Stripe
    const stripeStartTime = Date.now();
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });
    logService('stripe', 'listLineItems', true, Date.now() - stripeStartTime, { sessionId });

    const product = lineItems.data[0].price?.product as Stripe.Product;
    const metadata = product.metadata;

    checkoutLogger.debug({ metadata }, 'Retrieved product metadata');

    // Determine user tier and sessions based on product
    let tier = 'basic';
    let sessionsToCredit = 0;
    let paymentStatus = 'paid';

    if (metadata.tier) {
      // A+ Program (premium_vip tier with 12 sessions)
      tier = metadata.tier === 'premium_vip' ? 'vip' : metadata.tier;
      sessionsToCredit = parseInt(metadata.total_lvl_ups) || 0;
    } else if (metadata.course_type === 'basic_course') {
      // Basic Course (standard tier, no sessions unless they buy add-ons)
      tier = 'basic';
      sessionsToCredit = metadata.includes_lvl_ups === 'true' ? 3 : 0;
    }

    // 1. Check if lead exists
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('email', customerEmail)
      .single();

    // 2. Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, tier')
      .eq('email', customerEmail)
      .single();

    let userId: string;

    if (existingUser) {
      // User already exists
      userId = existingUser.id;
      checkoutLogger.info({ userId, currentTier: existingUser.tier }, 'User already exists');

      // Upgrade tier if needed (vip > premium > basic)
      const tierHierarchy: Record<string, number> = { basic: 1, premium: 2, vip: 3 };
      const currentTierLevel = tierHierarchy[existingUser.tier] || 0;
      const newTierLevel = tierHierarchy[tier] || 0;

      if (newTierLevel > currentTierLevel) {
        await supabase
          .from('users')
          .update({
            tier: tier,
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        checkoutLogger.info(
          { userId, oldTier: existingUser.tier, newTier: tier },
          `Upgraded user tier from ${existingUser.tier} to ${tier}`
        );
      }
    } else {
      // Create new auth user - the handle_new_user trigger will create the public.users record
      checkoutLogger.info('Creating new auth user');

      // Generate a random password (user will reset via email link)
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: customerEmail.toLowerCase(),
        password: tempPassword,
        email_confirm: true, // Auto-confirm since they paid
        user_metadata: {
          full_name: lead?.name || customerName || '',
        }
      });

      if (authError) {
        checkoutLogger.error({ error: authError }, 'Failed to create auth user');
        throw authError;
      }

      userId = authUser.user.id;
      checkoutLogger.info({ userId }, 'Created new auth user');
      logSecurity('signup', 'low', { userId, email: customerEmail, source: 'payment' });

      // Update the public.users record created by trigger with payment info
      await supabase
        .from('users')
        .update({
          tier: tier,
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Mark lead as converted if exists
      if (lead) {
        await supabase
          .from('leads')
          .update({
            status: 'converted',
            converted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('email', customerEmail);
      }
    }

    // 3. Create session package if applicable
    // TODO: Re-implement session credits using new points system
    // The old 'sessions' table was removed. Need to create a new 'session_credits' table
    // or integrate with the points system for tracking purchased consultation credits.
    if (sessionsToCredit > 0) {
      checkoutLogger.info(
        { userId, sessionsToCredit },
        `TODO: Credit ${sessionsToCredit} LevelUp sessions for user ${userId}`
      );
      // Temporary: Award bonus points instead
      try {
        await supabase.rpc('add_bonus_points', {
          p_user_id: userId,
          p_points: sessionsToCredit * 100 // 100 points per session credit
        });
        checkoutLogger.info(
          { userId, bonusPoints: sessionsToCredit * 100 },
          'Awarded bonus points instead of session credits'
        );
      } catch (err) {
        checkoutLogger.error({ error: err, userId }, 'Failed to award bonus points');
      }
    }

    // 4. Log payment completion
    const amount = session.amount_total || 0;
    const currency = session.currency || 'usd';
    logPayment('charge', 'succeeded', amount, currency, {
      userId,
      tier,
      sessionsToCredit,
      customerId: session.customer,
    });

    // 5. Send welcome email
    await sendWelcomeEmail(customerEmail, customerName || lead?.name || '', tier, sessionsToCredit);

    const duration = Date.now() - startTime;
    checkoutLogger.info(
      { userId, tier, duration },
      `Successfully processed checkout (${duration}ms)`
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    checkoutLogger.error(
      { error, duration },
      'Failed to process checkout'
    );
    // Error is logged but not rethrown to prevent webhook retry storms
  }
}

async function sendWelcomeEmail(email: string, name: string, tier: string, sessions: number) {
  const startTime = Date.now();

  try {
    // Map tier to payment confirmation email tier type
    const emailTier = (tier === 'vip' ? 'vip' : tier === 'premium' ? 'premium' : 'basic') as 'basic' | 'premium' | 'vip';

    // Render payment confirmation email template
    const html = await renderPaymentConfirmationEmail({
      customerName: name,
      tier: emailTier,
      sessions,
      portalUrl: process.env.NEXT_PUBLIC_URL
    });

    const sendStartTime = Date.now();
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: EmailSubjects.PAYMENT_CONFIRMATION(tier),
      html,
    });

    const duration = Date.now() - sendStartTime;
    logService('resend', 'sendPaymentConfirmation', true, duration, { email, tier });

    logger.info(
      { type: 'email', email, tier, totalDuration: Date.now() - startTime },
      'Payment confirmation email sent successfully'
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      { type: 'email', email, tier, error, duration },
      'Failed to send payment confirmation email'
    );
    logService('resend', 'sendPaymentConfirmation', false, duration, { email, tier });
  }
}
