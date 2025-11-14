import { redirect } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { FormContainer } from '@/components/builder/FormContainer'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    sessionId: string
  }>
}

async function getSession(sessionId: string) {
  const supabase = getSupabase(true)

  const { data: session, error } = await supabase
    // @ts-expect-error - demo_sessions table exists but not in generated types yet
    .from('demo_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error || !session) {
    return null
  }

  return session
}

export default async function BuilderPage({ params }: PageProps) {
  const { sessionId } = await params
  const session = await getSession(sessionId)

  if (!session) {
    // Session not found, redirect to start
    redirect('/get-started/build')
  }

  return (
    <FormContainer
      sessionId={session.id}
      builderType={session.builder_type}
    />
  )
}
