import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { alertCriticalError } from '@/lib/error-alerts'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(request: Request) {
  let productSlug: string = 'unknown'

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

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    productSlug = body.productSlug
    const stripeProductId = body.stripeProductId

    // Get product from database
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stripe_lookup_key, name')
      .eq('slug', productSlug)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Retrieve price from Stripe using lookup key
    const prices = await stripe.prices.list({
      lookup_keys: [product.stripe_lookup_key],
      expand: ['data.product']
    })

    if (prices.data.length === 0) {
      return NextResponse.json({ error: 'Price not found in Stripe' }, { status: 404 })
    }

    const price = prices.data[0]

    // Get user email
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userData?.email || user.email,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/portal/products/${productSlug}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/portal/products/${productSlug}?canceled=true`,
      metadata: {
        user_id: user.id,
        product_slug: productSlug,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)

    // Send critical alert for checkout failures
    await alertCriticalError(
      error instanceof Error ? error : new Error('Unknown checkout error'),
      'Stripe Checkout Creation Failed',
      {
        productSlug,
        timestamp: new Date().toISOString()
      }
    )

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
