# Web Launch Academy - Phase 2A Complete Implementation
## Ready-to-Build Edition

---

## 🎯 What We're Building

Phase 2A adds the core revenue-generating features:
1. **Unified Payment System** - One API for all products with rollover pricing
2. **AI Conversation** - Anthropic-powered guidance with credit tracking
3. **Email Confirmations** - Resend integration for payment receipts
4. **Frontend Components** - AI Builder landing page

**Products Supported:**
- AI Premium ($5) - 30 AI credits
- Textbook + Code ($19) - Generated code + guide
- Architecture Toolkit ($190) - Already working, just integrate

---

## ✅ Prerequisites Checklist

**Database:**
- ✅ Migration completed (demo_projects, ai_interaction_logs, email_logs, stripe_checkout_sessions)
- ✅ All tables use correct names (demo_projects not demo_sessions)
- ✅ product_slug fields added
- ✅ Functions created (update_user_ai_credits, use_ai_credit)

**Environment Variables:**
```env
# Already have these:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
ANTHROPIC_API_KEY=...
RESEND_API_KEY=...

# Add these (get from Stripe dashboard):
STRIPE_PRODUCT_AI_PREMIUM_ID=prod_TQJ7Wl8ceJpDsY
STRIPE_PRICE_AI_PREMIUM_ID=price_...

STRIPE_PRODUCT_TEXTBOOK_ID=prod_...
STRIPE_PRICE_TEXTBOOK_ID=price_...

STRIPE_PRODUCT_ARCHITECTURE_ID=prod_TLpZ1AjXFUXzBT
STRIPE_PRICE_ARCHITECTURE_ID=price_1STVR2Ibb5TcHX6O74Mf2fFA
```

**NPM Packages:**
```bash
# Already installed:
@anthropic-ai/sdk
resend
@react-email/components
stripe
```

---

## 📁 File Structure

Create these files in your existing Next.js project:

```
src/
├── lib/
│   ├── payments/
│   │   └── calculateRollover.ts          // NEW: Rollover pricing logic
│   ├── emails/
│   │   ├── send.ts                       // NEW: Email sender
│   │   └── templates/
│   │       └── PaymentConfirmedEmail.tsx // NEW: Email template
│   └── supabase/
│       └── client.ts                     // EXISTING: Already have this
│
├── app/api/
│   ├── payments/
│   │   └── create-checkout/
│   │       └── route.ts                  // NEW: Unified payment API
│   ├── ai/
│   │   └── conversation/
│   │       └── route.ts                  // NEW: AI conversation endpoint
│   └── webhooks/
│       ├── stripe/
│       │   └── route.ts                  // EXISTING: Update this
│       └── handlers/
│           ├── AIPremiumPurchaseHandler.ts    // NEW
│           └── TextbookPurchaseHandler.ts     // NEW
│
└── components/
    └── builder/
        └── AIBuilderLanding.tsx          // NEW: AI builder UI
```

---

## 💰 IMPLEMENTATION PART 1: Payment System

### File 1: Rollover Calculator

```typescript
// src/lib/payments/calculateRollover.ts

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
  appliedDiscount: 'rollover' | 'skip' | 'none';
}

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
  
  const totalSpentSoFar = purchaseHistory.tiers.reduce(
    (sum, purchase) => sum + purchase.amount_paid,
    0
  );
  
  const lastTier = purchaseHistory.tiers[purchaseHistory.tiers.length - 1]?.tier;
  const isSkipping = lastTier && !isConsecutiveTier(lastTier, targetTier);
  
  const potentialRolloverCredit = totalSpentSoFar;
  const potentialSkipDiscount = originalPrice * 0.10;
  
  // CRITICAL: Choose ONE discount (no stacking)
  let finalPrice: number;
  let appliedDiscount: 'rollover' | 'skip' | 'none';
  let rolloverCredit: number;
  let skipDiscount: number;
  
  if (isSkipping) {
    // Skip discount applies - NO rollover
    skipDiscount = potentialSkipDiscount;
    rolloverCredit = 0;
    finalPrice = originalPrice - skipDiscount;
    appliedDiscount = 'skip';
  } else {
    // Consecutive purchase - rollover applies
    rolloverCredit = potentialRolloverCredit;
    skipDiscount = 0;
    finalPrice = Math.max(0, originalPrice - rolloverCredit);
    appliedDiscount = rolloverCredit > 0 ? 'rollover' : 'none';
  }
  
  return {
    originalPrice,
    rolloverCredit,
    skipDiscount,
    finalPrice,
    totalSpentSoFar: totalSpentSoFar + finalPrice,
    appliedDiscount
  };
}

function isConsecutiveTier(fromTier: string, toTier: string): boolean {
  const fromIndex = TIER_ORDER.indexOf(fromTier);
  const toIndex = TIER_ORDER.indexOf(toTier);
  return toIndex === fromIndex + 1;
}
```

---

### File 2: Unified Payment API

```typescript
// src/app/api/payments/create-checkout/route.ts

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
      projectId,      // Demo project ID (optional)
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
      .from('purchases')
      .select('product_slug, amount')
      .eq('email', userEmail)
      .order('created_at', { ascending: true });
    
    // Map to expected format
    const purchaseHistory = {
      tiers: (purchases || []).map(p => ({
        tier: p.product_slug,
        amount_paid: p.amount
      }))
    };
    
    // Calculate pricing with rollover
    const pricing = calculateRolloverPrice(tier, purchaseHistory);
    
    // Get Stripe price ID
    const priceId = getTierPriceId(tier);
    const productId = getTierProductId(tier);
    
    if (!priceId || !productId) {
      return NextResponse.json(
        { error: `Invalid tier: ${tier}` },
        { status: 400 }
      );
    }
    
    // Determine URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    let successUrl: string;
    let cancelUrl: string;
    
    if (returnState && projectId) {
      // Mid-build purchase
      successUrl = `${baseUrl}/get-started/build/${projectId}?payment=success&return=${encodeURIComponent(JSON.stringify(returnState))}`;
      cancelUrl = `${baseUrl}/get-started/build/${projectId}?payment=canceled`;
    } else if (projectId) {
      // After preview
      successUrl = `${baseUrl}/get-started/preview/${projectId}?payment=success`;
      cancelUrl = `${baseUrl}/get-started/preview/${projectId}?payment=canceled`;
    } else {
      // General purchase
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
      // Apply discount if applicable
      ...(pricing.rolloverCredit > 0 && {
        discounts: [{
          coupon: await createRolloverCoupon(pricing.rolloverCredit)
        }]
      }),
      ...(pricing.skipDiscount > 0 && {
        discounts: [{
          coupon: await createSkipCoupon(pricing.skipDiscount)
        }]
      }),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tier,
        product_slug: tier,
        projectId: projectId || '',
        userEmail,
        rolloverCredit: pricing.rolloverCredit.toString(),
        skipDiscount: pricing.skipDiscount.toString(),
        finalPrice: pricing.finalPrice.toString(),
        appliedDiscount: pricing.appliedDiscount
      },
      allow_promotion_codes: true
    });
    
    // Store in database
    await supabase
      .from('stripe_checkout_sessions')
      .insert({
        stripe_session_id: checkoutSession.id,
        stripe_customer_id: checkoutSession.customer as string || null,
        user_email: userEmail,
        user_id: user?.id,
        tier,
        product_id: productId,
        product_slug: tier,
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
      url: checkoutSession.url,
      pricing
    });
    
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

function getTierPriceId(tier: string): string | null {
  const priceIds: Record<string, string> = {
    ai_premium: process.env.STRIPE_PRICE_AI_PREMIUM_ID!,
    textbook: process.env.STRIPE_PRICE_TEXTBOOK_ID!,
    architecture: process.env.STRIPE_PRICE_ARCHITECTURE_ID!
  };
  return priceIds[tier] || null;
}

function getTierProductId(tier: string): string | null {
  const productIds: Record<string, string> = {
    ai_premium: process.env.STRIPE_PRODUCT_AI_PREMIUM_ID!,
    textbook: process.env.STRIPE_PRODUCT_TEXTBOOK_ID!,
    architecture: process.env.STRIPE_PRODUCT_ARCHITECTURE_ID!
  };
  return productIds[tier] || null;
}

async function createRolloverCoupon(amount: number): Promise<string> {
  const coupon = await stripe.coupons.create({
    amount_off: Math.round(amount * 100),
    currency: 'usd',
    duration: 'once',
    name: `Rollover Credit: $${amount.toFixed(2)}`
  });
  return coupon.id;
}

async function createSkipCoupon(amount: number): Promise<string> {
  const coupon = await stripe.coupons.create({
    amount_off: Math.round(amount * 100),
    currency: 'usd',
    duration: 'once',
    name: `Skip Discount: $${amount.toFixed(2)}`
  });
  return coupon.id;
}
```

---

### File 3: Webhook Handlers

```typescript
// src/app/api/webhooks/handlers/AIPremiumPurchaseHandler.ts

import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/emails/send';

export async function handleAIPremiumPurchase(session: any) {
  const supabase = createClient();
  const { user_email, tier, amount_total } = session.metadata;
  
  if (tier !== 'ai_premium') return;
  
  console.log('Processing AI Premium purchase:', user_email);
  
  // Add 30 AI credits
  await supabase.rpc('update_user_ai_credits', {
    user_email_param: user_email,
    credits_to_add: 30
  });
  
  // Update user total spent
  await supabase.rpc('update_user_total_spent', {
    user_email_param: user_email,
    amount_param: parseFloat(amount_total)
  });
  
  // Send confirmation email
  await sendEmail({
    to: user_email,
    type: 'payment_confirmed',
    data: {
      tier: 'AI Premium',
      amount: parseFloat(amount_total),
      portalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/portal`,
      creditsAdded: 30
    }
  });
  
  console.log('AI Premium purchase processed successfully');
}
```

```typescript
// src/app/api/webhooks/handlers/TextbookPurchaseHandler.ts

import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/emails/send';

export async function handleTextbookPurchase(session: any) {
  const supabase = createClient();
  const { user_email, tier, amount_total } = session.metadata;
  
  if (tier !== 'textbook') return;
  
  console.log('Processing Textbook purchase:', user_email);
  
  // Update user total spent
  await supabase.rpc('update_user_total_spent', {
    user_email_param: user_email,
    amount_param: parseFloat(amount_total)
  });
  
  // Grant access to textbook (handled by portal logic based on purchases table)
  
  // Send confirmation email
  await sendEmail({
    to: user_email,
    type: 'payment_confirmed',
    data: {
      tier: 'Textbook + Code',
      amount: parseFloat(amount_total),
      portalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/portal`,
      includes: ['Generated website code', 'Complete textbook guide', 'Code examples']
    }
  });
  
  console.log('Textbook purchase processed successfully');
}
```

---

### File 4: Update Existing Webhook

```typescript
// src/app/api/webhooks/stripe/route.ts
// ADD these imports at top:

import { handleAIPremiumPurchase } from '../handlers/AIPremiumPurchaseHandler';
import { handleTextbookPurchase } from '../handlers/TextbookPurchaseHandler';

// INSIDE checkout.session.completed handler, ADD:

case 'checkout.session.completed': {
  const session = event.data.object as Stripe.Checkout.Session;
  
  // Get product slug from metadata
  const productSlug = session.metadata?.product_slug;
  
  // Route to appropriate handler
  if (productSlug === 'ai_premium') {
    await handleAIPremiumPurchase(session);
  } else if (productSlug === 'textbook') {
    await handleTextbookPurchase(session);
  } else if (productSlug === 'architecture') {
    // Your existing ToolkitPurchaseHandler
    // Keep this as-is
  }
  
  // Update stripe_checkout_sessions
  await supabase
    .from('stripe_checkout_sessions')
    .update({
      status: 'completed',
      payment_intent_id: session.payment_intent as string,
      completed_at: new Date()
    })
    .eq('stripe_session_id', session.id);
  
  break;
}
```

---

## 🤖 IMPLEMENTATION PART 2: AI System

### File 5: AI Conversation API

```typescript
// src/app/api/ai/conversation/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function POST(req: NextRequest) {
  try {
    const { 
      projectId, 
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
          upgradeUrl: `/api/payments/create-checkout?tier=ai_premium&userEmail=${userEmail}`
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
    
    // Build conversation
    const messages = conversationHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    
    // System prompt
    const systemPrompt = `You are a helpful AI assistant guiding users through building their website with Web Launch Academy.

Your role:
- Ask clear, conversational questions about their website needs
- Suggest components: header, footer, hero, services, contact, email_signup, testimonials
- Offer visual examples when concepts might be unclear
- Keep responses friendly, encouraging, under 150 words
- Always offer 2-3 response options

Format component suggestions as:
COMPONENT_SUGGESTION: [component_name]`;
    
    // Call Claude
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
        demo_project_id: projectId
      });
    
    // Update demo project
    if (projectId) {
      await supabase
        .from('demo_projects')
        .update({
          ai_interactions: supabase.raw(`
            COALESCE(ai_interactions, '[]'::jsonb) || 
            jsonb_build_object(
              'prompt', $1::text,
              'response', $2::text,
              'timestamp', $3::text
            )::jsonb
          `, [latestResponse, aiMessage, new Date().toISOString()])
        })
        .eq('id', projectId);
    }
    
    // Extract component suggestions
    const componentSuggestions = extractComponentSuggestions(aiMessage);
    const options = extractOptions(aiMessage);
    
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

function extractOptions(text: string): string[] {
  const bulletMatch = text.match(/^[•\-\*]\s+(.+)$/gm);
  if (bulletMatch) {
    return bulletMatch.map(line => line.replace(/^[•\-\*]\s+/, '').trim());
  }
  
  const numberedMatch = text.match(/^\d+\.\s+(.+)$/gm);
  if (numberedMatch) {
    return numberedMatch.map(line => line.replace(/^\d+\.\s+/, '').trim());
  }
  
  return ['Continue', 'Tell me more', 'Show me an example'];
}
```

---

## 📧 IMPLEMENTATION PART 3: Email System

### File 6: Email Sender

```typescript
// src/lib/emails/send.ts

import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { PaymentConfirmedEmail } from './templates/PaymentConfirmedEmail';

const resend = new Resend(process.env.RESEND_API_KEY!);

interface SendEmailParams {
  to: string;
  type: 'payment_confirmed';
  data: any;
}

export async function sendEmail({ to, type, data }: SendEmailParams) {
  const supabase = createClient();
  
  const { subject, react } = getEmailTemplate(type, data);
  
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Web Launch Academy <hello@weblaunchacademy.com>',
      to,
      subject,
      react
    });
    
    if (error) throw error;
    
    await supabase
      .from('email_logs')
      .insert({
        recipient_email: to,
        email_type: type,
        resend_id: emailData?.id,
        subject,
        status: 'sent'
      });
    
    return { success: true, id: emailData?.id };
    
  } catch (error) {
    console.error('Email send error:', error);
    
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
    case 'payment_confirmed':
      return {
        subject: '✅ Payment Confirmed - Welcome to Web Launch Academy!',
        react: PaymentConfirmedEmail(data)
      };
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}
```

---

### File 7: Email Template

```tsx
// src/lib/emails/templates/PaymentConfirmedEmail.tsx

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
  creditsAdded?: number;
  includes?: string[];
}

export function PaymentConfirmedEmail({ 
  tier, 
  amount, 
  portalUrl,
  creditsAdded,
  includes
}: PaymentConfirmedEmailProps) {
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
              <strong>Package:</strong> {tier}
              <br />
              <strong>Amount:</strong> ${amount.toFixed(2)}
            </Text>
            
            {creditsAdded && (
              <Text style={boxText}>
                <strong>AI Credits Added:</strong> {creditsAdded}
              </Text>
            )}
            
            {includes && includes.length > 0 && (
              <>
                <Text style={boxText}>
                  <strong>What's Included:</strong>
                </Text>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {includes.map((item, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </Section>
          
          <Text style={text}>
            Access your materials in the student portal:
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
  margin: '8px 0',
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

## 🎨 IMPLEMENTATION PART 4: Frontend

### File 8: AI Builder Landing

```tsx
// src/components/builder/AIBuilderLanding.tsx

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
      // Create free session - use your existing API
      const response = await fetch('/api/demo-generator/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ builderType: 'free' })
      });
      
      const { projectId } = await response.json();
      router.push(`/get-started/build/${projectId}`);
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 relative z-10">
            Build Your Professional Website
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto relative z-10">
            Choose your path: Free template builder or AI-powered precision
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Builder */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 relative z-10">
            <div className="text-center">
              <div className="text-4xl mb-4">🆓</div>
              <h2 className="text-2xl font-bold mb-2">Free Template Builder</h2>
              <p className="text-gray-600 mb-6">
                Quick & simple, great for testing
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
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors"
              >
                {isCreating && selectedPath === 'free' ? 'Starting...' : 'Start Free Build'}
              </button>
            </div>
          </div>
          
          {/* AI Premium */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border-2 border-blue-400 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold z-10">
              Recommended
            </div>
            
            <div className="text-center relative z-10">
              <div className="text-4xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold mb-2">AI Premium Builder</h2>
              <p className="text-3xl font-bold text-blue-600 mb-2">$5</p>
              <p className="text-gray-600 mb-6">
                AI-guided, step-by-step creation
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
                  <br />Never pay extra.
                </p>
              </div>
              
              <button
                onClick={() => handleStartBuilding('ai')}
                disabled={isCreating && selectedPath === 'ai'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50 transition-all"
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

## ✅ Testing Checklist

After implementation, test these flows:

### **Payment Flow:**
- [ ] AI Premium ($5) - Buy upfront
- [ ] Verify 30 credits added to user
- [ ] Textbook ($19) - Buy after AI Premium
- [ ] Verify rollover ($14 charged)
- [ ] Architecture ($190) - Buy after Textbook
- [ ] Verify rollover ($171 charged)
- [ ] Architecture ($190) - Skip from AI Premium
- [ ] Verify skip discount ($171 charged, no rollover)

### **AI Conversation:**
- [ ] User with credits can ask questions
- [ ] Credits deduct correctly
- [ ] User without credits gets upgrade prompt
- [ ] Interactions logged to database
- [ ] Component suggestions extracted

### **Email System:**
- [ ] Payment confirmation sends
- [ ] Email logged to database
- [ ] Links work in email
- [ ] Formatting looks good

### **Frontend:**
- [ ] Landing page renders
- [ ] Text is visible (not hidden)
- [ ] Buttons work
- [ ] Loading states work
- [ ] Redirects work correctly

---

## 🚀 Deployment Steps

1. **Commit all files**
2. **Push to GitHub**
3. **Vercel auto-deploys**
4. **Configure Stripe webhook:**
   - URL: `https://weblaunchacademy.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`
5. **Test in production**

---

## 💡 Implementation Notes

### **Text Visibility Fix:**
All components use `relative z-10` and explicit text colors to stay above backgrounds.

### **Table Names:**
All code uses `demo_projects` and `purchases` (not demo_sessions or user_purchases).

### **Product Slugs:**
- `ai_premium` - AI Premium
- `textbook` - Textbook + Code
- `architecture` - Architecture Toolkit

### **Rollover Logic:**
Skip discount REPLACES rollover (no stacking). Best discount wins.

---

## ✅ Success Criteria

Phase 2A is successful when:
1. ✅ Users can buy AI Premium upfront ($5)
2. ✅ 30 credits added automatically
3. ✅ AI conversation works
4. ✅ Credits deduct per interaction
5. ✅ Textbook purchase works ($19)
6. ✅ Rollover calculates correctly ($14 if AI Premium first)
7. ✅ Architecture still works ($190)
8. ✅ Email confirmations send
9. ✅ No breaking changes to existing features

---

## 🎯 Ready to Build!

All files are designed to:
- ✅ Work with existing tables
- ✅ Coexist with Architecture Toolkit
- ✅ Use correct environment variables
- ✅ Follow your existing patterns
- ✅ Have no breaking changes

**Run this through Claude CLI and you'll have Phase 2A working!** 🚀
