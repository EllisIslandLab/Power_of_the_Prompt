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
      .from('products' as any)
      .select('stripe_price_id, name, price')
      .eq('slug', productSlug)
      .single() as any

    if (productError || !product) {
      console.error('Product not found in database:', productSlug, productError)
      return NextResponse.json({ error: 'Product not found in database' }, { status: 404 })
    }

    // Check if stripe_price_id is set
    if (!product.stripe_price_id) {
      console.error('Stripe price not configured for product:', productSlug)
      return NextResponse.json({
        error: 'Stripe price not configured. Please create the $190 price in Stripe Dashboard first.',
        details: {
          productSlug,
          productName: product.name,
          expectedPrice: product.price,
          instructions: 'Create a $190 price in Stripe and update the product.stripe_price_id'
        }
      }, { status: 400 })
    }

    // Get the price from Stripe to verify it exists
    let price
    try {
      price = await stripe.prices.retrieve(product.stripe_price_id)
    } catch (err) {
      console.error('Failed to retrieve Stripe price:', product.stripe_price_id, err)
      return NextResponse.json({
        error: 'Invalid Stripe price ID',
        details: {
          priceId: product.stripe_price_id,
          message: 'The price ID in the database does not exist in Stripe'
        }
      }, { status: 400 })
    }

    // Get user email
    const { data: userData } = await supabase
      .from('users' as any)
      .select('email')
      .eq('id', user.id)
      .single() as any

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
      allow_promotion_codes: true, // Enable coupon/promo code entry
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/products/${productSlug}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/products/${productSlug}?canceled=true`,
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
