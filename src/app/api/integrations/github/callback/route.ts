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
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  console.log('[GitHub Callback] User authenticated:', !!user)
  console.log('[GitHub Callback] User error:', userError)

  // If no user session, check cookie and preserve installation ID
  if (!user) {
    console.log('[GitHub Callback] No user session, checking cookie...')
    const userId = cookieStore.get('github_install_user_id')?.value

    if (!userId) {
      console.log('[GitHub Callback] No cookie either, redirecting to signin')
      // Preserve installation_id in redirect if available
      const redirectUrl = installationId
        ? `/signin?error=session_expired&redirect=/portal/projects/new?step=select_repo&installation_id=${installationId}`
        : '/signin?error=session_expired'
      return NextResponse.redirect(new URL(redirectUrl, origin))
    }

    // User ID from cookie - preserve installation ID and redirect to continue flow
    console.log('[GitHub Callback] Cookie found, redirecting to signin with preserved installation')
    const redirectUrl = installationId
      ? `/signin?redirect=/portal/projects/new?step=select_repo&installation_id=${installationId}`
      : '/signin?redirect=/portal/projects/new'
    return NextResponse.redirect(new URL(redirectUrl, origin))
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
      const accountLogin = repos[0]?.owner || 'unknown'

      // CLEANUP: Delete old installations for this account (user reinstalled)
      // This happens when users uninstall/reinstall - GitHub creates new installation_id
      console.log('[Callback] Cleaning up old installations for account:', accountLogin)
      const { data: oldInstallations } = await supabase
        .from('github_installations')
        .select('installation_id, id')
        .eq('user_id', user.id)
        .eq('account_login', accountLogin)
        .neq('installation_id', parseInt(installationId))

      if (oldInstallations && oldInstallations.length > 0) {
        console.log('[Callback] Found old installations to clean up:', oldInstallations.map(i => i.installation_id))

        // Get repositories from old installations
        const { data: oldRepos } = await supabase
          .from('github_repositories')
          .select('id, full_name, installation_id')
          .in('installation_id', oldInstallations.map(i => i.installation_id))

        console.log('[Callback] Old repos to migrate:', oldRepos?.map(r => r.full_name))

        // For each old repo, find matching new repo and update projects
        if (oldRepos) {
          for (const oldRepo of oldRepos) {
            // Find matching repo in new installation
            const matchingNewRepo = repos.find(r => r.full_name === oldRepo.full_name)

            if (matchingNewRepo) {
              // Get the new repo ID from DB (we'll insert it below)
              console.log('[Callback] Will migrate projects from', oldRepo.full_name, 'to new installation')

              // Store for later migration (after we insert new repos)
              if (!('_migrateQueue' in globalThis)) {
                (globalThis as any)._migrateQueue = []
              }
              (globalThis as any)._migrateQueue.push({
                oldRepoId: oldRepo.id,
                newRepoFullName: matchingNewRepo.full_name
              })
            }
          }
        }

        // Delete old repositories
        await supabase
          .from('github_repositories')
          .delete()
          .in('installation_id', oldInstallations.map(i => i.installation_id))

        // Delete old installations
        await supabase
          .from('github_installations')
          .delete()
          .in('installation_id', oldInstallations.map(i => i.installation_id))

        console.log('[Callback] Cleaned up old installations')
      }

      // Store installation in database
      const { error: installError } = await supabase
        .from('github_installations')
        .upsert({
          user_id: user.id,
          installation_id: parseInt(installationId),
          account_type: repos[0]?.owner ? 'user' : 'organization',
          account_login: accountLogin,
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

      // Migrate projects from old repos to new repos
      const migrateQueue = (globalThis as any)._migrateQueue || []
      if (migrateQueue.length > 0) {
        console.log('[Callback] Migrating projects to new installation...')

        for (const migration of migrateQueue) {
          // Get the new repo ID
          const { data: newRepo } = await supabase
            .from('github_repositories')
            .select('id')
            .eq('full_name', migration.newRepoFullName)
            .eq('installation_id', parseInt(installationId))
            .single()

          if (newRepo) {
            // Update all projects that were linked to the old repo
            const { data: updatedProjects } = await supabase
              .from('client_projects')
              .update({ github_repository_id: newRepo.id })
              .eq('github_repository_id', migration.oldRepoId)
              .select('project_name')

            if (updatedProjects && updatedProjects.length > 0) {
              console.log('[Callback] Migrated projects:', updatedProjects.map(p => p.project_name))
            }
          }
        }

        // Clear the queue
        delete (globalThis as any)._migrateQueue
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
