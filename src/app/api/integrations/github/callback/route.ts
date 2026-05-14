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

  if (!user) {
    const userId = cookieStore.get('github_install_user_id')?.value
    if (!userId) {
      return NextResponse.redirect(
        new URL('/signin?error=session_expired', request.url)
      )
    }
    // User ID from cookie - but still need to re-authenticate
    return NextResponse.redirect(
      new URL('/signin?redirect=/portal/projects/new', request.url)
    )
  }

  // Handle installation flow
  if (installationId && setupAction === 'install') {
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
          new URL('/portal/projects/new?error=installation_not_found', request.url)
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
          new URL('/portal/projects/new?error=installation_failed', request.url)
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

      // Clear the temporary cookie
      const response = NextResponse.redirect(
        new URL('/portal/projects/new?step=select_repo&installation_id=' + installationId, request.url)
      )
      response.cookies.delete('github_install_user_id')

      return response
    } catch (error) {
      console.error('Error processing installation:', error)
      return NextResponse.redirect(
        new URL('/portal/projects/new?error=installation_error', request.url)
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

      return NextResponse.redirect(
        new URL('/portal/projects/new?step=oauth_success', request.url)
      )
    } catch (error) {
      console.error('Error processing OAuth:', error)
      return NextResponse.redirect(
        new URL('/portal/projects/new?error=oauth_failed', request.url)
      )
    }
  }

  // No valid parameters
  return NextResponse.redirect(
    new URL('/portal/projects/new?error=invalid_callback', request.url)
  )
}
