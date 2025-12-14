import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/adapters'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * POST /api/affiliate/compensation
 *
 * Creates a compensation record when an affiliate makes a sale through their badge.
 * This is called by the Stripe webhook handler after a successful purchase.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      referrerId,
      referrerEmail,
      badgeClickId,
      purchaseId,
      purchaseAmount,
      commissionPercentage,
      commissionAmount,
      status = 'earned',
      payoutMethod,
      payoutEmail,
      notes,
    } = body

    // Validate required fields
    if (!referrerId || !purchaseId || !purchaseAmount || !commissionAmount) {
      return NextResponse.json(
        {
          error: 'Missing required fields: referrerId, purchaseId, purchaseAmount, commissionAmount',
        },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // Calculate held_until date (30 days from now)
    const heldUntilDate = new Date()
    heldUntilDate.setDate(heldUntilDate.getDate() + 30)

    // Create compensation record
    const { data, error } = await supabase
      .from('affiliate_compensations')
      .insert({
        referrer_id: referrerId,
        referrer_email: referrerEmail || null,
        badge_click_id: badgeClickId || null,
        purchase_id: purchaseId,
        purchase_amount: purchaseAmount,
        commission_percentage: commissionPercentage || 0,
        commission_amount: commissionAmount,
        status,
        held_until: status === 'earned' ? heldUntilDate.toISOString() : null,
        payout_method: payoutMethod || null,
        payout_email: payoutEmail || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      logger.error({ error }, 'Failed to create compensation record')
      return NextResponse.json(
        { error: 'Failed to create compensation record' },
        { status: 500 }
      )
    }

    // If there's a badge click ID, mark it as converted
    if (badgeClickId) {
      await supabase.rpc('mark_badge_click_converted', {
        p_badge_click_id: badgeClickId,
        p_referee_email: null,
        p_referee_id: null,
      })
    }

    logger.info(
      {
        compensationId: data.id,
        referrerId,
        purchaseId,
        commissionAmount,
      },
      'Compensation record created'
    )

    return NextResponse.json({
      success: true,
      compensationId: data.id,
      commissionAmount: data.commission_amount,
      status: data.status,
      heldUntil: data.held_until,
    })
  } catch (error) {
    logger.error({ error }, 'Error in compensation creation endpoint')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/affiliate/compensation?referrerId={id}&status={status}
 *
 * Retrieves compensation records for an affiliate
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const referrerId = searchParams.get('referrerId')
    const status = searchParams.get('status') // 'earned', 'held', 'processed'

    if (!referrerId) {
      return NextResponse.json(
        { error: 'Missing referrerId parameter' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    let query = supabase
      .from('affiliate_compensations')
      .select('*')
      .eq('referrer_id', referrerId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      logger.error({ error, referrerId }, 'Failed to fetch compensations')
      return NextResponse.json(
        { error: 'Failed to fetch compensations' },
        { status: 500 }
      )
    }

    // Calculate totals
    const totalEarned = data
      .filter((comp) => comp.status === 'earned' || comp.status === 'held')
      .reduce((sum, comp) => sum + parseFloat(comp.commission_amount), 0)

    const totalProcessed = data
      .filter((comp) => comp.status === 'processed')
      .reduce((sum, comp) => sum + parseFloat(comp.commission_amount), 0)

    const readyForPayout = data
      .filter(
        (comp) =>
          comp.status === 'earned' &&
          new Date(comp.held_until) <= new Date()
      )
      .reduce((sum, comp) => sum + parseFloat(comp.commission_amount), 0)

    return NextResponse.json({
      success: true,
      totalEarned: totalEarned.toFixed(2),
      totalProcessed: totalProcessed.toFixed(2),
      readyForPayout: readyForPayout.toFixed(2),
      compensations: data,
    })
  } catch (error) {
    logger.error({ error }, 'Error in compensation retrieval endpoint')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
