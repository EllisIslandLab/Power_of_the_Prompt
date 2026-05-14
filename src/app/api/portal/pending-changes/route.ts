import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return Response.json({ error: 'conversationId required' }, { status: 400 })
    }

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

    // Fetch pending changes for this conversation
    // Get only the latest change for each file path to avoid duplicates
    const { data: allChanges, error } = await supabase
      .from('pending_code_changes')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending changes:', error)
      return Response.json({ error: 'Failed to fetch changes' }, { status: 500 })
    }

    // Deduplicate by file_path - keep only the most recent change per file
    const seenFiles = new Set<string>()
    const changes = allChanges?.filter(change => {
      if (seenFiles.has(change.file_path)) {
        return false
      }
      seenFiles.add(change.file_path)
      return true
    }) || []

    // Re-sort by created_at ascending after deduplication
    changes.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Also fetch the working branch
    const { data: conversation } = await supabase
      .from('revision_conversations')
      .select('metadata')
      .eq('id', conversationId)
      .single()

    return Response.json({
      changes: changes || [],
      workingBranch: conversation?.metadata?.working_branch || null,
    })
  } catch (error) {
    console.error('Pending changes API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
