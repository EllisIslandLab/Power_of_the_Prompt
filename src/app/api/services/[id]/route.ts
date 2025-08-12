import { NextRequest, NextResponse } from 'next/server'
import { Service, AirtableService, ServiceResponse } from '@/types/services'
import { getAirtableBase } from '@/lib/airtable'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      const response: ServiceResponse = {
        success: false,
        data: {} as Service,
        error: 'Service ID is required'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Fetch specific record from Airtable
    const base = getAirtableBase()
    const record = await base('Services').find(id)

    if (!record) {
      const response: ServiceResponse = {
        success: false,
        data: {} as Service,
        error: 'Service not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const airtableRecord = record as unknown as AirtableService
    const fields = airtableRecord.fields
    
    // Validate required fields
    if (!fields['Service Name'] || !fields['Service Type'] || fields['Price'] === undefined) {
      const response: ServiceResponse = {
        success: false,
        data: {} as Service,
        error: 'Service has missing required fields'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Transform to Service object
    const service: Service = {
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

    // Check if service is active (unless admin is viewing)
    const showInactive = request.nextUrl.searchParams.get('admin') === 'true'
    if (!service.is_active && !showInactive) {
      const response: ServiceResponse = {
        success: false,
        data: {} as Service,
        error: 'Service is not currently available'
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ServiceResponse = {
      success: true,
      data: service
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 's-maxage=600, stale-while-revalidate=59'
      }
    })

  } catch (error) {
    console.error('Service API Error:', error)
    
    const response: ServiceResponse = {
      success: false,
      data: {} as Service,
      error: 'Failed to fetch service'
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