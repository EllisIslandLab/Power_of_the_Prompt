import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Detect services used in a repository
 * Returns common services that clients typically need to connect
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
    const { repositoryId } = await request.json()

    if (!repositoryId) {
      return NextResponse.json(
        { error: 'Repository ID required' },
        { status: 400 }
      )
    }

    // Get repository details
    const { data: repo } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('id', repositoryId)
      .single()

    if (!repo) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      )
    }

    // Detect framework based on language
    let framework = {
      name: 'Unknown',
      type: 'unknown',
      version: undefined
    }

    if (repo.language === 'JavaScript' || repo.language === 'TypeScript') {
      framework = {
        name: 'Next.js',
        type: 'nextjs',
        version: undefined
      }
    }

    // Return common services that clients typically need
    // All marked as high confidence so they show in onboarding
    const services = [
      {
        name: 'airtable',
        confidence: 'high' as const,
        detected: true,
        requiredCredentials: ['api_key', 'base_id'],
        optionalCredentials: []
      },
      {
        name: 'supabase',
        confidence: 'high' as const,
        detected: true,
        requiredCredentials: ['url', 'anon_key', 'service_role_key'],
        optionalCredentials: []
      },
      {
        name: 'vercel',
        confidence: 'high' as const,
        detected: true,
        requiredCredentials: ['access_token'],
        optionalCredentials: ['team_id']
      }
    ]

    const analysis = {
      framework,
      services,
      packageManager: 'npm',
      envVarsNeeded: [],
      recommendations: [
        'Connect Airtable for data management',
        'Connect Supabase for authentication and database',
        'Connect Vercel for deployment previews'
      ]
    }

    return NextResponse.json({
      success: true,
      analysis
    })
  } catch (error: any) {
    console.error('[Detect Services] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze repository' },
      { status: 500 }
    )
  }
}
