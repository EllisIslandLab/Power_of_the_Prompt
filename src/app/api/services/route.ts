import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'
import { Service, AirtableService, ServicesResponse } from '@/types/services'

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceType = searchParams.get('type')
    const activeOnly = searchParams.get('active') !== 'false' // Default to true

    // Build filter formula
    let filterFormula = ''
    const filters: string[] = []

    if (activeOnly) {
      filters.push('{Is Active} = TRUE()')
    }

    if (serviceType) {
      const typeMap = {
        'course': 'Course',
        'build': 'Build', 
        'audit': 'Audit',
        'consultation': 'Consultation'
      }
      const airtableType = typeMap[serviceType as keyof typeof typeMap]
      if (airtableType) {
        filters.push(`{Service Type} = '${airtableType}'`)
      }
    }

    if (filters.length > 0) {
      filterFormula = `AND(${filters.join(', ')})`
    }

    // Fetch records from Airtable
    const records = await base('Services').select({
      view: 'Grid view',
      sort: [{ field: 'Order', direction: 'asc' }],
      ...(filterFormula && { filterByFormula: filterFormula })
    }).all()

    // Transform Airtable records to Service objects
    const services = records
      .map((record) => {
        const airtableRecord = record as unknown as AirtableService
        const fields = airtableRecord.fields
        
        // Skip records without required fields
        if (!fields['Service Name'] || !fields['Service Type'] || fields['Price'] === undefined) {
          return null
        }

        return {
          id: airtableRecord.id,
          service_name: fields['Service Name'],
          service_type: mapServiceType(fields['Service Type']),
          price: fields['Price'],
          description: fields['Description'] || '',
          duration_estimate: fields['Duration Estimate'] || '',
          is_active: fields['Is Active'] || false,
          stripe_price_id: fields['Stripe Price ID'] || '',
          stripe_product_id: fields['Stripe Product ID'] || '',
          features: Array.isArray(fields['Features']) 
            ? fields['Features'] 
            : (fields['Features'] ? (fields['Features'] as string).split(',').map(f => f.trim()) : []),
          category: fields['Category'] || 'General',
          subcategory: fields['Subcategory'] || undefined,
          order: fields['Order'] || 999,
          created_at: fields['Created At'] || new Date().toISOString(),
          updated_at: fields['Updated At'] || new Date().toISOString(),
          // Discount fields
          sale_price: fields['Sale Price'] || undefined,
          discount_percentage: fields['Discount Percentage'] || undefined,
          discount_amount: fields['Discount Amount'] || undefined,
          sale_start_date: fields['Sale Start Date'] || undefined,
          sale_end_date: fields['Sale End Date'] || undefined,
          coupon_code: fields['Coupon Code'] || undefined
        }
      })
      .filter((service): service is Service => service !== null)
      .sort((a, b) => a.order - b.order)

    const response: ServicesResponse = {
      success: true,
      data: services
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=59'
      }
    })

  } catch (error) {
    console.error('Services API Error:', error)
    
    const response: ServicesResponse = {
      success: false,
      data: [],
      error: 'Failed to fetch services'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

function mapServiceType(airtableType: string): 'course' | 'build' | 'audit' | 'consultation' {
  const typeMap = {
    'Course': 'course',
    'Build': 'build',
    'Audit': 'audit', 
    'Consultation': 'consultation'
  } as const

  return typeMap[airtableType as keyof typeof typeMap] || 'consultation'
}