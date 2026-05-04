import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'

export default async function AdminRevisionsPage() {
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
    redirect('/signin?redirect=/admin/revisions')
  }

  // Check if user is admin
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (user?.role !== 'admin') {
    redirect('/portal')
  }

  // Fetch all client accounts with recent activity
  const { data: clientAccounts } = await supabase
    .from('client_accounts')
    .select(`
      *,
      users!client_accounts_user_id_fkey (
        id,
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  // Fetch all active conversations
  const { data: activeConversations } = await supabase
    .from('revision_conversations')
    .select(`
      *,
      client_accounts (
        id,
        users!client_accounts_user_id_fkey (
          full_name,
          email
        )
      )
    `)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })

  // Fetch pending database work
  const { data: pendingDbWork } = await supabase
    .from('database_work_requests')
    .select(`
      *,
      client_accounts (
        users!client_accounts_user_id_fkey (
          full_name,
          email
        )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Fetch pending deployments
  const { data: pendingDeployments } = await supabase
    .from('deployment_history')
    .select(`
      *,
      client_accounts (
        users!client_accounts_user_id_fkey (
          full_name,
          email
        )
      )
    `)
    .eq('deployment_status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <AdminDashboard
      clientAccounts={clientAccounts || []}
      activeConversations={activeConversations || []}
      pendingDbWork={pendingDbWork || []}
      pendingDeployments={pendingDeployments || []}
    />
  )
}
