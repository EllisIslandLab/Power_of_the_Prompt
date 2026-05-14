import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createOrUpdateFile } from '@/lib/integrations/github'

export async function POST(request: Request) {
  try {
    const { changeId, action } = await request.json() // action: 'approve' or 'reject'

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

    // Get the pending change
    const { data: change } = await supabase
      .from('pending_code_changes')
      .select('*, revision_conversations(project_id)')
      .eq('id', changeId)
      .single()

    if (!change) {
      return Response.json({ error: 'Change not found' }, { status: 404 })
    }

    if (action === 'reject') {
      // Just mark as rejected
      await supabase
        .from('pending_code_changes')
        .update({ status: 'rejected' })
        .eq('id', changeId)

      return Response.json({ success: true, message: 'Change rejected' })
    }

    if (action === 'approve') {
      // Get project details
      const { data: project } = await supabase
        .from('client_projects')
        .select('github_installation_id, github_repository_id')
        .eq('id', change.revision_conversations.project_id)
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

      // Commit the change to GitHub
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

      // Mark as approved and committed
      await supabase
        .from('pending_code_changes')
        .update({
          status: 'committed',
          approved_at: new Date().toISOString(),
          committed_at: new Date().toISOString(),
        })
        .eq('id', changeId)

      return Response.json({
        success: true,
        message: `Change committed to branch ${change.branch_name}`,
      })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Approve change error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
