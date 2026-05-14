import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SettingsInterface from './SettingsInterface'

export default async function SettingsPage() {
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
    redirect('/signin?redirect=/portal/settings')
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

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  const { data: paymentMethods } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('client_account_id', clientAccount?.id)
    .order('created_at', { ascending: false })

  const { data: connectedServices } = await supabase
    .from('connected_services')
    .select('*')
    .eq('client_account_id', clientAccount?.id)

  return (
    <SettingsInterface
      user={user}
      clientAccount={clientAccount}
      userSettings={userSettings}
      paymentMethods={paymentMethods || []}
      connectedServices={connectedServices || []}
      authEmail={session.user.email || ''}
    />
  )
}
