import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'

/**
 * Generate a one-time setup code
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Generate random code (8 characters, alphanumeric)
    const code = crypto.randomBytes(6).toString('base64url').substring(0, 8)

    // Expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    // Store in database
    const { data: setupCode, error } = await supabase
      .from('setup_codes')
      .insert({
        user_id: user.id,
        code,
        expires_at: expiresAt
      })
      .select()
      .single()

    if (error) {
      console.error('[Setup] Failed to create code:', error)
      return NextResponse.json(
        { error: 'Failed to generate setup code' },
        { status: 500 }
      )
    }

    // Return the command
    const command = `npx @weblaunchacademy/setup ${code}`

    return NextResponse.json({
      success: true,
      code,
      command,
      expiresAt
    })
  } catch (error: any) {
    console.error('[Setup] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate setup code' },
      { status: 500 }
    )
  }
}
