import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getAirtableBase } from '@/lib/airtable'

const supabase = getSupabase(true) // Use service role

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action !== 'migrate_airtable_leads') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    return await migrateFromAirtable()

  } catch (error) {
    console.error('Migration API error:', error)
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
    console.log('📡 Fetching leads from Airtable...')
    const records = await base('Website Analyzer Leads').select({
      maxRecords: 1000,
      sort: [{ field: 'Test Date', direction: 'desc' }]
    }).all()

    console.log(`📊 Found ${records.length} records in Airtable`)

    let migratedCount = 0
    let updatedCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const record of records) {
      try {
        const fields = record.fields
        const email = fields['Email'] as string
        const name = fields['Name'] as string
        const testDate = fields['Test Date'] as string
        const quickScore = fields['Quick Score'] as number
        const urlTested = fields['URL Tested'] as string
        const testCount = fields['Test Count'] as number
        const notes = fields['Notes'] as string

        if (!email) {
          console.log(`⚠️  Skipping record ${record.id} - no email`)
          continue
        }

        // Check if lead already exists
        const { data: existingLead, error: checkError } = await supabase
          .from('leads')
          .select('id, custom_fields')
          .eq('email', email.toLowerCase())
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new leads
          throw checkError
        }

        const leadData = {
          email: email.toLowerCase(),
          name: name || null,
          source: 'website_analyzer',
          status: 'interested' as const,
          tags: ['website_analyzer', 'migrated_from_airtable'],
          custom_fields: {
            quick_score: quickScore,
            url_tested: urlTested,
            test_count: testCount,
            airtable_id: record.id,
            airtable_notes: notes,
            migration_date: new Date().toISOString()
          },
          signup_date: testDate ? new Date(testDate).toISOString() : new Date().toISOString()
        }

        if (existingLead) {
          // Update existing lead with new data
          const existingFields = existingLead.custom_fields as Record<string, any> || {}
          const newFields = leadData.custom_fields as Record<string, any> || {}

          const updatedCustomFields = {
            ...existingFields,
            ...newFields,
            // Preserve existing data but add migration info
            last_airtable_sync: new Date().toISOString()
          }

          const { error: updateError } = await supabase
            .from('leads')
            .update({
              custom_fields: updatedCustomFields,
              tags: leadData.tags, // Update tags to include migration tag
              updated_at: new Date().toISOString()
            })
            .eq('id', existingLead.id)

          if (updateError) {
            throw updateError
          }

          updatedCount++
          console.log(`🔄 Updated existing lead: ${email}`)
        } else {
          // Insert new lead
          const { error: insertError } = await supabase
            .from('leads')
            .insert(leadData)

          if (insertError) {
            throw insertError
          }

          migratedCount++
          console.log(`✅ Migrated new lead: ${email}`)
        }

      } catch (error) {
        errorCount++
        const errorMsg = `Record ${record.id} (${record.fields['Email'] || 'no email'}): ${error}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    const summary = {
      success: true,
      message: `Migration completed: ${migratedCount} new leads migrated, ${updatedCount} existing leads updated, ${errorCount} errors`,
      stats: {
        totalProcessed: records.length,
        migratedCount,
        updatedCount,
        errorCount,
        successRate: ((migratedCount + updatedCount) / records.length * 100).toFixed(1)
      },
      errors: errors.slice(0, 20) // Limit error details to first 20
    }

    console.log('🎉 Migration Summary:', summary)

    return NextResponse.json(summary)

  } catch (error) {
    console.error('❌ Airtable migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to migrate from Airtable',
      details: 'Check server logs for more information'
    }, { status: 500 })
  }
}