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

    // Clear GitHub installation data from github_repositories
    // (This doesn't delete the repositories, just disconnects them from projects)
    const { error: repoError } = await supabase
      .from('github_repositories')
      .delete()
      .eq('user_id', user.id)

    if (repoError) {
      console.error('[GitHub Disconnect] Failed to clear repositories:', repoError)
    }

    // Clear GitHub installation ID from projects
    const { error: projectError } = await supabase
      .from('client_projects')
      .update({
        github_installation_id: null,
        github_repository_id: null,
        github_owner: null,
        github_repo_name: null,
        github_default_branch: null
      })
      .eq('user_id', user.id)

    if (projectError) {
      console.error('[GitHub Disconnect] Failed to clear project GitHub data:', projectError)
    }

    console.log('[GitHub Disconnect] Successfully cleared GitHub data')

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
