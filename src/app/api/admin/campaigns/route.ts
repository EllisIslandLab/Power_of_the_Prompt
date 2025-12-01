import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true) // Use service role

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('campaigns' as any)
      .select(`
        *,
        campaign_sends(count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status && ['draft', 'sending', 'sent', 'failed'].includes(status)) {
      query = query.eq('status', status as 'draft' | 'sending' | 'sent' | 'failed')
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || []
    })

  } catch (error) {
    console.error('Campaigns API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, content, targetAudience, scheduledAt, createdBy } = body

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    // Get recipient count based on target audience
    const recipientCount = await getRecipientCount(targetAudience)

    const campaignStatus: 'draft' | 'sending' | 'sent' | 'failed' = 'draft'

    const { data: campaign, error } = await supabase
      .from('campaigns' as any)
      .insert({
        subject,
        content,
        target_audience: targetAudience || {},
        recipient_count: recipientCount,
        scheduled_at: scheduledAt || null,
        created_by: createdBy || 'admin',
        status: campaignStatus
      })
      .select()
      .single() as any

    if (error) {
      console.error('Error creating campaign:', error)
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, subject, content, targetAudience, scheduledAt } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Check if campaign is in draft status
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns' as any)
      .select('status')
      .eq('id', id)
      .single() as any

    if (fetchError || !existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (existingCampaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft campaigns can be edited' },
        { status: 400 }
      )
    }

    // Get updated recipient count
    const recipientCount = targetAudience ? await getRecipientCount(targetAudience) : undefined

    const updateData: any = {}
    if (subject !== undefined) updateData.subject = subject
    if (content !== undefined) updateData.content = content
    if (targetAudience !== undefined) {
      updateData.target_audience = targetAudience
      updateData.recipient_count = recipientCount
    }
    if (scheduledAt !== undefined) updateData.scheduled_at = scheduledAt

    const { data: campaign, error } = await supabase
      .from('campaigns' as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single() as any

    if (error) {
      console.error('Error updating campaign:', error)
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Update campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getRecipientCount(targetAudience: any): Promise<number> {
  try {
    // Handle manual recipients
    if (targetAudience?.source === 'manual' && targetAudience?.manualRecipients?.length > 0) {
      return targetAudience.manualRecipients.length
    }

    let query = supabase
      .from('leads' as any)
      .select('id', { count: 'exact', head: true })
      .eq('status', 'waitlist')

    // Apply filters based on target audience
    if (targetAudience?.source && targetAudience.source !== 'all') {
      query = query.eq('source', targetAudience.source)
    }

    if (targetAudience?.tags && targetAudience.tags.length > 0) {
      query = query.contains('tags', targetAudience.tags)
    }

    if (targetAudience?.dateRange) {
      const { start, end } = targetAudience.dateRange
      if (start) query = query.gte('signup_date', start)
      if (end) query = query.lte('signup_date', end)
    }

    const { count, error } = await query

    if (error) {
      console.error('Error counting recipients:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Recipient count error:', error)
    return 0
  }
}