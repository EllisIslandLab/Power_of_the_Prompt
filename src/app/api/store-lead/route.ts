import { NextRequest, NextResponse } from 'next/server'
import { getAirtableBase } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const { url, email, name, quickScore, sessionId } = await request.json()
    
    if (!url || !email || !quickScore || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    
    const base = getAirtableBase()
    
    // Check if lead already exists to prevent duplicates
    const existingRecords = await base('Website Analyzer Leads').select({
      filterByFormula: `AND({Email} = '${email}', {URL Tested} = '${url}')`,
      maxRecords: 1
    }).firstPage()
    
    if (existingRecords.length > 0) {
      // Update existing record
      const recordId = existingRecords[0].id
      await base('Website Analyzer Leads').update([
        {
          id: recordId,
          fields: {
            'Quick Score': quickScore,
            'Session ID': sessionId,
            'Last Updated': new Date().toISOString(),
            'Test Count': (existingRecords[0].fields['Test Count'] as number || 0) + 1
          }
        }
      ])
      
      return NextResponse.json({ 
        success: true, 
        message: 'Lead updated successfully',
        recordId 
      })
    } else {
      // Create new lead record
      const record = await base('Website Analyzer Leads').create([
        {
          fields: {
            'Email': email,
            'Name': name || '',
            'URL Tested': url,
            'Quick Score': quickScore,
            'Session ID': sessionId,
            'Test Date': new Date().toISOString(),
            'Lead Source': 'Website Analyzer',
            'Status': 'New',
            'Test Count': 1,
            'Follow Up Status': 'Pending',
            'Notes': `Initial website analysis for ${url}. Score: ${quickScore}/100`
          }
        }
      ])
      
      return NextResponse.json({ 
        success: true, 
        message: 'Lead stored successfully',
        recordId: record[0].id 
      })
    }
  } catch (error) {
    console.error('Airtable storage error:', error)
    
    // Check if it's an Airtable configuration error
    if (error instanceof Error && error.message.includes('Airtable configuration missing')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }
    
    // Check if it's an Airtable API error
    if (error instanceof Error && error.message.includes('NOT_FOUND')) {
      return NextResponse.json(
        { error: 'Database table not found. Please contact support.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to store lead information' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve lead information (for admin use)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const sessionId = searchParams.get('sessionId')
    
    if (!email && !sessionId) {
      return NextResponse.json({ error: 'Email or sessionId required' }, { status: 400 })
    }
    
    const base = getAirtableBase()
    let filterFormula = ''
    
    if (email) {
      filterFormula = `{Email} = '${email}'`
    } else if (sessionId) {
      filterFormula = `{Session ID} = '${sessionId}'`
    }
    
    const records = await base('Website Analyzer Leads').select({
      filterByFormula: filterFormula,
      sort: [{ field: 'Test Date', direction: 'desc' }],
      maxRecords: 10
    }).firstPage()
    
    const leads = records.map(record => ({
      id: record.id,
      email: record.fields['Email'],
      name: record.fields['Name'],
      urlTested: record.fields['URL Tested'],
      quickScore: record.fields['Quick Score'],
      testDate: record.fields['Test Date'],
      leadSource: record.fields['Lead Source'],
      status: record.fields['Status'],
      testCount: record.fields['Test Count'],
      followUpStatus: record.fields['Follow Up Status'],
      notes: record.fields['Notes']
    }))
    
    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Lead retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve lead information' },
      { status: 500 }
    )
  }
}