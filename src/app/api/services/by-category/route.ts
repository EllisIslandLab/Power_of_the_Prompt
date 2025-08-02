import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'
import { Service, AirtableService } from '@/types/services'

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') !== 'false'

    // Build filter formula
    let filterFormula = ''
    if (activeOnly) {
      filterFormula = '{Is Active} = TRUE()'
    }

    // Fetch all active services
    const records = await base('Services').select({
      view: 'Grid view',
      sort: [
        { field: 'Category', direction: 'asc' },
        { field: 'Order', direction: 'asc' }
      ],
      ...(filterFormula && { filterByFormula: filterFormula })
    }).all()

    // Transform and group by category
    const servicesByCategory: Record<string, Service[]> = {}

    records.forEach((record: AirtableService) => {
      const fields = record.fields
      
      // Skip records without required fields
      if (!fields['Service Name'] || !fields['Service Type'] || fields['Price'] === undefined) {
        return
      }

      const service: Service = {
        id: record.id,
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
          : (fields['Features'] ? fields['Features'].split(',').map(f => f.trim()) : []),
        category: fields['Category'] || 'General',
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

      const category = service.category
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = []
      }
      servicesByCategory[category].push(service)
    })

    // Sort services within each category by order
    Object.keys(servicesByCategory).forEach(category => {
      servicesByCategory[category].sort((a, b) => a.order - b.order)
    })

    // Get categories list
    const categories = Object.keys(servicesByCategory).sort()

    return NextResponse.json({
      success: true,
      data: {
        categories: categories,
        servicesByCategory: servicesByCategory,
        totalServices: records.length
      }
    }, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=59'
      }
    })

  } catch (error) {
    console.error('Services by Category API Error:', error)
    
    return NextResponse.json({
      success: false,
      data: {
        categories: [],
        servicesByCategory: {},
        totalServices: 0
      },
      error: 'Failed to fetch services by category'
    }, { status: 500 })
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