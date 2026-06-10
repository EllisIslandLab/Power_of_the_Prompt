import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getInstallationOctokit } from '@/lib/integrations/github'

/**
 * Search files in GitHub repository
 */
export async function GET(request: NextRequest) {
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
    const url = new URL(request.url)
    const query = url.searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      )
    }

    // Get active project
    const { data: projects } = await supabase
      .from('client_projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)

    if (!projects || projects.length === 0) {
      return NextResponse.json({ results: [] })
    }

    const project = projects[0]

    if (!project.github_owner || !project.github_repo_name) {
      return NextResponse.json({ results: [] })
    }

    // Get installation ID
    const { data: installation } = await supabase
      .from('github_installations')
      .select('installation_id')
      .eq('user_id', user.id)
      .single()

    if (!installation) {
      return NextResponse.json({ results: [] })
    }

    // Use GitHub search API
    const octokit = await getInstallationOctokit(installation.installation_id)

    const { data } = await octokit.rest.search.code({
      q: `${query} repo:${project.github_owner}/${project.github_repo_name}`,
      per_page: 50
    })

    const results = data.items.map(item => ({
      name: item.name,
      path: item.path,
      url: item.html_url,
      repository: item.repository
    }))

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Error searching files:', error)
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}
