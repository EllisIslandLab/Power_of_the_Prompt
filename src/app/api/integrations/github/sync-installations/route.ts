import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { listInstallations } from '@/lib/integrations/github'

/**
 * Sync GitHub installations from GitHub to database
 * This fixes cases where the app is installed but not in our DB
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
    console.log('[Sync Installations] Fetching all installations from GitHub...')

    // Get all installations from GitHub
    const installations = await listInstallations()
    console.log('[Sync Installations] Found installations:', installations.length)

    let synced = 0
    let existing = 0

    // Check each installation
    for (const installation of installations) {
      console.log('[Sync Installations] Checking installation:', installation.id, installation.account.login)

      // Check if this installation already exists for this user
      const { data: existingInstall } = await supabase
        .from('github_installations')
        .select('id')
        .eq('installation_id', installation.id)
        .eq('user_id', user.id)
        .single()

      if (existingInstall) {
        console.log('[Sync Installations] Installation already exists:', installation.id)
        existing++
        continue
      }

      // Create the installation record
      const { error: insertError } = await supabase
        .from('github_installations')
        .insert({
          user_id: user.id,
          installation_id: installation.id,
          account_login: installation.account.login,
          account_type: installation.account.type.toLowerCase(),
          suspended_at: null,
        })

      if (insertError) {
        console.error('[Sync Installations] Error inserting installation:', insertError)
      } else {
        console.log('[Sync Installations] Created installation record:', installation.id)
        synced++

        // Sync repositories for this installation
        const { listRepositories } = await import('@/lib/integrations/github')
        const repos = await listRepositories(installation.id)
        console.log('[Sync Installations] Found repositories:', repos.length)

        // Insert repositories
        for (const repo of repos) {
          await supabase
            .from('github_repositories')
            .upsert({
              installation_id: installation.id,
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
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      existing,
      total: installations.length,
      message: synced > 0
        ? `Synced ${synced} installation(s). ${existing} already existed.`
        : `All ${existing} installations were already synced.`
    })
  } catch (error: any) {
    console.error('[Sync Installations] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync installations' },
      { status: 500 }
    )
  }
}
