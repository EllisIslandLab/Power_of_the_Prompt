import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getAirtableBase } from '@/lib/airtable'

const supabase = getSupabase(true) // Use service role

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const status = searchParams.get('status') || 'active'
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('leads')
      .select('*')
      .eq('status', status)
      .order('signup_date', { ascending: false })
      .limit(limit)

    if (source) {
      query = query.eq('source', source)
    }

    const { data: leads, error } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      leads: leads || [],
      count: leads?.length || 0
    })

  } catch (error) {
    console.error('Leads API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'migrate_from_airtable') {
      return await migrateFromAirtable()
    }

    if (action === 'add_lead') {
      return await addLead(body)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Leads POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function migrateFromAirtable() {
  try {
    const base = getAirtableBase()

    // Fetch all leads from Airtable
    const records = await base('Website Analyzer Leads').select({
      maxRecords: 1000,
      sort: [{ field: 'Test Date', direction: 'desc' }]
    }).all()

    let migratedCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const record of records) {
      try {
        const fields = record.fields
        const email = fields['Email'] as string
        const name = fields['Name'] as string
        const testDate = fields['Test Date'] as string

        if (!email) continue

        // Check if lead already exists
        const { data: existingLead } = await supabase
          .from('leads')
          .select('id')
          .eq('email', email.toLowerCase())
          .single()

        if (existingLead) {
          continue // Skip if already exists
        }

        // Insert new lead
        const { error: insertError } = await supabase
          .from('leads')
          .insert({
            email: email.toLowerCase(),
            name: name || null,
            source: 'website_analyzer',
            status: 'active',
            tags: ['website_analyzer'],
            custom_fields: {
              quick_score: fields['Quick Score'] ? Number(fields['Quick Score']) : null,
              url_tested: fields['URL Tested'] ? String(fields['URL Tested']) : null,
              test_count: fields['Test Count'] ? Number(fields['Test Count']) : null,
              airtable_id: String(record.id)
            },
            signup_date: testDate ? new Date(testDate).toISOString() : new Date().toISOString()
          })

        if (insertError) {
          errorCount++
          errors.push(`${email}: ${insertError.message}`)
        } else {
          migratedCount++
        }

      } catch (error) {
        errorCount++
        errors.push(`Record ${record.id}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed: ${migratedCount} leads migrated, ${errorCount} errors`,
      migratedCount,
      errorCount,
      errors: errors.slice(0, 10) // Limit error details
    })

  } catch (error) {
    console.error('Airtable migration error:', error)
    return NextResponse.json(
      { error: 'Failed to migrate from Airtable' },
      { status: 500 }
    )
  }
}

async function addLead(body: any) {
  try {
    const { email, name, source, tags, customFields } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead with this email already exists' },
        { status: 400 }
      )
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        email: email.toLowerCase(),
        name: name || null,
        source: source || 'manual',
        status: 'active',
        tags: tags || [],
        custom_fields: customFields || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding lead:', error)
      return NextResponse.json(
        { error: 'Failed to add lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      lead
    })

  } catch (error) {
    console.error('Add lead error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}