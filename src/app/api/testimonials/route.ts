import { NextRequest, NextResponse } from 'next/server'
import { getAirtableBase } from '@/lib/airtable'

export async function GET() {
  try {
    const base = getAirtableBase()
    
    // Fetch approved testimonials with arrangement order (Arrangement > 0 means it should be displayed)
    const records = await base('Testimonial Submissions').select({
      filterByFormula: `AND({Arrangement} > 0, {Status} = 'Approved')`,
      sort: [{ field: 'Arrangement', direction: 'asc' }], // Sort by arrangement order (1, 2, 3, etc.)
      maxRecords: 100 // Allow more testimonials for pagination
    }).firstPage()

    const testimonials = records.map(record => ({
      id: record.id,
      name: record.fields['Name'] as string,
      testimonial: record.fields['Testimonial'] as string,
      title: record.fields['Title/Role'] as string || 'Customer',
      avatar: record.fields['Avatar'] as string || '😊',
      email: record.fields['Email'] as string,
      submittedDate: record.fields['Submitted Date'] as string,
      updatedDate: record.fields['Updated Date'] as string,
      arrangement: record.fields['Arrangement'] as number || 0,
    }))

    return NextResponse.json({
      success: true,
      testimonials: testimonials
    })

  } catch (error) {
    console.error('Error fetching testimonials:', error)
    
    // Check if it's an Airtable table not found error
    if ((error as Error).message?.includes('Could not find table') || 
        (error as Error).message?.includes('NOT_FOUND')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Testimonials not yet configured.',
          testimonials: []
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch testimonials',
        testimonials: [],
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}