import { redirect } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { FormContainer } from '@/components/builder/FormContainer'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    sessionId: string
  }>
  searchParams: Promise<{
    paid?: string
  }>
}

async function getSession(sessionId: string) {
  const supabase = getSupabase(true)

  const { data: session, error } = await supabase
    .from('demo_projects')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error || !session) {
    return null
  }

  return session
}

async function markAsPaid(sessionId: string) {
  const supabase = getSupabase(true)

  await supabase
    .from('demo_projects')
    .update({
      entry_fee_paid: true,
      status: 'building'
    })
    .eq('id', sessionId)
}

export default async function BuilderPage({ params, searchParams }: PageProps) {
  const { sessionId } = await params
  const { paid } = await searchParams

  // If returning from successful payment, mark as paid
  if (paid === 'true') {
    await markAsPaid(sessionId)
  }

  const session = await getSession(sessionId)

  if (!session) {
    // Session not found, redirect to start
    redirect('/get-started')
  }

  // Check if session has paid or has valid promo code
  if (!(session as any).entry_fee_paid) {
    // Not paid, redirect to start
    redirect('/get-started')
  }

  return (
    <FormContainer
      sessionId={(session as any).id}
      initialData={{
        businessName: (session as any).business_name,
        tagline: (session as any).tagline,
        primaryService: (session as any).primary_service,
        targetAudience: (session as any).target_audience,
        numSections: (session as any).num_sections,
        colorPalette: (session as any).color_palette,
        categoryId: (session as any).category_id,
        subcategoryId: (session as any).subcategory_id,
        customCategory: (session as any).custom_category,
        previewHtml: (session as any).preview_html
      }}
    />
  )
}
