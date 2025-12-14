import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/adapters'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * POST /api/affiliate/badge-click
 *
 * Tracks when a user clicks on a WLA badge affiliate link.
 * This endpoint records the click and creates a session to track
 * if the user converts (makes a purchase).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      referrerId,
      referrerEmail,
      sourceDomain,
      sourceUrl,
      sessionId,
    } = body

    // Validate required fields
    if (!referrerId || !referrerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: referrerId and referrerEmail' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || ''
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Create badge click record
    const { data, error } = await supabase
      .from('affiliate_badge_clicks')
      .insert({
        referrer_id: referrerId,
        referrer_email: referrerEmail,
        source_domain: sourceDomain || null,
        source_url: sourceUrl || null,
        user_agent: userAgent,
        ip_address: ipAddress,
        session_id: sessionId,
        clicked_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      logger.error({ error }, 'Failed to track badge click')
      return NextResponse.json(
        { error: 'Failed to track badge click' },
        { status: 500 }
      )
    }

    logger.info(
      {
        badgeClickId: data.id,
        referrerId,
        referrerEmail,
        sourceDomain,
      },
      'Badge click tracked successfully'
    )

    return NextResponse.json({
      success: true,
      badgeClickId: data.id,
      clickedAt: data.clicked_at,
    })
  } catch (error) {
    logger.error({ error }, 'Error in badge click tracking endpoint')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/affiliate/badge-click?referrerId={id}
 *
 * Retrieves badge click stats for an affiliate
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const referrerId = searchParams.get('referrerId')
    const status = searchParams.get('status') // 'converted' or 'pending'

    if (!referrerId) {
      return NextResponse.json(
        { error: 'Missing referrerId parameter' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    let query = supabase
      .from('affiliate_badge_clicks')
      .select('*')
      .eq('referrer_id', referrerId)

    if (status === 'converted') {
      query = query.eq('converted', true)
    } else if (status === 'pending') {
      query = query.eq('converted', false)
    }

    const { data, error } = await query.order('clicked_at', { ascending: false })

    if (error) {
      logger.error({ error, referrerId }, 'Failed to fetch badge clicks')
      return NextResponse.json(
        { error: 'Failed to fetch badge clicks' },
        { status: 500 }
      )
    }

    // Calculate stats
    const totalClicks = data.length
    const convertedClicks = data.filter((click) => click.converted).length
    const conversionRate = totalClicks > 0 ? (convertedClicks / totalClicks) * 100 : 0

    return NextResponse.json({
      success: true,
      totalClicks,
      convertedClicks,
      conversionRate: conversionRate.toFixed(2),
      clicks: data,
    })
  } catch (error) {
    logger.error({ error }, 'Error in badge click stats endpoint')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
