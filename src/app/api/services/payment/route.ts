import { NextRequest, NextResponse } from 'next/server'
import { PaymentIntent, PaymentResponse, Service } from '@/types/services'
import { calculateServicePrice } from '@/lib/pricing'
import { getStripe } from '@/lib/stripe'
import { getAirtableBase } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const paymentData: PaymentIntent = await request.json()
    
    // Validate required fields
    if (!paymentData.service_id || !paymentData.amount || !paymentData.customer_email) {
      const response: PaymentResponse = {
        success: false,
        data: { client_secret: '', payment_intent_id: '' },
        error: 'Missing required fields: service_id, amount, customer_email'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Fetch service from Airtable to validate
    let service: Service
    try {
      const base = getAirtableBase()
      const record = await base('Services').find(paymentData.service_id)
      const fields = record.fields as any
      
      service = {
        id: record.id,
        service_name: fields['Service Name'],
        service_type: mapServiceType(fields['Service Type']),
        price: fields['Price'],
        description: fields['Description'] || '',
        duration_estimate: fields['Duration Estimate'] || '',
        is_active: fields['Is Active'] || false,
        stripe_price_id: fields['Stripe Price ID'] || '',
        stripe_product_id: fields['Stripe Product ID'] || '',
        features: [],
        category: fields['Category'] || '',
        order: fields['Order'] || 999,
        created_at: fields['Created At'] || '',
        updated_at: fields['Updated At'] || '',
        // Discount fields
        sale_price: fields['Sale Price'] || undefined,
        discount_percentage: fields['Discount Percentage'] || undefined,
        discount_amount: fields['Discount Amount'] || undefined,
        sale_start_date: fields['Sale Start Date'] || undefined,
        sale_end_date: fields['Sale End Date'] || undefined,
        coupon_code: fields['Coupon Code'] || undefined
      }

      // Validate service is active
      if (!service.is_active) {
        const response: PaymentResponse = {
          success: false,
          data: { client_secret: '', payment_intent_id: '' },
          error: 'Service is not currently available'
        }
        return NextResponse.json(response, { status: 400 })
      }

      // Calculate actual price (including discounts)
      const pricing = calculateServicePrice(service, paymentData.metadata?.coupon_code)
      const expectedAmount = Math.round(pricing.finalPrice * 100) // Convert to cents
      
      if (paymentData.amount !== expectedAmount) {
        const response: PaymentResponse = {
          success: false,
          data: { client_secret: '', payment_intent_id: '' },
          error: `Payment amount (${paymentData.amount}¢) does not match calculated price (${expectedAmount}¢)`
        }
        return NextResponse.json(response, { status: 400 })
      }

    } catch (error) {
      const response: PaymentResponse = {
        success: false,
        data: { client_secret: '', payment_intent_id: '' },
        error: 'Service not found'
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Create Stripe customer if needed
    let customer
    try {
      const stripe = getStripe()
      const customers = await stripe.customers.list({
        email: paymentData.customer_email,
        limit: 1
      })

      if (customers.data.length > 0) {
        customer = customers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: paymentData.customer_email,
          name: paymentData.customer_name,
          metadata: {
            service_purchases: '1'
          }
        })
      }
    } catch (error) {
      console.error('Error creating/finding customer:', error)
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentData.amount,
      currency: paymentData.currency || 'usd',
      customer: customer?.id,
      metadata: {
        service_id: paymentData.service_id,
        service_name: service.service_name,
        service_type: service.service_type,
        customer_email: paymentData.customer_email,
        customer_name: paymentData.customer_name || '',
        ...paymentData.metadata
      },
      receipt_email: paymentData.customer_email,
      description: `${service.service_name} - ${service.service_type}`,
      automatic_payment_methods: {
        enabled: true
      }
    })

    // Store purchase record in Airtable (Purchases table)
    try {
      const base = getAirtableBase()
      await base('Purchases').create([{
        fields: {
          'Service ID': paymentData.service_id,
          'Service Name': service.service_name,
          'Customer Email': paymentData.customer_email,
          'Customer Name': paymentData.customer_name || '',
          'Amount': paymentData.amount / 100, // Convert back to dollars
          'Payment Status': 'pending',
          'Stripe Payment Intent ID': paymentIntent.id,
          'Purchased At': new Date().toISOString(),
          'Service Type': service.service_type,
          'Metadata': JSON.stringify(paymentData.metadata || {})
        }
      }])
    } catch (error) {
      console.error('Failed to create purchase record:', error)
      // Continue anyway - payment intent was created successfully
    }

    const response: PaymentResponse = {
      success: true,
      data: {
        client_secret: paymentIntent.client_secret!,
        payment_intent_id: paymentIntent.id
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Payment API Error:', error)
    
    const response: PaymentResponse = {
      success: false,
      data: { client_secret: '', payment_intent_id: '' },
      error: 'Failed to create payment intent'
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