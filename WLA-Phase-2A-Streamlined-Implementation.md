# Web Launch Academy - Phase 2A: Core Payments & AI (Streamlined)

## 🎯 Project Overview

This is Phase 2A - the foundation layer that adds real payments, AI conversation, and email automation to your existing Web Launch Academy platform. This implementation focuses on the **3 products you currently have available**:

1. **AI Premium** ($5) - Already exists in Stripe
2. **Textbook + Code** ($19) - New product
3. **Architecture Mastery Toolkit** ($190) - Already has Stripe integration

---

## 📋 Prerequisites

Before starting Phase 2A:
- ✅ Database migration completed (`migration-phase-2a-foundation.sql`)
- ✅ Existing tables: `users`, `demo_sessions`, `user_purchases`, `components`, etc.
- ✅ Stripe products created for AI Premium, Textbook, Architecture Toolkit
- ✅ Anthropic API key obtained
- ✅ Resend API key obtained

---

## 🗄️ Database Status

### **Existing Tables (Already Created):**
- ✅ `users` - Now has AI credit fields
- ✅ `demo_sessions` - Now has user_id link
- ✅ `user_purchases` - Purchase history
- ✅ `components` - Component library
- ✅ `template_submissions` - User submissions
- ✅ `referrals` - Referral system

### **New Tables (From Migration):**
- ✅ `ai_interaction_logs` - AI conversation tracking
- ✅ `email_logs` - Email delivery tracking
- ✅ `stripe_checkout_sessions` - Payment state tracking

---

## 💳 Payment Flow Architecture

### **Three Payment Entry Points:**

```
Entry Point 1: Upfront AI Premium ($5)
├─ User clicks "AI Premium - $5" on /get-started
├─ Goes to Stripe checkout immediately
├─ After payment: Returns to AI-guided builder
└─ System: Adds 30 AI credits to user account

Entry Point 2: During Build (Upgrade to AI)
├─ User in free builder sees "Improve with AI - $5"
├─ Goes to Stripe checkout
├─ Saves current state (step, form data, scroll position)
├─ After payment: Returns to EXACT same step
└─ System: Adds 30 AI credits if first time

Entry Point 3: After Preview (Textbook or Toolkit)
├─ User views preview in modal
├─ Sees pricing options with rollover
├─ Clicks tier: Textbook ($19) or Toolkit ($190)
├─ Goes to Stripe checkout with rollover calculation
├─ After payment: Redirect to portal with download
└─ System: Grants access to purchased materials
```

---

## 🔧 Implementation: Consolidated Payment API

### **API Route: /api/payments/create-checkout**

This replaces your existing separate checkout endpoints with ONE unified API.

```typescript
// app/api/payments/create-checkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { calculateRolloverPrice } from '@/lib/payments/calculateRollover';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
});

export async function POST(req: NextRequest) {
  try {
    const { 
      tier,           // 'ai_premium', 'textbook', 'architecture'
      userEmail, 
      userName,
      sessionId,      // Demo session ID (optional)
      returnState     // For mid-build purchases (optional)
    } = await req.json();
    
    const supabase = createClient();
    
    // Get or create user
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single();
    
    if (!user) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({ 
          email: userEmail,
          name: userName 
        })
        .select()
        .single();
      user = newUser;
    }
    
    // Get purchase history for rollover
    const { data: purchases } = await supabase
      .from('user_purchases')
      .select('tier, amount_paid')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: true });
    
    // Calculate pricing with rollover
    const pricing = calculateRolloverPrice(tier, {
      tiers: purchases || []
    });
    
    // Get Stripe price ID
    const priceId = getTierPriceId(tier);
    
    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid tier: ${tier}` },
        { status: 400 }
      );
    }
    
    // Determine success URL based on context
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    let successUrl: string;
    let cancelUrl: string;
    
    if (returnState && sessionId) {
      // Mid-build purchase - return to exact step
      successUrl = `${baseUrl}/get-started/build/${sessionId}?payment=success&return=${encodeURIComponent(JSON.stringify(returnState))}`;
      cancelUrl = `${baseUrl}/get-started/build/${sessionId}?payment=canceled`;
    } else if (sessionId) {
      // After preview - return to preview with success
      successUrl = `${baseUrl}/get-started/preview/${sessionId}?payment=success`;
      cancelUrl = `${baseUrl}/get-started/preview/${sessionId}?payment=canceled`;
    } else {
      // General purchase - go to portal
      successUrl = `${baseUrl}/portal?payment=success&tier=${tier}`;
      cancelUrl = `${baseUrl}/get-started?payment=canceled`;
    }
    
    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      // Apply rollover discount if applicable
      ...(pricing.rolloverCredit > 0 && {
        discounts: [{
          coupon: await createRolloverCoupon(pricing.rolloverCredit)
        }]
      }),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tier,
        sessionId: sessionId || '',
        userEmail,
        rolloverCredit: pricing.rolloverCredit.toString(),
        skipDiscount: pricing.skipDiscount.toString(),
        finalPrice: pricing.finalPrice.toString()
      },
      allow_promotion_codes: true
    });
    
    // Store checkout session in database
    await supabase
      .from('stripe_checkout_sessions')
      .insert({
        stripe_session_id: checkoutSession.id,
        stripe_customer_id: checkoutSession.customer as string,
        user_email: userEmail,
        user_id: user.id,
        tier,
        product_id: getTierProductId(tier),
        price_id: priceId,
        amount_total: pricing.finalPrice,
        rollover_credit: pricing.rolloverCredit,
        skip_discount: pricing.skipDiscount,
        return_state: returnState,
        status: 'pending',
        expires_at: new Date(checkoutSession.expires_at * 1000)
      });
    
    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    });
    
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Helper: Get Stripe Price ID for tier
function getTierPriceId(tier: string): string | null {
  const priceIds: Record<string, string> = {
    ai_premium: process.env.STRIPE_PRICE_AI_PREMIUM_ID!,
    textbook: process.env.STRIPE_PRICE_TEXTBOOK_ID!,
    architecture: process.env.STRIPE_PRICE_ARCHITECTURE_ID!
  };
  
  return priceIds[tier] || null;
}

// Helper: Get Stripe Product ID for tier
function getTierProductId(tier: string): string | null {
  const productIds: Record<string, string> = {
    ai_premium: process.env.STRIPE_PRODUCT_AI_PREMIUM_ID!,
    textbook: process.env.STRIPE_PRODUCT_TEXTBOOK_ID!,
    architecture: process.env.STRIPE_PRODUCT_ARCHITECTURE_ID!
  };
  
  return productIds[tier] || null;
}

// Helper: Create rollover discount coupon
async function createRolloverCoupon(rolloverAmount: number): Promise<string> {
  const coupon = await stripe.coupons.create({
    amount_off: Math.round(rolloverAmount * 100), // Convert to cents
    currency: 'usd',
    duration: 'once',
    name: `Rollover Credit: $${rolloverAmount.toFixed(2)}`
  });
  
  return coupon.id;
}
```

---

## 💰 Rollover Pricing Calculator

```typescript
// lib/payments/calculateRollover.ts

interface PurchaseHistory {
  tiers: Array<{
    tier: string;
    amount_paid: number;
  }>;
}

interface PricingResult {
  originalPrice: number;
  rolloverCredit: number;
  skipDiscount: number;
  finalPrice: number;
  totalSpentSoFar: number;
}

// Only the 3 tiers you have
const TIER_PRICES: Record<string, number> = {
  ai_premium: 5,
  textbook: 19,
  architecture: 190
};

const TIER_ORDER = ['ai_premium', 'textbook', 'architecture'];

export function calculateRolloverPrice(
  targetTier: string,
  purchaseHistory: PurchaseHistory
): PricingResult {
  const originalPrice = TIER_PRICES[targetTier];
  
  if (!originalPrice) {
    throw new Error(`Unknown tier: ${targetTier}`);
  }
  
  // Calculate total spent so far
  const totalSpentSoFar = purchaseHistory.tiers.reduce(
    (sum, purchase) => sum + purchase.amount_paid,
    0
  );
  
  // Get last purchased tier
  const lastTier = purchaseHistory.tiers[purchaseHistory.tiers.length - 1]?.tier;
  
  // Determine if skip discount applies
  const isSkipping = lastTier && !isConsecutiveTier(lastTier, targetTier);
  
  // Calculate skip discount (10% of target tier)
  const skipDiscount = isSkipping ? originalPrice * 0.1 : 0;
  
  // Calculate rollover credit (what they've paid already)
  const rolloverCredit = totalSpentSoFar;
  
  // Final price = (Original - Skip Discount) - Rollover Credit
  const priceAfterDiscount = originalPrice - skipDiscount;
  const finalPrice = Math.max(0, priceAfterDiscount - rolloverCredit);
  
  return {
    originalPrice,
    rolloverCredit,
    skipDiscount,
    finalPrice,
    totalSpentSoFar: totalSpentSoFar + finalPrice
  };
}

function isConsecutiveTier(fromTier: string, toTier: string): boolean {
  const fromIndex = TIER_ORDER.indexOf(fromTier);
  const toIndex = TIER_ORDER.indexOf(toTier);
  
  return toIndex === fromIndex + 1;
}
```

---

## 🔔 Stripe Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/emails/send';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  const supabase = createClient();
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get checkout session from database
      const { data: checkoutSession } = await supabase
        .from('stripe_checkout_sessions')
        .select('*')
        .eq('stripe_session_id', session.id)
        .single();
      
      if (!checkoutSession) {
        console.error('Checkout session not found:', session.id);
        break;
      }
      
      // Mark as completed
      await supabase
        .from('stripe_checkout_sessions')
        .update({
          status: 'completed',
          payment_intent_id: session.payment_intent as string,
          completed_at: new Date()
        })
        .eq('stripe_session_id', session.id);
      
      // Record purchase
      const { data: purchase } = await supabase
        .from('user_purchases')
        .insert({
          user_email: checkoutSession.user_email,
          tier: checkoutSession.tier,
          amount_paid: checkoutSession.amount_total,
          stripe_payment_intent_id: session.payment_intent as string,
          rollover_credit: checkoutSession.rollover_credit,
          skip_discount_applied: checkoutSession.skip_discount > 0,
          demo_session_id: checkoutSession.return_state?.sessionId || null
        })
        .select()
        .single();
      
      // Update user total spent
      await supabase.rpc('update_user_total_spent', {
        user_email_param: checkoutSession.user_email,
        amount_param: checkoutSession.amount_total
      });
      
      // Update highest tier purchased
      await supabase
        .from('users')
        .update({ 
          highest_tier_purchased: checkoutSession.tier,
          updated_at: new Date()
        })
        .eq('email', checkoutSession.user_email);
      
      // Add AI credits if AI Premium
      if (checkoutSession.tier === 'ai_premium') {
        await supabase.rpc('update_user_ai_credits', {
          user_email_param: checkoutSession.user_email,
          credits_to_add: 30
        });
      }
      
      // Track referral conversion if applicable
      const { data: user } = await supabase
        .from('users')
        .select('referred_by_code')
        .eq('email', checkoutSession.user_email)
        .single();
      
      if (user?.referred_by_code) {
        await trackReferralConversion(
          user.referred_by_code,
          checkoutSession.amount_total,
          checkoutSession.tier
        );
      }
      
      // Send confirmation email
      await sendEmail({
        to: checkoutSession.user_email,
        type: 'payment_confirmed',
        data: {
          tier: checkoutSession.tier,
          amount: checkoutSession.amount_total,
          portalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/portal`,
          purchaseId: purchase.id
        }
      });
      
      break;
    }
    
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      await supabase
        .from('stripe_checkout_sessions')
        .update({ status: 'failed' })
        .eq('payment_intent_id', paymentIntent.id);
      
      break;
    }
  }
  
  return NextResponse.json({ received: true });
}

// Helper: Track referral conversion
async function trackReferralConversion(
  referralCode: string,
  purchaseAmount: number,
  tier: string
) {
  const supabase = createClient();
  
  // Calculate 10% commission
  const commission = purchaseAmount * 0.10;
  
  // Update referral stats
  await supabase
    .from('referrals')
    .update({
      total_conversions: supabase.raw('total_conversions + 1'),
      total_earnings: supabase.raw(`total_earnings + ${commission}`)
    })
    .eq('referral_code', referralCode);
  
  // Log the conversion
  await supabase
    .from('referral_clicks')
    .update({
      converted: true,
      conversion_tier: tier,
      conversion_amount: purchaseAmount,
      commission_earned: commission
    })
    .eq('referral_code', referralCode)
    .eq('converted', false)
    .order('clicked_at', { ascending: false })
    .limit(1);
  
  // Send commission notification
  const { data: referral } = await supabase
    .from('referrals')
    .select('user_email, total_earnings')
    .eq('referral_code', referralCode)
    .single();
  
  if (referral) {
    await sendEmail({
      to: referral.user_email,
      type: 'referral_commission',
      data: {
        commission,
        tier,
        totalEarnings: referral.total_earnings
      }
    });
  }
}
```

---

## 🤖 AI Integration with Anthropic

### **API Route: /api/ai/conversation**

```typescript
// app/api/ai/conversation/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function POST(req: NextRequest) {
  try {
    const { 
      sessionId, 
      userEmail, 
      conversationHistory, 
      latestResponse 
    } = await req.json();
    
    const supabase = createClient();
    
    // Check AI credits
    const canUseCredit = await supabase.rpc('use_ai_credit', {
      user_email_param: userEmail,
      credits_to_use: 1
    });
    
    if (!canUseCredit) {
      return NextResponse.json(
        { 
          error: 'No AI credits remaining',
          needsUpgrade: true,
          upgradeUrl: '/api/payments/create-checkout?tier=ai_premium'
        },
        { status: 403 }
      );
    }
    
    // Get user's available credits
    const { data: user } = await supabase
      .from('users')
      .select('available_ai_credits')
      .eq('email', userEmail)
      .single();
    
    // Build conversation for Claude
    const messages = conversationHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    
    // System prompt for AI builder
    const systemPrompt = `You are a helpful AI assistant guiding a user through building their website with Web Launch Academy.

Your role:
- Ask clear, conversational questions about their website needs
- Suggest components they might need (header, footer, hero, services, contact, etc.)
- Offer to show visual examples when concepts might be unclear
- Keep responses friendly, encouraging, and under 150 words
- Always offer 2-3 response options at the end

When you suggest a component, format it as:
COMPONENT_SUGGESTION: [component_name]

Available components:
- header (navigation, logo)
- footer (contact info, links)
- hero (main headline, call-to-action)
- services (what they offer)
- contact_form (get in touch)
- email_signup (newsletter)
- testimonials (social proof)
- about (their story)`;
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: [...messages, {
        role: 'user',
        content: latestResponse
      }]
    });
    
    const aiMessage = response.content[0].text;
    
    // Log interaction
    await supabase
      .from('ai_interaction_logs')
      .insert({
        user_email: userEmail,
        user_id: user?.id,
        interaction_type: 'conversation',
        prompt_sent: latestResponse,
        response_received: aiMessage,
        credits_used: 1,
        demo_session_id: sessionId
      });
    
    // Update demo session
    await supabase
      .from('demo_sessions')
      .update({
        ai_interactions: supabase.raw(`ai_interactions || '[{"prompt": "${latestResponse.replace(/"/g, '\\"')}", "response": "${aiMessage.replace(/"/g, '\\"')}", "timestamp": "${new Date().toISOString()}"}]'::jsonb`)
      })
      .eq('id', sessionId);
    
    // Extract component suggestions
    const componentSuggestions = extractComponentSuggestions(aiMessage);
    
    // Extract response options
    const options = extractOptionsFromResponse(aiMessage);
    
    return NextResponse.json({
      message: {
        role: 'assistant',
        content: aiMessage.replace(/COMPONENT_SUGGESTION:.+/g, '').trim(),
        options,
        componentSuggestions
      },
      creditsUsed: 1,
      creditsRemaining: user?.available_ai_credits || 0
    });
    
  } catch (error) {
    console.error('AI conversation error:', error);
    return NextResponse.json(
      { error: 'AI conversation failed' },
      { status: 500 }
    );
  }
}

function extractComponentSuggestions(text: string): string[] {
  const matches = text.matchAll(/COMPONENT_SUGGESTION:\s*(\w+)/g);
  return Array.from(matches).map(match => match[1]);
}

function extractOptionsFromResponse(text: string): string[] {
  // Look for bullet points or numbered options
  const bulletMatch = text.match(/^[•\-\*]\s+(.+)$/gm);
  if (bulletMatch) {
    return bulletMatch.map(line => line.replace(/^[•\-\*]\s+/, '').trim());
  }
  
  const numberedMatch = text.match(/^\d+\.\s+(.+)$/gm);
  if (numberedMatch) {
    return numberedMatch.map(line => line.replace(/^\d+\.\s+/, '').trim());
  }
  
  // Default options
  return ['Continue', 'Tell me more', 'Show me an example'];
}
```

---

## 📧 Email Integration with Resend

### **Email Service Setup:**

```typescript
// lib/emails/send.ts

import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { 
  PreviewReadyEmail, 
  PaymentConfirmedEmail, 
  ReferralCommissionEmail 
} from './templates';

const resend = new Resend(process.env.RESEND_API_KEY!);

interface SendEmailParams {
  to: string;
  type: 'preview_ready' | 'payment_confirmed' | 'referral_commission';
  data: any;
}

export async function sendEmail({ to, type, data }: SendEmailParams) {
  const supabase = createClient();
  
  // Get email template
  const { subject, react } = getEmailTemplate(type, data);
  
  try {
    // Send via Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'Web Launch Academy <hello@weblaunchacademy.com>',
      to,
      subject,
      react
    });
    
    if (error) throw error;
    
    // Log email
    await supabase
      .from('email_logs')
      .insert({
        recipient_email: to,
        email_type: type,
        resend_id: emailData?.id,
        subject,
        status: 'sent',
        related_purchase_id: data.purchaseId
      });
    
    return { success: true, id: emailData?.id };
    
  } catch (error) {
    console.error('Email send error:', error);
    
    // Log failed email
    await supabase
      .from('email_logs')
      .insert({
        recipient_email: to,
        email_type: type,
        subject,
        status: 'failed'
      });
    
    return { success: false, error };
  }
}

function getEmailTemplate(type: string, data: any) {
  switch (type) {
    case 'preview_ready':
      return {
        subject: '🎉 Your Website Preview is Ready!',
        react: PreviewReadyEmail(data)
      };
    
    case 'payment_confirmed':
      return {
        subject: '✅ Payment Confirmed - Welcome to Web Launch Academy!',
        react: PaymentConfirmedEmail(data)
      };
    
    case 'referral_commission':
      return {
        subject: '💰 You Earned a Referral Commission!',
        react: ReferralCommissionEmail(data)
      };
    
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}
```

### **Email Templates (React Email):**

```tsx
// lib/emails/templates/PaymentConfirmedEmail.tsx

import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Hr
} from '@react-email/components';

interface PaymentConfirmedEmailProps {
  tier: string;
  amount: number;
  portalUrl: string;
}

export function PaymentConfirmedEmail({ 
  tier, 
  amount, 
  portalUrl 
}: PaymentConfirmedEmailProps) {
  const tierNames: Record<string, string> = {
    ai_premium: 'AI Premium',
    textbook: 'Textbook + Code',
    architecture: 'Architecture Mastery Toolkit'
  };
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✅ Payment Confirmed!</Heading>
          
          <Text style={text}>
            Thank you for your purchase!
          </Text>
          
          <Section style={box}>
            <Text style={boxText}>
              <strong>Package:</strong> {tierNames[tier]}
              <br />
              <strong>Amount:</strong> ${amount.toFixed(2)}
            </Text>
          </Section>
          
          <Text style={text}>
            You can now access your materials in the student portal:
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={portalUrl}>
              Access Your Portal
            </Button>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            Need help? Reply to this email or visit weblaunchacademy.com/support
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const box = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #22c55e',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
};

const boxText = {
  color: '#166534',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};
```

---

## 🎨 Frontend Components

### **AI Builder Landing:**

```tsx
// components/builder/AIBuilderLanding.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AIBuilderLanding() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPath, setSelectedPath] = useState<'free' | 'ai' | null>(null);
  
  async function handleStartBuilding(path: 'free' | 'ai') {
    setSelectedPath(path);
    setIsCreating(true);
    
    if (path === 'ai') {
      // Redirect to payment
      const email = prompt('Enter your email to get started:');
      if (!email) {
        setIsCreating(false);
        return;
      }
      
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'ai_premium',
          userEmail: email,
          userName: email.split('@')[0]
        })
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } else {
      // Create free session
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ builderType: 'free' })
      });
      
      const { sessionId } = await response.json();
      router.push(`/get-started/build/${sessionId}`);
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Build Your Professional Website
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your path: Free template builder or AI-powered precision
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Builder */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-4">🆓</div>
              <h2 className="text-2xl font-bold mb-2">Free Template Builder</h2>
              <p className="text-gray-600 mb-6">
                Quick & simple, great for testing the waters
              </p>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Pre-built component library</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Basic customization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Instant preview</span>
                </li>
              </ul>
              
              <button
                onClick={() => handleStartBuilding('free')}
                disabled={isCreating && selectedPath === 'free'}
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50"
              >
                {isCreating && selectedPath === 'free' ? 'Starting...' : 'Start Free Build'}
              </button>
            </div>
          </div>
          
          {/* AI Premium */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border-2 border-blue-400 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Recommended
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold mb-2">AI Premium Builder</h2>
              <p className="text-3xl font-bold text-blue-600 mb-2">$5</p>
              <p className="text-gray-600 mb-6">
                AI-guided, step-by-step website creation
              </p>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span><strong>30 AI-powered refinements</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Conversational guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Visual help when needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Better quality code</span>
                </li>
              </ul>
              
              <div className="bg-white/80 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  💎 <strong>This $5 rolls into any package!</strong>
                  <br />Never pay extra - it's an investment.
                </p>
              </div>
              
              <button
                onClick={() => handleStartBuilding('ai')}
                disabled={isCreating && selectedPath === 'ai'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50"
              >
                {isCreating && selectedPath === 'ai' ? 'Starting...' : 'Start AI Build - $5'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Implementation Checklist

### **Phase 2A - Core (This Implementation):**

**Backend:**
- [ ] Run database migration
- [ ] Create `/api/payments/create-checkout` (consolidated)
- [ ] Create `/api/webhooks/stripe` (webhook handler)
- [ ] Create `/api/ai/conversation` (Anthropic integration)
- [ ] Create `/lib/payments/calculateRollover.ts`
- [ ] Create `/lib/emails/send.ts`
- [ ] Create email templates (PaymentConfirmedEmail, etc.)

**Frontend:**
- [ ] Create `AIBuilderLanding` component
- [ ] Update `/get-started` page to use new component
- [ ] Add success/cancel handling for payments
- [ ] Add AI credit counter component

**Environment Variables:**
- [ ] `ANTHROPIC_API_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRODUCT_AI_PREMIUM_ID`
- [ ] `STRIPE_PRICE_AI_PREMIUM_ID`
- [ ] `STRIPE_PRODUCT_TEXTBOOK_ID`
- [ ] `STRIPE_PRICE_TEXTBOOK_ID`
- [ ] `STRIPE_PRODUCT_ARCHITECTURE_ID`
- [ ] `STRIPE_PRICE_ARCHITECTURE_ID`

**Testing:**
- [ ] Test upfront AI Premium payment
- [ ] Test mid-build upgrade (state preservation)
- [ ] Test after-preview purchase (Textbook)
- [ ] Test after-preview purchase (Toolkit)
- [ ] Test rollover pricing
- [ ] Test AI conversation (30 credits)
- [ ] Test email delivery
- [ ] Test webhook processing

---

## 🎯 Success Criteria

Phase 2A is successful when:

1. ✅ User can buy AI Premium ($5) upfront
2. ✅ User gets 30 AI credits added to account
3. ✅ AI conversation works (questions/responses)
4. ✅ Credits deduct properly per interaction
5. ✅ User can upgrade mid-build (returns to same step)
6. ✅ User can purchase Textbook after preview
7. ✅ User can purchase Toolkit (already working, just integrate)
8. ✅ Rollover pricing calculates correctly
9. ✅ Payment confirmation emails send
10. ✅ Webhook processes payments successfully

---

## ⏱️ Time Estimate

- Database migration: 30 mins
- Payment API implementation: 4-6 hours
- AI integration: 3-4 hours
- Email setup: 2-3 hours
- Frontend components: 2-3 hours
- Testing: 4-6 hours
- **Total: 16-24 hours**

---

## 📝 Notes

### **What's NOT Included in Phase 2A:**
- ❌ Component improvement UI (Phase 2B)
- ❌ Contest system (Phase 2C)
- ❌ Admin dashboard enhancements (Phase 2B)
- ❌ Products you don't have yet (Recordings, Group Class, etc.)

### **What IS Included:**
- ✅ All 3 products you have now
- ✅ Full payment flow with rollover
- ✅ AI conversation system
- ✅ Email notifications
- ✅ Credit tracking

---

## 🚀 Ready to Build!

This streamlined Phase 2A focuses on what you need NOW:
- Payment processing for your 3 products
- AI-guided builder
- Email automation
- Foundation for future phases

**Let Claude CLI build this!** 🔥
