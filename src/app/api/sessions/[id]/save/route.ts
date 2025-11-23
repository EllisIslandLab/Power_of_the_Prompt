import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { currentStep, formData } = await req.json()

    const supabase = getSupabase(true)

    // Update the session
    const { error } = await supabase
      // @ts-expect-error - demo_projects table exists but not in generated types yet
      .from('demo_projects')
      .update({
        current_step: currentStep,
        form_data: formData,
        user_email: formData.email || '',
        business_name: formData.businessName || '',
        last_activity: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error saving session:', error)
      throw error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error saving session:', error)
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    )
  }
}
