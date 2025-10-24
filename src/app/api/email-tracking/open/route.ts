import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true) // Use service role

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('c')
    const email = searchParams.get('e')
    const source = searchParams.get('s') // 'waitlist', 'leads', etc.

    if (!email) {
      // Return a 1x1 transparent pixel even if tracking fails
      return new NextResponse(
        Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64'
        ),
        {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      )
    }

    const decodedEmail = decodeURIComponent(email)

    // Update campaign_sends table if this is from a campaign
    if (campaignId) {
      const { data: updated, error: updateError } = await supabase
        .from('campaign_sends')
        .update({
          opened_at: new Date().toISOString()
        })
        .eq('campaign_id', campaignId)
        .eq('recipient_email', decodedEmail)
        .is('opened_at', null) // Only update if not already opened
        .select()

      if (updateError) {
        console.error('Error updating campaign_sends:', updateError)
      } else {
        console.log(`Email opened: campaign=${campaignId}, email=${decodedEmail}, firstOpen=${updated && updated.length > 0}`)
      }

      // If this was a first-time open, increment campaign opened_count
      if (updated && updated.length > 0) {
        const { error: rpcError } = await supabase.rpc('increment_campaign_opens', {
          campaign_id: campaignId
        })

        if (rpcError) {
          console.error('Error incrementing campaign opens:', rpcError)
        } else {
          console.log(`Incremented opened_count for campaign ${campaignId}`)
        }
      }
    }

    // Update leads table engagement tracking
    if (source === 'waitlist' || !campaignId) {
      await supabase
        .from('leads')
        .update({
          last_engagement: new Date().toISOString()
        })
        .eq('email', decodedEmail)
        .eq('status', 'waitlist')
    }

    // Return 1x1 transparent pixel for email tracking
    return new NextResponse(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )

  } catch (error) {
    console.error('Email tracking error:', error)

    // Always return tracking pixel even if there's an error
    return new NextResponse(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  }
}