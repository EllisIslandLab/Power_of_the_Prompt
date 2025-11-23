import Stripe from 'stripe'
import { BaseWebhookHandler } from '../BaseWebhookHandler'
import { getSupabase } from '@/lib/supabase'
import { resendAdapter } from '@/adapters/ResendAdapter'
import { renderAIPremiumConfirmationEmail } from '@/lib/email-builder'

/**
 * AI Premium Builder Purchase Handler
 *
 * Handles webhook events when a user purchases the AI Premium Builder ($5).
 * This grants 30 AI credits for enhanced demo website generation.
 *
 * Responsibilities:
 * 1. Grant 30 AI credits to user
 * 2. Update demo_projects with AI Premium status
 * 3. Create purchase record
 * 4. Send confirmation email
 * 5. Log email to email_logs table
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
          .from('users')
          .select('id')
          .eq('email', userEmail)
          .single()

        if (existingUser) {
          userId = existingUser.id
        } else {
          const { data: newUser, error } = await supabase
            .from('users')
            .insert({
              email: userEmail,
              full_name: session.customer_details?.name || '',
            })
            .select('id')
            .single()

          if (error) throw error
          userId = newUser.id
        }
      }

      // 2. Grant 30 AI credits
      await supabase.rpc('update_user_ai_credits', {
        p_user_id: userId,
        p_credits_to_add: 30,
        p_amount_paid: amountPaid,
        p_tier: 'ai_premium',
      })

      // 3. Create purchase record
      await supabase
        .from('purchases')
        .insert({
          user_id: userId,
          product_slug: 'ai_premium',
          stripe_session_id: session.id,
          amount_paid: amountPaid,
          credits_granted: 30,
        })

      // 4. Update demo_projects if this was purchased during demo building
      if (returnState.sessionId) {
        await supabase
          .from('demo_projects')
          .update({
            ai_premium_paid: true,
            ai_premium_payment_intent: session.payment_intent as string,
            ai_credits_total: 30,
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
        .from('email_logs')
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
        .from('stripe_checkout_sessions')
        .update({ status: 'completed' })
        .eq('session_id', session.id)

      console.log(`✅ AI Premium purchase processed for ${userEmail}`)

    } catch (error) {
      console.error('Error processing AI Premium purchase:', error)
      throw error
    }
  }
}
