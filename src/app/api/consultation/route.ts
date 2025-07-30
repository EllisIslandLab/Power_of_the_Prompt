import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { fullName, email, phone } = body
    
    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: Name, Email, and Phone are required' },
        { status: 400 }
      )
    }

    // Prepare record for Airtable
    const record = {
      fields: {
        'Name': fullName,
        'Email': email,
        'Phone': phone,
        'Business Name': body.businessName || 'None provided',
        'Status': body.justSendInfo ? 'Email Only' : 'New'
      }
    }

    // Add booking type and submission timestamp
    if (body.bookingType) {
      const bookingTypeNote = body.bookingType === 'calendar' ? 'Calendar Booking' : 'Call Back Request'
      const notesArray = [`Booking Type: ${bookingTypeNote}`]
      
      if (body.submittedAt) {
        notesArray.push(`Submitted: ${body.submittedAt}`)
      }
      
      // Add website description for calendar bookings
      if (body.websiteDescription && body.bookingType === 'calendar') {
        notesArray.push(`Website Type: ${body.websiteDescription}`)
      }
      
      record.fields['Notes'] = notesArray.join(' | ')
    }

    // Add optional fields if they exist - mapping form values to Airtable dropdown values
    if (body.businessType) {
      // Use simpler mapping to match existing Airtable options
      const businessTypeMap = {
        'service': 'Service-based',
        'product': 'Product-based', 
        'nonprofit': 'Non-profit',
        'other': 'Other'
      }
      record.fields['Business Type'] = businessTypeMap[body.businessType] || 'Other'
    }
    
    if (body.currentWebsite) {
      record.fields['Current Website'] = body.currentWebsite
    }
    
    if (body.currentHost) {
      // Store in notes to be safe
      const hostMap = {
        'none': 'None',
        'squarespace': 'Squarespace',
        'wix': 'Wix',
        'wordpress': 'WordPress',
        'other': 'Other'
      }
      const readableHost = hostMap[body.currentHost] || body.currentHost
      
      const existingNotes = record.fields['Notes'] || ''
      record.fields['Notes'] = existingNotes + (existingNotes ? ' | ' : '') + `Current Host: ${readableHost}`
    }
    
    if (body.monthlyCosts) {
      // Store in notes - create mapping for readability
      const costsMap = {
        '0': '$0',
        '1-50': '$1-50',
        '51-100': '$51-100',
        '100+': '$100+',
        'not-sure': 'Not sure'
      }
      const readableCosts = costsMap[body.monthlyCosts] || body.monthlyCosts
      
      const existingNotes = record.fields['Notes'] || ''
      record.fields['Notes'] = existingNotes + (existingNotes ? ' | ' : '') + `Monthly Costs: ${readableCosts}`
    }
    
    if (body.whyInterested) {
      record.fields['Why Interested'] = body.whyInterested
    }
    
    if (body.biggestChallenge) {
      record.fields['Biggest Challenge'] = body.biggestChallenge
    }
    
    if (body.timeline) {
      const timelineMap = {
        'asap': 'ASAP',
        'this-week': 'This week', 
        'exploring': 'Just exploring'
      }
      record.fields['Timeline'] = timelineMap[body.timeline] || body.timeline
    }

    // Create record in Airtable
    const createdRecord = await base('Consultations').create([record])
    
    return NextResponse.json({
      success: true,
      message: 'Consultation request submitted successfully',
      recordId: createdRecord[0].id
    })

  } catch (error) {
    console.error('Airtable API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to submit consultation request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        config: process.env.NODE_ENV === 'development' ? {
          hasApiKey: !!process.env.AIRTABLE_API_KEY,
          hasBaseId: !!process.env.AIRTABLE_BASE_ID,
          baseId: process.env.AIRTABLE_BASE_ID,
          tableName: 'Consultations'
        } : undefined
      },
      { status: 500 }
    )
  }
}