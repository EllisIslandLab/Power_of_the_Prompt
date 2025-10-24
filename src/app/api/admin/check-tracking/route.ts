import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true)

export async function GET() {
  try {
    // Test if the increment function exists by trying to call it with a test ID
    const testCampaignId = '00000000-0000-0000-0000-000000000000'

    const { data, error } = await supabase.rpc('increment_campaign_opens', {
      campaign_id: testCampaignId
    })

    if (error) {
      return NextResponse.json({
        success: false,
        functionExists: false,
        error: error.message,
        hint: 'The increment_campaign_opens function might not exist in your database. You may need to run the migration: supabase/migrations/20251022000001_add_email_tracking_functions.sql'
      })
    }

    return NextResponse.json({
      success: true,
      functionExists: true,
      message: 'Email tracking functions are properly configured'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
