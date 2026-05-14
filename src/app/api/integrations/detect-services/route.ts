import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { analyzeRepository, getSetupRecommendations } from '@/lib/integrations/detector'

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
    const body = await request.json()
    console.log('[Detect] Request body:', body)

    const { repositoryId } = body

    if (!repositoryId) {
      console.log('[Detect] Missing repositoryId in request')
      return NextResponse.json(
        { error: 'Repository ID is required' },
        { status: 400 }
      )
    }

    // Get repository details
    console.log('[Detect] Fetching repository:', repositoryId)
    const { data: repository, error: repoError } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('id', repositoryId)
      .single()

    console.log('[Detect] Repository query result:', { repository, error: repoError })

    if (!repository) {
      console.log('[Detect] Repository not found')
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      )
    }

    // Verify user owns this installation
    const { data: installation } = await supabase
      .from('github_installations')
      .select('user_id')
      .eq('installation_id', repository.installation_id)
      .single()

    if (!installation || installation.user_id !== user.id) {
      console.log('[Detect] Access denied - installation not owned by user')
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    console.log('[Detect] Repository found:', repository.full_name)

    // Analyze repository using GitHub App
    const analysis = await analyzeRepository(
      repository.installation_id,
      repository.owner,
      repository.repository_name
    )

    // Get setup recommendations
    const recommendations = getSetupRecommendations(analysis)

    return NextResponse.json({
      success: true,
      repository: {
        id: repository.id,
        name: repository.repository_name,
        fullName: repository.full_name,
        owner: repository.owner,
        defaultBranch: repository.default_branch,
        language: repository.language
      },
      analysis: {
        framework: analysis.framework,
        packageManager: analysis.packageManager,
        services: analysis.services,
        envVarsNeeded: analysis.envVarsNeeded,
        recommendations
      }
    })
  } catch (error) {
    console.error('Error detecting services:', error)
    return NextResponse.json(
      { error: 'Failed to analyze repository' },
      { status: 500 }
    )
  }
}
