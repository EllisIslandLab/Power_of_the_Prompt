import Stripe from 'stripe'
import { BaseWebhookHandler } from '../BaseWebhookHandler'
import { getSupabase } from '@/lib/supabase'
import { resendAdapter } from '@/adapters/ResendAdapter'
import { renderTextbookConfirmationEmail } from '@/lib/email-builder'

/**
 * Launch Guide (Textbook) Purchase Handler
 *
 * Handles webhook events when a user purchases the Launch Guide ($19).
 * This grants access to the comprehensive website launch guide.
 *
 * Responsibilities:
 * 1. Grant access to Launch Guide content
 * 2. Update user's highest tier purchased
 * 3. Create purchase record
 * 4. Send confirmation email with access instructions
 * 5. Log email to email_logs table
 */
export class TextbookHandler extends BaseWebhookHandler {
  eventType = 'checkout.session.completed' as const

  async canHandle(event: Stripe.Event): Promise<boolean> {
    if (event.type !== this.eventType) return false

    const session = event.data.object as Stripe.Checkout.Session
    const productSlug = session.metadata?.product_slug

    return productSlug === 'textbook'
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

      // 2. Update user's total spent and highest tier
      const { data: userData } = await supabase
        .from('users' as any)
        .select('total_spent, highest_tier_purchased')
        .eq('id', userId)
        .single() as any

      const newTotalSpent = (userData?.total_spent || 0) + amountPaid
      const tierOrder = ['ai_premium', 'textbook', 'basic', 'mid', 'pro']
      const currentTierIndex = tierOrder.indexOf(userData?.highest_tier_purchased || '')
      const newTierIndex = tierOrder.indexOf('textbook')
      const newHighestTier = newTierIndex > currentTierIndex ? 'textbook' : userData?.highest_tier_purchased

      await supabase
        .from('users' as any)
        .update({
          total_spent: newTotalSpent,
          highest_tier_purchased: newHighestTier,
        })
        .eq('id', userId)

      // 3. Create purchase record
      await supabase
        .from('purchases' as any)
        .insert({
          user_id: userId,
          product_slug: 'textbook',
          stripe_session_id: session.id,
          amount_paid: amountPaid,
          credits_granted: 0, // Launch Guide doesn't grant AI credits
        })

      // 4. Send confirmation email
      const emailHtml = await renderTextbookConfirmationEmail({
        customerName: session.customer_details?.name || 'there',
        portalUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        email: userEmail,
      })

      const emailResult = await resendAdapter.sendEmail({
        from: 'Web Launch Academy <noreply@weblaunchacademy.com>',
        to: userEmail,
        subject: 'Your Launch Guide is Ready!',
        html: emailHtml,
        replyTo: 'support@weblaunchacademy.com',
      })

      // 5. Log email
      await supabase
        .from('email_logs' as any)
        .insert({
          user_id: userId,
          email_type: 'textbook_purchase',
          recipient_email: userEmail,
          resend_email_id: emailResult.id,
          status: 'sent',
        })

      // 6. Update checkout session status
      await supabase
        .from('stripe_checkout_sessions' as any)
        .update({ status: 'completed' })
        .eq('session_id', session.id)

      console.log(`✅ Textbook purchase processed for ${userEmail}`)

    } catch (error) {
      console.error('Error processing Textbook purchase:', error)
      throw error
    }
  }
}
