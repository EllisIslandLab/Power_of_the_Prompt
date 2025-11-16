import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    // Get user email (or allow guest checkout)
    const { data: { user } } = await supabase.auth.getUser()
    const { email } = await req.json()

    const customerEmail = user?.email || email || undefined

    // Create Stripe checkout session for $5 AI Premium
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI Premium Website Builder',
              description: '30 AI-powered refinements for your perfect website',
              images: ['https://weblaunchacademy.com/ai-premium-icon.png'], // Optional
            },
            unit_amount: 500, // $5.00 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/get-started/build?session_id={CHECKOUT_SESSION_ID}&payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/get-started?payment=canceled`,
      metadata: {
        builder_type: 'ai_premium',
        user_email: customerEmail || '',
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Error creating AI Premium checkout:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
