import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import BillingInterface from './BillingInterface'

export default async function BillingPage() {
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
    redirect('/signin?redirect=/portal/billing')
  }

  // Fetch user profile and client account
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const { data: clientAccount } = await supabase
    .from('client_accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  // Fetch transaction history
  const { data: conversations } = await supabase
    .from('revision_conversations')
    .select(`
      id,
      created_at,
      status,
      revision_chat_messages (
        tokens_used,
        created_at
      )
    `)
    .eq('client_account_id', clientAccount?.id)
    .order('created_at', { ascending: false })

  return (
    <BillingInterface
      user={user}
      clientAccount={clientAccount}
      conversations={conversations || []}
    />
  )
}
