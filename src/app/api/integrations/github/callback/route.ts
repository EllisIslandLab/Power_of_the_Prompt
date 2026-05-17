import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { listRepositories, listInstallations } from '@/lib/integrations/github'

/**
 * GitHub App installation callback
 * Called after user installs the app or authorizes
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const installationId = searchParams.get('installation_id')
  const setupAction = searchParams.get('setup_action')
  const code = searchParams.get('code') // OAuth code

  // Get the correct origin (handles ngrok, localhost, production)
  const host = request.headers.get('host') || request.nextUrl.host
  const protocol = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '')
  const origin = `${protocol}://${host}`

  console.log('[GitHub Callback] Received params:', {
    installationId,
    setupAction,
    hasCode: !!code,
    allParams: Object.fromEntries(searchParams.entries()),
    origin
  })

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

  // Get user from session
  const { data: { user } } = await supabase.auth.getUser()

  console.log('[GitHub Callback] User authenticated:', !!user)

  if (!user) {
    console.log('[GitHub Callback] No user session, checking cookie...')
    const userId = cookieStore.get('github_install_user_id')?.value
    if (!userId) {
      console.log('[GitHub Callback] No cookie either, redirecting to signin')
      return NextResponse.redirect(
        new URL('/signin?error=session_expired', origin)
      )
    }
    // User ID from cookie - but still need to re-authenticate
    console.log('[GitHub Callback] Cookie found, redirecting to signin with redirect')
    return NextResponse.redirect(
      new URL('/signin?redirect=/portal/projects/new', origin)
    )
  }

  // Handle installation flow (both new installs and updates)
  if (installationId && (setupAction === 'install' || setupAction === 'update' || setupAction === 'request')) {
    try {
      console.log('[Callback] Processing installation:', installationId)
      console.log('[Callback] User ID:', user.id)

      // First, verify the installation exists
      console.log('[Callback] Listing all installations...')
      const installations = await listInstallations()
      console.log('[Callback] Found installations:', installations.map(i => i.id))

      const installation = installations.find(i => i.id === parseInt(installationId))
      if (!installation) {
        console.error('[Callback] Installation not found:', installationId)
        return NextResponse.redirect(
          new URL('/portal/projects/new?error=installation_not_found', origin)
        )
      }

      console.log('[Callback] Installation verified:', installation)

      // Get list of repositories from this installation
      const repos = await listRepositories(parseInt(installationId))

      // Store installation in database
      const { error: installError } = await supabase
        .from('github_installations')
        .upsert({
          user_id: user.id,
          installation_id: parseInt(installationId),
          account_type: repos[0]?.owner ? 'user' : 'organization',
          account_login: repos[0]?.owner || 'unknown',
          suspended_at: null,
          updated_at: new Date().toISOString()
        })

      if (installError) {
        console.error('Failed to store installation:', installError)
        return NextResponse.redirect(
          new URL('/portal/projects/new?error=installation_failed', origin)
        )
      }

      // Store repositories
      for (const repo of repos) {
        await supabase
          .from('github_repositories')
          .upsert({
            installation_id: parseInt(installationId),
            repository_id: repo.id,
            repository_name: repo.name,
            full_name: repo.full_name,
            owner: repo.owner,
            private: repo.private,
            default_branch: repo.default_branch,
            html_url: repo.html_url,
            language: repo.language,
            updated_at: new Date().toISOString()
          })
      }

      // Check if there's a custom redirect URL
      const redirectTo = cookieStore.get('github_install_redirect')?.value
      const redirectUrl = redirectTo
        ? new URL(redirectTo, origin)
        : new URL('/portal/projects/new?step=select_repo&installation_id=' + installationId, origin)

      console.log('[GitHub Callback] Redirecting to:', redirectUrl.toString())
      console.log('[GitHub Callback] Installation ID:', installationId)
      console.log('[GitHub Callback] Custom redirect:', redirectTo || 'none')

      // Clear the temporary cookies
      const response = NextResponse.redirect(redirectUrl)
      response.cookies.delete('github_install_user_id')
      response.cookies.delete('github_install_redirect')

      return response
    } catch (error) {
      console.error('Error processing installation:', error)
      return NextResponse.redirect(
        new URL('/portal/projects/new?error=installation_error', origin)
      )
    }
  }

  // Handle OAuth flow (if using user authorization)
  if (code) {
    try {
      const { exchangeCodeForToken, getUserWithToken } = await import('@/lib/integrations/github')

      // Exchange code for token
      const { access_token } = await exchangeCodeForToken(code)

      // Get user info
      const githubUser = await getUserWithToken(access_token)

      // Store OAuth token (encrypted)
      const { encrypt } = await import('@/lib/encryption')

      await supabase
        .from('github_oauth_tokens')
        .upsert({
          user_id: user.id,
          github_user_id: githubUser.id,
          github_login: githubUser.login,
          access_token_encrypted: encrypt(access_token),
          updated_at: new Date().toISOString()
        })

      // Check if there's a custom redirect URL
      const redirectTo = cookieStore.get('github_install_redirect')?.value
      const redirectUrl = redirectTo
        ? new URL(redirectTo, origin)
        : new URL('/portal/projects/new?step=oauth_success', origin)

      const response = NextResponse.redirect(redirectUrl)
      response.cookies.delete('github_install_redirect')

      return response
    } catch (error) {
      console.error('Error processing OAuth:', error)
      return NextResponse.redirect(
        new URL('/portal/projects/new?error=oauth_failed', origin)
      )
    }
  }

  // No valid parameters
  return NextResponse.redirect(
    new URL('/portal/projects/new?error=invalid_callback', origin)
  )
}
