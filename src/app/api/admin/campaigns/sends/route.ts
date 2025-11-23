import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true) // Use service role

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Fetch all sends for this campaign
    const { data: sends, error } = await supabase
      .from('campaign_sends' as any)
      .select('*')
      .eq('campaign_id', campaignId)
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaign sends:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaign sends' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sends: sends || []
    })

  } catch (error) {
    console.error('Campaign sends API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
