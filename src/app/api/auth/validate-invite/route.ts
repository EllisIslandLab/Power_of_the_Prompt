import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'No invite token provided' },
        { status: 400 }
      )
    }

    // Query the invite_tokens table to validate the token
    const { data: invite, error } = await supabase
      .from('invite_tokens' as any)
      .select('*')
      .eq('token', token)
      .single()

    if (error || !invite) {
      return NextResponse.json(
        { valid: false, error: 'Invalid invite token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Invite token has expired' },
        { status: 400 }
      )
    }

    // Check if token has already been used
    if (invite.used_at) {
      return NextResponse.json(
        { valid: false, error: 'Invite token has already been used' },
        { status: 400 }
      )
    }

    // Token is valid, return the invite details
    return NextResponse.json({
      valid: true,
      email: invite.email,
      full_name: invite.full_name,
      tier: invite.tier,
      token: invite.token
    })

  } catch (error) {
    console.error('Invite validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}