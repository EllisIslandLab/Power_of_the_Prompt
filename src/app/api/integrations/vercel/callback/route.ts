import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { exchangeVercelCode, getVercelUser, listVercelProjects } from '@/lib/integrations/vercel'
import { encrypt } from '@/lib/encryption'

/**
 * Vercel OAuth callback
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const next = searchParams.get('next') // Vercel passes this
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/portal/projects/new?error=vercel_${error}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/portal/projects/new?error=vercel_no_code', request.url)
    )
  }

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
    return NextResponse.redirect(
      new URL('/signin?redirect=/portal/projects/new', request.url)
    )
  }

  try {
    // Exchange code for access token
    const { access_token, team_id, user_id } = await exchangeVercelCode(code)

    // Get user details
    const { user: vercelUser } = await getVercelUser(access_token)

    // Store access token
    const { error: saveError } = await supabase
      .from('client_service_credentials')
      .upsert({
        user_id: user.id,
        service_name: 'vercel',
        access_token_encrypted: encrypt(access_token),
        metadata: {
          vercel_user_id: user_id,
          vercel_team_id: team_id,
          vercel_username: vercelUser.username,
          vercel_email: vercelUser.email
        },
        is_valid: true,
        last_validated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,service_name'
      })

    if (saveError) {
      console.error('Failed to save Vercel token:', saveError)
      return NextResponse.redirect(
        new URL('/portal/projects/new?error=vercel_save_failed', request.url)
      )
    }

    // Fetch projects to show user
    const projects = await listVercelProjects(access_token, team_id)

    // Store project count in session for display
    const response = NextResponse.redirect(
      new URL(
        `/portal/projects/new?step=vercel_connected&project_count=${projects.length}`,
        request.url
      )
    )

    return response
  } catch (error) {
    console.error('Vercel OAuth error:', error)
    return NextResponse.redirect(
      new URL('/portal/projects/new?error=vercel_oauth_failed', request.url)
    )
  }
}
