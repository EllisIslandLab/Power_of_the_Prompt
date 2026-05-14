import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createOrUpdateFile } from '@/lib/integrations/github'

export async function POST(request: Request) {
  try {
    const { conversationId } = await request.json()

    if (!conversationId) {
      return Response.json({ error: 'conversationId required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role to bypass RLS
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get all pending changes for this conversation
    const { data: changes, error: changesError } = await supabase
      .from('pending_code_changes')
      .select('*, revision_conversations(project_id)')
      .eq('conversation_id', conversationId)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: true })

    console.log('[commit-all-changes] conversationId:', conversationId)
    console.log('[commit-all-changes] found changes:', changes?.length || 0)
    console.log('[commit-all-changes] error:', changesError)

    if (changesError) {
      console.error('[commit-all-changes] Database error:', changesError)
      return Response.json({
        success: false,
        error: changesError.message,
        committed: 0,
      }, { status: 500 })
    }

    if (!changes || changes.length === 0) {
      console.log('[commit-all-changes] No pending changes found')
      return Response.json({
        success: true,
        message: 'No pending changes to commit',
        committed: 0,
      })
    }

    // Get project details
    const { data: project } = await supabase
      .from('client_projects')
      .select('github_installation_id, github_repository_id')
      .eq('id', changes[0].revision_conversations.project_id)
      .single()

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get repository details
    const { data: repo } = await supabase
      .from('github_repositories')
      .select('owner, repository_name')
      .eq('id', project.github_repository_id)
      .single()

    if (!repo) {
      return Response.json({ error: 'Repository not found' }, { status: 404 })
    }

    // Commit each change to GitHub
    const results = []
    for (const change of changes) {
      try {
        const commitMessage = `${change.change_type === 'create' ? 'Create' : 'Update'} ${change.file_path}\n\n${change.description}`

        await createOrUpdateFile(
          project.github_installation_id,
          repo.owner,
          repo.repository_name,
          change.file_path,
          change.full_file_content,
          commitMessage,
          change.branch_name,
          change.file_sha || undefined
        )

        // Mark as committed
        await supabase
          .from('pending_code_changes')
          .update({
            status: 'committed',
            approved_at: new Date().toISOString(),
            committed_at: new Date().toISOString(),
          })
          .eq('id', change.id)

        results.push({
          file: change.file_path,
          success: true,
        })
      } catch (error: any) {
        console.error(`Failed to commit ${change.file_path}:`, error)
        results.push({
          file: change.file_path,
          success: false,
          error: error.message,
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length

    return Response.json({
      success: failedCount === 0,
      message: `Committed ${successCount} changes to branch ${changes[0].branch_name}`,
      committed: successCount,
      failed: failedCount,
      results,
      branchName: changes[0].branch_name,
    })
  } catch (error) {
    console.error('Commit all changes error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
