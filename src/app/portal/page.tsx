import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PortalLayout from './components/PortalLayout'

export default async function PortalPage() {
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
    redirect('/signin?redirect=/portal')
  }

  // Fetch user profile
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch or create client account
  const { data: clientAccount } = await supabase
    .from('client_accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  return (
    <PortalLayout
      user={user}
      clientAccount={clientAccount}
      session={session}
    />
  )
}
