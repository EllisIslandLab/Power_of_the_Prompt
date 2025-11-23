import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true) // Use service role

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('id')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Delete campaign sends first (foreign key constraint)
    const { error: sendsError } = await supabase
      .from('campaign_sends' as any)
      .delete()
      .eq('campaign_id', campaignId)

    if (sendsError) {
      console.error('Error deleting campaign sends:', sendsError)
      return NextResponse.json(
        { error: 'Failed to delete campaign sends' },
        { status: 500 }
      )
    }

    // Delete the campaign
    const { error: campaignError } = await supabase
      .from('campaigns' as any)
      .delete()
      .eq('id', campaignId)

    if (campaignError) {
      console.error('Error deleting campaign:', campaignError)
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })

  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
