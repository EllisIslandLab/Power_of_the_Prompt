import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import WebsiteSettingsInterface from './WebsiteSettingsInterface'

export default async function WebsiteSettingsPage() {
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
    redirect('/signin?redirect=/portal/website-settings')
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

  const { data: websiteConfig } = await supabase
    .from('client_website_config')
    .select('*')
    .eq('client_account_id', clientAccount?.id)
    .single()

  const { data: uploadedImages } = await supabase
    .from('client_uploaded_images')
    .select('*')
    .eq('client_account_id', clientAccount?.id)
    .order('uploaded_at', { ascending: false })
    .limit(20)

  return (
    <WebsiteSettingsInterface
      user={user}
      clientAccount={clientAccount}
      websiteConfig={websiteConfig}
      uploadedImages={uploadedImages || []}
    />
  )
}
