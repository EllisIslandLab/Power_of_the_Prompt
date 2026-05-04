import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for webhook
  { auth: { persistSession: false } }
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const { clientAccountId, userId, amount } = session.metadata || {}

    if (!clientAccountId || !amount) {
      console.error('Missing metadata in checkout session')
      return Response.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const amountNum = parseFloat(amount)

    try {
      // Add funds to client account
      await supabase.rpc('add_funds', {
        account_id: clientAccountId,
        amount: amountNum,
      })

      // Create notification
      if (userId) {
        await supabase.from('deployment_notifications').insert({
          user_id: userId,
          notification_type: 'success',
          title: 'Funds Added',
          message: `$${amountNum.toFixed(2)} has been added to your account.`,
        })
      }

      console.log(`Added $${amountNum} to account ${clientAccountId}`)
    } catch (error) {
      console.error('Failed to add funds:', error)
      return Response.json({ error: 'Database error' }, { status: 500 })
    }
  }

  return Response.json({ received: true })
}
