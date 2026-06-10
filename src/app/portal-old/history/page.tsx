import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ConversationHistory from './ConversationHistory'

export default async function HistoryPage() {
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

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/signin?redirect=/portal/history')
  }

  const { data: clientAccount } = await supabase
    .from('client_accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  const { data: conversations } = await supabase
    .from('revision_conversations')
    .select(`
      *,
      revision_chat_messages (
        id,
        role,
        content,
        tokens_used,
        created_at
      )
    `)
    .eq('client_account_id', clientAccount?.id)
    .order('created_at', { ascending: false })

  return <ConversationHistory conversations={conversations || []} />
}
