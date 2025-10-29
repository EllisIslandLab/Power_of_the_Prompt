import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { renderPaymentConfirmationEmail, EmailSubjects, EMAIL_FROM } from '@/lib/email-builder';

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
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
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
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;

      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;

  if (!customerEmail) {
    console.error('No customer email in checkout session');
    return;
  }

  console.log(`Processing payment for ${customerEmail}`);

  try {
    // Get the product details from Stripe
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });

    const product = lineItems.data[0].price?.product as Stripe.Product;
    const metadata = product.metadata;

    console.log('Product metadata:', metadata);

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
      console.log(`User already exists: ${userId}`);

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
        console.log(`Upgraded user tier to ${tier}`);
      }
    } else {
      // Create new auth user - the handle_new_user trigger will create the public.users record
      console.log('Creating new auth user...');

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
        console.error('Error creating auth user:', authError);
        throw authError;
      }

      userId = authUser.user.id;
      console.log(`Created new auth user: ${userId}`);

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
      console.log(`TODO: Credit ${sessionsToCredit} LevelUp sessions for user ${userId}`);
      // Temporary: Award bonus points instead
      try {
        await supabase.rpc('add_bonus_points', {
          p_user_id: userId,
          p_points: sessionsToCredit * 100 // 100 points per session credit
        });
        console.log(`Temporarily awarded ${sessionsToCredit * 100} bonus points instead of session credits`);
      } catch (err) {
        console.error('Error awarding bonus points:', err);
      }
    }

    // 4. Send welcome email
    await sendWelcomeEmail(customerEmail, customerName || lead?.name || '', tier, sessionsToCredit);

    console.log(`Successfully processed checkout for ${customerEmail}`);

  } catch (error) {
    console.error('Error processing checkout:', error);
    // You might want to log this to an error tracking service like Sentry
  }
}

async function sendWelcomeEmail(email: string, name: string, tier: string, sessions: number) {
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

    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: EmailSubjects.PAYMENT_CONFIRMATION(tier),
      html,
    });

    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}
