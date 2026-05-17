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

  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // If user doesn't exist yet (first OAuth sign-in timing issue), use session data as fallback
  if (!user) {
    console.log('Settings - User record not found yet, using session fallback')
    user = {
      id: session.user.id,
      email: session.user.email || '',
      full_name: session.user.user_metadata?.full_name ||
                 session.user.user_metadata?.name ||
                 session.user.email?.split('@')[0] ||
                 'User',
      role: 'client',
      email_verified: !!session.user.email_confirmed_at,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any
  }

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

  // Check for GitHub installation
  const { data: githubInstallations } = await supabase
    .from('github_installations')
    .select('*')
    .eq('user_id', session.user.id)

  // Load from both tables for backwards compatibility
  const { data: oldConnectedServices } = await supabase
    .from('connected_services')
    .select('*')
    .eq('client_account_id', clientAccount?.id)

  // Load user-level services (no project_id)
  const { data: userServiceCredentials } = await supabase
    .from('client_service_credentials')
    .select('*')
    .eq('user_id', user.id)
    .is('project_id', null)

  // Load project-level services (for all user's projects)
  const { data: userProjects } = await supabase
    .from('client_projects')
    .select('id')
    .eq('user_id', user.id)

  const projectIds = userProjects?.map(p => p.id) || []

  let projectServiceCredentials: any[] = []
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from('client_service_credentials')
      .select('*')
      .in('project_id', projectIds)

    projectServiceCredentials = data || []
  }

  // Merge all service lists and deduplicate by service_name
  const allServicesRaw = [
    ...(oldConnectedServices || []).map(s => ({
      service_name: s.service_type,
      is_connected: s.is_connected,
      metadata: s.metadata,
    })),
    ...(userServiceCredentials || []).map(s => ({
      service_name: s.service_name,
      is_connected: s.is_valid,
      metadata: s.metadata,
    })),
    ...(projectServiceCredentials || []).map(s => ({
      service_name: s.service_name,
      is_connected: s.is_valid,
      metadata: s.metadata,
    })),
    // Add GitHub from github_installations table
    ...((githubInstallations && githubInstallations.length > 0) ? [{
      service_name: 'github',
      is_connected: true,
      metadata: { installation_count: githubInstallations.length },
    }] : []),
  ]

  // Deduplicate - if a service appears multiple times, use the first "connected" one
  const serviceMap = new Map()
  for (const service of allServicesRaw) {
    if (!serviceMap.has(service.service_name) || service.is_connected) {
      serviceMap.set(service.service_name, service)
    }
  }
  const allServices = Array.from(serviceMap.values())

  // Debug logging
  console.log('Settings - Old connected services:', oldConnectedServices)
  console.log('Settings - User service credentials:', userServiceCredentials)
  console.log('Settings - Project IDs:', projectIds)
  console.log('Settings - Project service credentials:', projectServiceCredentials)
  console.log('Settings - GitHub installations:', githubInstallations)
  console.log('Settings - All services merged:', allServices)

  return (
    <SettingsInterface
      user={user}
      clientAccount={clientAccount}
      userSettings={userSettings}
      paymentMethods={paymentMethods || []}
      connectedServices={allServices}
      authEmail={session.user.email || ''}
    />
  )
}
