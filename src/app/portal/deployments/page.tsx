import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DeploymentHistory from './DeploymentHistory'

export default async function DeploymentsPage() {
  const cookieStore = cookies()

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
    redirect('/signin?redirect=/portal/deployments')
  }

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

  const { data: deployments } = await supabase
    .from('deployment_history')
    .select('*')
    .eq('client_account_id', clientAccount?.id)
    .order('created_at', { ascending: false })

  return <DeploymentHistory deployments={deployments || []} />
}
