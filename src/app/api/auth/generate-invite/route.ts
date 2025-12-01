import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, tier, createdBy, expiresInDays = 7 } = await request.json()

    // Validate input
    if (!email || !tier) {
      return NextResponse.json(
        { error: 'Email and tier are required' },
        { status: 400 }
      )
    }

    if (!['free', 'full'].includes(tier)) {
      return NextResponse.json(
        { error: 'Tier must be either "free" or "full"' },
        { status: 400 }
      )
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex')

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Check if there's already an active invite for this email
    const { data: existingInvite } = await supabase
      .from('invite_tokens' as any)
      .select('*')
      .eq('email', email.toLowerCase())
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single() as any

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An active invite already exists for this email' },
        { status: 409 }
      )
    }

    // Create invite token
    const { data: invite, error } = await supabase
      .from('invite_tokens' as any)
      .insert({
        token,
        email: email.toLowerCase(),
        full_name: fullName || null,
        tier,
        expires_at: expiresAt.toISOString(),
        created_by: createdBy || 'system'
      })
      .select()
      .single() as any

    if (error) {
      console.error('Failed to create invite token:', error)
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      )
    }

    // Generate signup URL
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || 'weblaunchacademy.com'
    const signupUrl = `${protocol}://${host}/signup?token=${token}`

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        token: invite.token,
        email: invite.email,
        tier: invite.tier,
        expires_at: invite.expires_at,
        signup_url: signupUrl
      },
      message: `Invite created for ${email} with ${tier} access`
    })

  } catch (error) {
    console.error('Generate invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}