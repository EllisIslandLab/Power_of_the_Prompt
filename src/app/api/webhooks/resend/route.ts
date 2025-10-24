import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import crypto from 'crypto'

const supabase = getSupabase(true) // Use service role

// Resend webhook event types
type ResendWebhookEvent =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked'

interface ResendWebhookPayload {
  type: ResendWebhookEvent
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    created_at?: string
    opened_at?: string
    clicked_at?: string
    click?: {
      link: string
      timestamp: string
    }
    bounce?: {
      type: string
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature for security
    const signature = request.headers.get('svix-signature')
    const timestamp = request.headers.get('svix-timestamp')
    const webhookId = request.headers.get('svix-id')

    if (!signature || !timestamp || !webhookId) {
      console.warn('Missing webhook headers')
      // For now, we'll allow it but log a warning
      // In production, you should verify the signature
    }

    const payload: ResendWebhookPayload = await request.json()

    console.log(`Resend webhook received: ${payload.type} for email ${payload.data.email_id}`)

    // Process different event types
    switch (payload.type) {
      case 'email.sent':
        await handleEmailSent(payload)
        break

      case 'email.delivered':
        await handleEmailDelivered(payload)
        break

      case 'email.opened':
        await handleEmailOpened(payload)
        break

      case 'email.clicked':
        await handleEmailClicked(payload)
        break

      case 'email.bounced':
        await handleEmailBounced(payload)
        break

      case 'email.complained':
        await handleEmailComplained(payload)
        break

      default:
        console.log(`Unhandled event type: ${payload.type}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed'
    })

  } catch (error) {
    console.error('Resend webhook error:', error)
    // Return 200 even on error to prevent retries for bad data
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed'
      },
      { status: 200 }
    )
  }
}

async function handleEmailSent(payload: ResendWebhookPayload) {
  // Email was accepted by Resend
  console.log(`Email sent: ${payload.data.email_id}`)
  // You could update a status field here if needed
}

async function handleEmailDelivered(payload: ResendWebhookPayload) {
  // Email was delivered to recipient's mail server
  console.log(`Email delivered: ${payload.data.email_id}`)
}

async function handleEmailOpened(payload: ResendWebhookPayload) {
  const { email_id } = payload.data
  const openedAt = payload.data.opened_at || payload.created_at

  console.log(`Email opened: ${email_id} at ${openedAt}`)

  // Find the campaign_send record
  const { data: campaignSend, error: findError } = await supabase
    .from('campaign_sends')
    .select('id, campaign_id, opened_at')
    .eq('resend_email_id', email_id)
    .single()

  if (findError) {
    console.error(`Failed to find campaign_send for email ${email_id}:`, findError)
    return
  }

  if (!campaignSend) {
    console.warn(`No campaign_send found for email ${email_id}`)
    return
  }

  // Only update if this is the first open
  if (!campaignSend.opened_at) {
    // Update campaign_sends record
    const { error: updateError } = await supabase
      .from('campaign_sends')
      .update({ opened_at: openedAt })
      .eq('id', campaignSend.id)

    if (updateError) {
      console.error(`Failed to update opened_at for ${email_id}:`, updateError)
      return
    }

    // Increment campaign opened_count
    const { error: rpcError } = await supabase.rpc('increment_campaign_opens', {
      campaign_id: campaignSend.campaign_id
    })

    if (rpcError) {
      console.error(`Failed to increment campaign opens:`, rpcError)
    } else {
      console.log(`✅ Recorded first open for ${email_id}, incremented campaign ${campaignSend.campaign_id}`)
    }
  } else {
    console.log(`Email ${email_id} was already marked as opened`)
  }
}

async function handleEmailClicked(payload: ResendWebhookPayload) {
  const { email_id, click } = payload.data
  const clickedAt = click?.timestamp || payload.created_at

  console.log(`Email clicked: ${email_id} - link: ${click?.link}`)

  // Find the campaign_send record
  const { data: campaignSend, error: findError } = await supabase
    .from('campaign_sends')
    .select('id, campaign_id, clicked_at')
    .eq('resend_email_id', email_id)
    .single()

  if (findError || !campaignSend) {
    console.error(`Failed to find campaign_send for email ${email_id}`)
    return
  }

  // Only update if this is the first click
  if (!campaignSend.clicked_at) {
    // Update campaign_sends record
    const { error: updateError } = await supabase
      .from('campaign_sends')
      .update({ clicked_at: clickedAt })
      .eq('id', campaignSend.id)

    if (updateError) {
      console.error(`Failed to update clicked_at:`, updateError)
      return
    }

    // Increment campaign clicked_count
    const { error: rpcError } = await supabase.rpc('increment_campaign_clicks', {
      campaign_id: campaignSend.campaign_id
    })

    if (rpcError) {
      console.error(`Failed to increment campaign clicks:`, rpcError)
    } else {
      console.log(`✅ Recorded first click for ${email_id}`)
    }
  }
}

async function handleEmailBounced(payload: ResendWebhookPayload) {
  const { email_id, bounce } = payload.data

  console.log(`Email bounced: ${email_id} - type: ${bounce?.type}`)

  // Update campaign_sends record
  const { error } = await supabase
    .from('campaign_sends')
    .update({
      bounced_at: payload.created_at,
      send_error: `Bounced: ${bounce?.type || 'unknown'}`
    })
    .eq('resend_email_id', email_id)

  if (error) {
    console.error(`Failed to update bounce status:`, error)
  }
}

async function handleEmailComplained(payload: ResendWebhookPayload) {
  const { email_id, to } = payload.data

  console.log(`Email complaint: ${email_id} from ${to}`)

  // Mark as unsubscribed in campaign_sends
  const { error: updateError } = await supabase
    .from('campaign_sends')
    .update({
      unsubscribed_at: payload.created_at
    })
    .eq('resend_email_id', email_id)

  if (updateError) {
    console.error(`Failed to update complaint status:`, updateError)
  }

  // Note: If you want to also mark in leads table, you'll need to add
  // unsubscribed_at column to the leads table schema first
}
