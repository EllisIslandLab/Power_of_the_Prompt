import { NextRequest, NextResponse } from 'next/server'
import { getAirtableBase } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    if (!process.env.AIRTABLE_API_KEY) {
      return NextResponse.json({ 
        error: 'AIRTABLE_API_KEY not configured',
        env_check: {
          AIRTABLE_API_KEY: !!process.env.AIRTABLE_API_KEY,
          AIRTABLE_BASE_ID: !!process.env.AIRTABLE_BASE_ID
        }
      }, { status: 500 })
    }

    if (!process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json({ 
        error: 'AIRTABLE_BASE_ID not configured',
        env_check: {
          AIRTABLE_API_KEY: !!process.env.AIRTABLE_API_KEY,
          AIRTABLE_BASE_ID: !!process.env.AIRTABLE_BASE_ID
        }
      }, { status: 500 })
    }

    // Try to list tables/records
    try {
      // Try to access the 'Consultations' table  
      const base = getAirtableBase()
      const records = await base('Consultations').select({
        maxRecords: 3,
        view: 'Grid view' // Default view name
      }).firstPage()

      return NextResponse.json({
        success: true,
        message: 'Airtable connection successful',
        tableInfo: {
          tableName: 'Consultations',
          recordCount: records.length,
          sampleRecord: records.length > 0 ? {
            id: records[0].id,
            fields: Object.keys(records[0].fields)
          } : null
        }
      })

    } catch (tableError) {
      // Table might not exist or have different name
      return NextResponse.json({
        error: 'Airtable table access failed',
        details: (tableError as Error)?.message,
        suggestions: [
          'Check if "Consultations" table exists in your Airtable base',
          'Verify table permissions',
          'Check field names match expected structure'
        ]
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({
      error: 'Airtable connection failed',
      details: (error as Error)?.message,
      env_check: {
        AIRTABLE_API_KEY: !!process.env.AIRTABLE_API_KEY,
        AIRTABLE_BASE_ID: !!process.env.AIRTABLE_BASE_ID
      }
    }, { status: 500 })
  }
}