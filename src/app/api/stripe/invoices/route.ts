import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
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
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] })
    }

    // Fetch invoices from Stripe
    const stripe = getStripe()
    const invoices = await stripe.invoices.list({
      customer: userData.stripe_customer_id,
      limit: 20,
    })

    // Format invoices for the frontend
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      created: invoice.created,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      description: invoice.lines.data[0]?.description || 'Service',
    }))

    return NextResponse.json({ invoices: formattedInvoices })
  } catch (error) {
    console.error('Invoices fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}
