import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PortalInterface from './components/PortalInterface'

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

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    redirect('/signin?redirect=/portal')
  }

  // Fetch user profile
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // If user doesn't exist yet, use auth data as fallback
  if (!user) {
    user = {
      id: authUser.id,
      email: authUser.email || '',
      full_name: authUser.user_metadata?.full_name ||
                 authUser.user_metadata?.name ||
                 authUser.email?.split('@')[0] ||
                 'User',
      role: 'client',
      email_verified: !!authUser.email_confirmed_at,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any
  }

  return <PortalInterface user={user} />
}
