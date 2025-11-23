import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true) // Use service role

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('c')
    const email = searchParams.get('e')
    const url = searchParams.get('url')

    if (!email || !url) {
      // Redirect to homepage if missing parameters
      return NextResponse.redirect(new URL('/', request.url))
    }

    const decodedEmail = decodeURIComponent(email)
    const decodedUrl = decodeURIComponent(url)

    // Update campaign_sends table if this is from a campaign
    if (campaignId) {
      const { data: updated } = await supabase
        .from('campaign_sends' as any)
        .update({
          clicked_at: new Date().toISOString()
        })
        .eq('campaign_id', campaignId)
        .eq('recipient_email', decodedEmail)
        .is('clicked_at', null) // Only update if not already clicked
        .select()

      // If this was a first-time click, increment campaign clicked_count
      if (updated && updated.length > 0) {
        await supabase.rpc('increment_campaign_clicks', {
          campaign_id: campaignId
        })
      }
    }

    // Update leads table engagement tracking
    await supabase
      .from('leads' as any)
      .update({
        last_engagement: new Date().toISOString()
      })
      .eq('email', decodedEmail)

    // Redirect to the actual URL
    return NextResponse.redirect(decodedUrl)

  } catch (error) {
    console.error('Click tracking error:', error)

    // Try to redirect to URL even if tracking fails
    const url = request.nextUrl.searchParams.get('url')
    if (url) {
      return NextResponse.redirect(decodeURIComponent(url))
    }

    return NextResponse.redirect(new URL('/', request.url))
  }
}
