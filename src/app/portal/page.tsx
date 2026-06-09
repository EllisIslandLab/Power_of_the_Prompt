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

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    redirect('/signin?redirect=/portal')
  }

  // Fetch all data in parallel for faster loading
  const [
    { data: user },
    { data: clientAccount },
    { data: userSettings },
    { data: projects }
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).single(),
    supabase.from('client_accounts').select('*').eq('user_id', authUser.id).single(),
    supabase.from('user_settings').select('*').eq('user_id', authUser.id).single(),
    supabase.from('client_projects').select('*').eq('user_id', authUser.id).eq('is_active', true).limit(1)
  ])

  // If user doesn't exist yet (first OAuth sign-in timing issue), use auth data as fallback
  let userProfile = user
  if (!userProfile) {
    console.log('User record not found yet, using auth fallback')
    userProfile = {
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

  // Create session object from authenticated user (no getSession() needed)
  const session = {
    user: authUser,
    access_token: '', // Not needed for component logic
    refresh_token: '', // Not needed for component logic
  }

  // If no projects and has account balance, redirect to project setup
  if ((!projects || projects.length === 0) && clientAccount?.account_balance > 0) {
    redirect('/portal/projects/new')
  }

  // Get the active project (first one for now)
  const activeProject = projects && projects.length > 0 ? projects[0] : null

  // Fetch connected services for the project
  let connectedServices = null
  if (activeProject) {
    const { data: services } = await supabase
      .from('client_service_credentials')
      .select('service_name, is_valid, metadata')
      .eq('project_id', activeProject.id)
      .eq('is_valid', true)

    connectedServices = services || []
  }

  return (
    <PortalLayout
      user={userProfile}
      clientAccount={clientAccount}
      session={session}
      userSettings={userSettings}
      hasProject={Boolean(projects && projects.length > 0)}
      activeProject={activeProject}
      connectedServices={connectedServices || []}
    />
  )
}
