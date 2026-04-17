import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const { return_url } = await request.json()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's Stripe customer ID from database
    const { data: userData } = await supabase
      .from('users' as any)
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please make a purchase first.' },
        { status: 404 }
      )
    }

    // Create Stripe Customer Portal session
    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: return_url || `${process.env.NEXT_PUBLIC_BASE_URL}/portal/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Customer Portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    )
  }
}
