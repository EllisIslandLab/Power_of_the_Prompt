import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
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

    // Build base URL from request headers
    const headers = request.headers
    const host = headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
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
      success_url: `${baseUrl}/portal/billing?success=true&amount=${amount}`,
      cancel_url: `${baseUrl}/portal/billing?canceled=true`,
      metadata: {
        clientAccountId,
        userId: session.user.id,
        amount: amount.toString(),
      },
    })

    return Response.json({ sessionId: checkoutSession.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
