import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: Request) {
  try {
    const { amount, clientAccountId } = await request.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Website Revision Credits',
              description: 'Add funds to your account balance for AI-powered website revisions',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/portal/billing?success=true&amount=${amount}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/portal/billing?canceled=true`,
      metadata: {
        clientAccountId,
        userId: session.user.id,
        amount: amount.toString(),
      },
    })

    return Response.json({ sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
