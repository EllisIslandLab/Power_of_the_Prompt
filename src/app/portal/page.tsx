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

  // Fetch user settings for theme
  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  // Check if user has any active projects
  const { data: projects } = await supabase
    .from('client_projects')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .limit(1)

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
      user={user}
      clientAccount={clientAccount}
      session={session}
      userSettings={userSettings}
      hasProject={projects && projects.length > 0}
      activeProject={activeProject}
      connectedServices={connectedServices}
    />
  )
}
