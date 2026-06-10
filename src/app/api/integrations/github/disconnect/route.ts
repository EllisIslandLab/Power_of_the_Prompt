import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Clear stale GitHub installation data
 * Allows users to reconnect with a fresh installation
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
    console.log('[GitHub Disconnect] Clearing stale installation data for user:', user.id)

    // Clear GitHub credentials from client_service_credentials
    const { error: credsError } = await supabase
      .from('client_service_credentials')
      .delete()
      .eq('user_id', user.id)
      .eq('service_name', 'github')

    if (credsError) {
      console.error('[GitHub Disconnect] Failed to clear credentials:', credsError)
    }

    // Get user's installation IDs first
    const { data: installations } = await supabase
      .from('github_installations')
      .select('installation_id')
      .eq('user_id', user.id)

    // Clear GitHub installation data from github_repositories
    // (github_repositories doesn't have user_id, links via installation_id)
    let repoError = null
    if (installations && installations.length > 0) {
      const installationIds = installations.map(i => i.installation_id)
      const result = await supabase
        .from('github_repositories')
        .delete()
        .in('installation_id', installationIds)
      repoError = result.error
    }

    if (repoError) {
      console.error('[GitHub Disconnect] Failed to clear repositories:', repoError)
    }

    // Clear GitHub installation/repository IDs from projects
    // BUT preserve github_owner and github_repo_name for auto-relinking
    const { error: projectError } = await supabase
      .from('client_projects')
      .update({
        github_installation_id: null,
        github_repository_id: null,
        // Keep these for auto-relink:
        // github_owner: <preserved>
        // github_repo_name: <preserved>
        // github_default_branch: <preserved>
      })
      .eq('user_id', user.id)

    if (projectError) {
      console.error('[GitHub Disconnect] Failed to clear project GitHub data:', projectError)
    }

    console.log('[GitHub Disconnect] Successfully cleared installation IDs (preserved repo names for auto-relink)')

    return NextResponse.json({
      success: true,
      message: 'GitHub data cleared. You can now reconnect.'
    })
  } catch (error: any) {
    console.error('[GitHub Disconnect] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect GitHub' },
      { status: 500 }
    )
  }
}
