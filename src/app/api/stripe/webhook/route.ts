import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Resend } from 'resend';

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
      // Create new user
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          email: customerEmail,
          full_name: lead?.name || customerName || '',
          email_verified: false,
          role: 'student',
          tier: tier,
          payment_status: paymentStatus,
        })
        .select()
        .single();

      if (createUserError) throw createUserError;

      userId = newUser.id;
      console.log(`Created new user: ${userId}`);

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
    if (sessionsToCredit > 0) {
      const expiresAt = metadata.lvl_up_expiry_months
        ? new Date(Date.now() + parseInt(metadata.lvl_up_expiry_months) * 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          package_size: sessionsToCredit,
          sessions_total: sessionsToCredit,
          sessions_used: 0,
          stripe_payment_id: session.payment_intent as string,
          status: 'active',
          expires_at: expiresAt,
        });

      if (sessionError) throw sessionError;

      console.log(`Added ${sessionsToCredit} sessions for user ${userId}`);
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
    const programName = tier === 'vip' ? 'A+ Program' : 'Web Launch Course';
    const portalUrl = `${process.env.NEXT_PUBLIC_URL}/portal`;

    await resend.emails.send({
      from: 'Web Launch Academy <noreply@weblaunchacademy.com>',
      to: email,
      subject: `Welcome to ${programName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to Web Launch Academy, ${name || 'there'}!</h2>

          <p>Thank you for enrolling in the ${programName}. You're about to embark on an exciting journey to build your professional website.</p>

          ${sessions > 0 ? `
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Your 1-on-1 Sessions</h3>
              <p>You have <strong>${sessions} Level Up sessions</strong> included in your program. These are personalized coaching sessions where we work together on your website.</p>
            </div>
          ` : ''}

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Next Steps:</h3>
            <ol>
              <li>Create your account at the student portal</li>
              <li>Complete your profile setup</li>
              <li>Access your course materials</li>
              ${sessions > 0 ? '<li>Schedule your first 1-on-1 session</li>' : ''}
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}"
               style="background-color: #ffdb57; color: #11296b; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Access Student Portal
            </a>
          </div>

          <p>If you have any questions, simply reply to this email. I personally read and respond to every message.</p>

          <p>Excited to work with you!<br>
          Matthew Ellis<br>
          Web Launch Academy</p>
        </div>
      `,
    });

    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}
