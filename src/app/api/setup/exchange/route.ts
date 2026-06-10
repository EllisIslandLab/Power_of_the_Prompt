import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Exchange setup code for permanent auth token
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Setup code required' },
        { status: 400 }
      )
    }

    // Find the setup code
    const { data: setupCode, error: lookupError } = await supabaseAdmin
      .from('setup_codes')
      .select('*')
      .eq('code', code)
      .single()

    if (lookupError || !setupCode) {
      return NextResponse.json(
        { error: 'Invalid setup code' },
        { status: 404 }
      )
    }

    // Check if already used
    if (setupCode.used_at) {
      return NextResponse.json(
        { error: 'Setup code already used' },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date(setupCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Setup code expired' },
        { status: 400 }
      )
    }

    // Generate a permanent API token (32 chars)
    const apiToken = `wla_${crypto.randomBytes(24).toString('base64url')}`

    // Store the API token in user metadata or a separate table
    // For now, we'll return a session token that the client can use

    // Get user to retrieve email
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(setupCode.user_id)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate a magic link token (valid auth token)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!
    })

    if (linkError || !linkData) {
      console.error('[Setup] Failed to generate token:', linkError)
      return NextResponse.json(
        { error: 'Failed to create auth token' },
        { status: 500 }
      )
    }

    // Mark code as used
    await supabaseAdmin
      .from('setup_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', setupCode.id)

    // Return the access token from the magic link
    // Magic links typically expire in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    return NextResponse.json({
      success: true,
      token: linkData.properties.hashed_token,
      expiresAt
    })
  } catch (error: any) {
    console.error('[Setup] Exchange error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to exchange code' },
      { status: 500 }
    )
  }
}
