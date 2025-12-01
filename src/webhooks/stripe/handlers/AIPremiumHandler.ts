import Stripe from 'stripe'
import { BaseWebhookHandler } from '../BaseWebhookHandler'
import { getSupabase } from '@/lib/supabase'
import { resendAdapter } from '@/adapters/ResendAdapter'
import { renderAIPremiumConfirmationEmail } from '@/lib/email-builder'

/**
 * AI Premium Builder Purchase Handler
 *
 * Handles webhook events when a user purchases the AI Premium Builder ($5).
 * This grants 3 AI credits for enhanced demo website generation with Sonnet model.
 *
 * Responsibilities:
 * 1. Grant 3 AI credits to user
 * 2. Upgrade model tier to Sonnet
 * 3. Set 30-day data retention
 * 4. Update demo_projects with AI Premium status
 * 5. Create purchase record
 * 6. Send confirmation email
 * 7. Log email to email_logs table
 */
export class AIPremiumHandler extends BaseWebhookHandler {
  eventType = 'checkout.session.completed' as const

  async canHandle(event: Stripe.Event): Promise<boolean> {
    if (event.type !== this.eventType) return false

    const session = event.data.object as Stripe.Checkout.Session
    const productSlug = session.metadata?.product_slug

    return productSlug === 'ai_premium'
  }

  async handle(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session
    const supabase = getSupabase(true)

    try {
      // Parse return state
      const returnState = session.client_reference_id
        ? JSON.parse(session.client_reference_id)
        : {}

      const userEmail = session.customer_details?.email || returnState.userEmail
      const amountPaid = (session.amount_total || 0) / 100 // Convert cents to dollars

      if (!userEmail) {
        throw new Error('No email found in checkout session')
      }

      // 1. Get or create user
      let userId = returnState.userId

      if (!userId) {
        const { data: existingUser } = await supabase
          .from('users' as any)
          .select('id')
          .eq('email', userEmail)
          .single() as any

        if (existingUser) {
          userId = existingUser.id
        } else {
          const { data: newUser, error } = await supabase
            .from('users' as any)
            .insert({
              email: userEmail,
              full_name: session.customer_details?.name || '',
            })
            .select('id')
            .single() as any

          if (error) throw error
          userId = newUser.id
        }
      }

      // 2. Grant 3 AI credits and upgrade to Sonnet model
      await (supabase as any).rpc('update_user_ai_credits', {
        p_user_id: userId,
        p_credits_to_add: 3,
        p_amount_paid: amountPaid,
        p_tier: 'sonnet',
      })

      // 3. Create purchase record
      await supabase
        .from('purchases' as any)
        .insert({
          user_id: userId,
          product_slug: 'ai_premium',
          stripe_session_id: session.id,
          amount_paid: amountPaid,
          credits_granted: 3,
        })

      // 4. Update demo_projects if this was purchased during demo building
      if (returnState.sessionId) {
        // Set 30-day data retention
        const dataExpiresAt = new Date()
        dataExpiresAt.setDate(dataExpiresAt.getDate() + 30)

        await supabase
          .from('demo_projects' as any)
          .update({
            ai_premium_paid: true,
            ai_premium_payment_intent: session.payment_intent as string,
            ai_credits_total: 3,
            ai_model_used: 'sonnet',
            is_data_retained: true,
            data_expires_at: dataExpiresAt.toISOString(),
            user_id: userId,
            user_email: userEmail,
          })
          .eq('id', returnState.sessionId)
      }

      // 5. Send confirmation email
      const emailHtml = await renderAIPremiumConfirmationEmail({
        customerName: session.customer_details?.name || 'there',
        returnUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        sessionId: returnState.sessionId || '',
      })

      const emailResult = await resendAdapter.sendEmail({
        from: 'Web Launch Academy <noreply@weblaunchacademy.com>',
        to: userEmail,
        subject: 'Your AI Premium Builder is Ready!',
        html: emailHtml,
        replyTo: 'support@weblaunchacademy.com',
      })

      // 6. Log email
      await supabase
        .from('email_logs' as any)
        .insert({
          user_id: userId,
          demo_project_id: returnState.sessionId || null,
          email_type: 'ai_premium_purchase',
          recipient_email: userEmail,
          resend_email_id: emailResult.id,
          status: 'sent',
        })

      // 7. Update checkout session status
      await supabase
        .from('stripe_checkout_sessions' as any)
        .update({ status: 'completed' })
        .eq('session_id', session.id)

      console.log(`✅ AI Premium purchase processed for ${userEmail}`)

    } catch (error) {
      console.error('Error processing AI Premium purchase:', error)
      throw error
    }
  }
}
