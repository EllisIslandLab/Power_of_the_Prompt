import { NextRequest, NextResponse } from 'next/server'
import { StripeAdapter } from '@/adapters/StripeAdapter'
import { getSupabase } from '@/lib/supabase'

/**
 * Generate Stripe promo codes for the welcome series
 *
 * This creates two promo codes:
 * 1. Full Course: 90% off (prod_T7ZhOkdaZuD7O9)
 * 2. A+ Guarantee: $240 off (prod_T7hC1OpapHdkKe)
 *
 * Both codes expire in 72 hours and are single-use
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, userName, userId } = body

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    const stripe = StripeAdapter.getInstance().getClient()
    const supabase = getSupabase(true) // Use service role

    // Calculate expiration (72 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 72)
    const expirationTimestamp = Math.floor(expiresAt.getTime() / 1000)

    // Generate unique code suffixes
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Product IDs from your Stripe account
    const COURSE_PRODUCT_ID = 'prod_T7ZhOkdaZuD7O9'
    const GUARANTEE_PRODUCT_ID = 'prod_T7hC1OpapHdkKe'

    // ============================================
    // 1. Create Full Course 90% Off Promo Code
    // ============================================

    // Create coupon for course (90% off)
    const courseCoupon = await stripe.coupons.create({
      name: `Welcome Series - 90% Off Full Course`,
      percent_off: 90,
      duration: 'once',
      max_redemptions: 1,
      redeem_by: expirationTimestamp,
      metadata: {
        user_email: userEmail,
        campaign: 'welcome_series',
        product_id: COURSE_PRODUCT_ID
      }
    })

    // Create promo code for course coupon
    const coursePromoCode = await stripe.promotionCodes.create({
      coupon: courseCoupon.id,
      code: `WELCOME90-${randomSuffix}`,
      max_redemptions: 1,
      expires_at: expirationTimestamp,
      restrictions: {
        first_time_transaction: false, // Allow any transaction
      },
      metadata: {
        user_email: userEmail,
        campaign: 'welcome_series',
        product_id: COURSE_PRODUCT_ID,
        product_name: 'Full Course'
      }
    })

    // Save course promo code to database
    const { data: coursePromoData, error: coursePromoError } = await supabase
      .from('promo_codes' as any)
      .insert({
        code: coursePromoCode.code!,
        stripe_promo_code_id: coursePromoCode.id,
        stripe_coupon_id: courseCoupon.id,
        product_id: COURSE_PRODUCT_ID,
        discount_type: 'percentage',
        discount_amount: 90,
        user_email: userEmail,
        user_id: userId || null,
        expires_at: expiresAt.toISOString(),
        campaign_type: 'welcome_series',
        used: false
      })
      .select()
      .single()

    if (coursePromoError) {
      console.error('Error saving course promo code:', coursePromoError)
    }

    // ============================================
    // 2. Create A+ Guarantee $240 Off Promo Code
    // ============================================

    // Create coupon for guarantee ($240 off)
    const guaranteeCoupon = await stripe.coupons.create({
      name: `Welcome Series - $240 Off A+ Guarantee`,
      amount_off: 24000, // $240.00 in cents
      currency: 'usd',
      duration: 'once',
      max_redemptions: 1,
      redeem_by: expirationTimestamp,
      metadata: {
        user_email: userEmail,
        campaign: 'welcome_series',
        product_id: GUARANTEE_PRODUCT_ID
      }
    })

    // Create promo code for guarantee coupon
    const guaranteePromoCode = await stripe.promotionCodes.create({
      coupon: guaranteeCoupon.id,
      code: `WELCOME240-${randomSuffix}`,
      max_redemptions: 1,
      expires_at: expirationTimestamp,
      restrictions: {
        first_time_transaction: false,
      },
      metadata: {
        user_email: userEmail,
        campaign: 'welcome_series',
        product_id: GUARANTEE_PRODUCT_ID,
        product_name: 'A+ Guarantee Program'
      }
    })

    // Save guarantee promo code to database
    const { data: guaranteePromoData, error: guaranteePromoError } = await supabase
      .from('promo_codes' as any)
      .insert({
        code: guaranteePromoCode.code!,
        stripe_promo_code_id: guaranteePromoCode.id,
        stripe_coupon_id: guaranteeCoupon.id,
        product_id: GUARANTEE_PRODUCT_ID,
        discount_type: 'fixed',
        discount_amount: 240,
        user_email: userEmail,
        user_id: userId || null,
        expires_at: expiresAt.toISOString(),
        campaign_type: 'welcome_series',
        used: false
      })
      .select()
      .single()

    if (guaranteePromoError) {
      console.error('Error saving guarantee promo code:', guaranteePromoError)
    }

    return NextResponse.json({
      success: true,
      promo_codes: {
        course: {
          code: coursePromoCode.code,
          discount: '90% off',
          product: 'Full Course',
          product_id: COURSE_PRODUCT_ID,
          expires_at: expiresAt.toISOString(),
          pricing_url: `https://weblaunchacademy.com/pricing?promo=${coursePromoCode.code}&product=course`
        },
        guarantee: {
          code: guaranteePromoCode.code,
          discount: '$240 off',
          product: 'A+ Guarantee Program',
          product_id: GUARANTEE_PRODUCT_ID,
          expires_at: expiresAt.toISOString(),
          pricing_url: `https://weblaunchacademy.com/pricing?promo=${guaranteePromoCode.code}&product=guarantee`
        }
      },
      expires_at: expiresAt.toISOString(),
      expiration_formatted: expiresAt.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
        timeZoneName: 'short'
      })
    })

  } catch (error) {
    console.error('Error generating promo codes:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate promo codes',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Check promo code status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const email = searchParams.get('email')

    if (!code && !email) {
      return NextResponse.json(
        { error: 'Either code or email parameter is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase(true)

    let query = supabase.from('promo_codes' as any).select('*')

    if (code) {
      query = query.eq('code', code)
    } else if (email) {
      query = query.eq('user_email', email)
    }

    const { data: promoCodes, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      promo_codes: promoCodes
    })

  } catch (error) {
    console.error('Error fetching promo codes:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch promo codes',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
