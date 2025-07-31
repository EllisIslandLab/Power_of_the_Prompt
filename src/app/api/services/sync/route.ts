import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'
import Stripe from 'stripe'
import { Service, AirtableService, SyncResponse } from '@/types/services'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!)

export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization (you should implement proper auth)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' }, 
        { status: 401 }
      )
    }

    const { action, serviceId } = await request.json()

    let syncResult: SyncResponse

    switch (action) {
      case 'sync_all':
        syncResult = await syncAllServices()
        break
      case 'sync_service':
        if (!serviceId) {
          return NextResponse.json(
            { error: 'Service ID required for single service sync' },
            { status: 400 }
          )
        }
        syncResult = await syncSingleService(serviceId)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "sync_all" or "sync_service"' },
          { status: 400 }
        )
    }

    return NextResponse.json(syncResult)

  } catch (error) {
    console.error('Sync API Error:', error)
    
    const response: SyncResponse = {
      success: false,
      data: {
        synced_products: 0,
        synced_prices: 0,
        errors: [(error as Error).message]
      },
      error: 'Failed to sync services with Stripe'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

async function syncAllServices(): Promise<SyncResponse> {
  const errors: string[] = []
  let syncedProducts = 0
  let syncedPrices = 0

  try {
    // Fetch all active services from Airtable
    const records = await base('Services').select({
      filterByFormula: '{Is Active} = TRUE()',
      sort: [{ field: 'Order', direction: 'asc' }]
    }).all()

    for (const record of records) {
      try {
        const result = await syncServiceToStripe(record as AirtableService)
        if (result.productSynced) syncedProducts++
        if (result.priceSynced) syncedPrices++
        if (result.errors.length > 0) {
          errors.push(...result.errors)
        }
      } catch (error) {
        errors.push(`Failed to sync service ${record.id}: ${(error as Error).message}`)
      }
    }

    return {
      success: errors.length === 0,
      data: {
        synced_products: syncedProducts,
        synced_prices: syncedPrices,
        errors
      }
    }

  } catch (error) {
    return {
      success: false,
      data: {
        synced_products: syncedProducts,
        synced_prices: syncedPrices,
        errors: [error as string]
      },
      error: 'Failed to fetch services from Airtable'
    }
  }
}

async function syncSingleService(serviceId: string): Promise<SyncResponse> {
  try {
    const record = await base('Services').find(serviceId)
    const result = await syncServiceToStripe(record as AirtableService)

    return {
      success: result.errors.length === 0,
      data: {
        synced_products: result.productSynced ? 1 : 0,
        synced_prices: result.priceSynced ? 1 : 0,
        errors: result.errors
      }
    }
  } catch (error) {
    return {
      success: false,
      data: {
        synced_products: 0,
        synced_prices: 0,
        errors: [(error as Error).message]
      },
      error: 'Failed to sync service'
    }
  }
}

async function syncServiceToStripe(record: AirtableService): Promise<{
  productSynced: boolean
  priceSynced: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let productSynced = false
  let priceSynced = false

  const fields = record.fields
  
  if (!fields['Service Name'] || !fields['Price']) {
    errors.push('Service missing required fields')
    return { productSynced, priceSynced, errors }
  }

  try {
    // Create or update Stripe product
    let stripeProduct
    const existingProductId = fields['Stripe Product ID']

    if (existingProductId) {
      try {
        // Update existing product
        stripeProduct = await stripe.products.update(existingProductId, {
          name: fields['Service Name'],
          description: fields['Description'] || '',
          active: fields['Is Active'] || false,
          metadata: {
            airtable_record_id: record.id,
            service_type: fields['Service Type'] || '',
            category: fields['Category'] || ''
          }
        })
        productSynced = true
      } catch (error) {
        // Product doesn't exist, create new one
        stripeProduct = await stripe.products.create({
          name: fields['Service Name'],
          description: fields['Description'] || '',
          active: fields['Is Active'] || false,
          metadata: {
            airtable_record_id: record.id,
            service_type: fields['Service Type'] || '',
            category: fields['Category'] || ''
          }
        })
        productSynced = true
      }
    } else {
      // Create new product
      stripeProduct = await stripe.products.create({
        name: fields['Service Name'],
        description: fields['Description'] || '',
        active: fields['Is Active'] || false,
        metadata: {
          airtable_record_id: record.id,
          service_type: fields['Service Type'] || '',
          category: fields['Category'] || ''
        }
      })
      productSynced = true
    }

    // Create or update Stripe price
    let stripePrice
    const existingPriceId = fields['Stripe Price ID']
    const priceInCents = Math.round(fields['Price'] * 100)

    if (existingPriceId) {
      try {
        // Check if existing price needs update
        const existingPrice = await stripe.prices.retrieve(existingPriceId)
        
        if (existingPrice.unit_amount !== priceInCents || existingPrice.product !== stripeProduct.id) {
          // Deactivate old price and create new one
          await stripe.prices.update(existingPriceId, { active: false })
          
          stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: priceInCents,
            currency: 'usd',
            metadata: {
              airtable_record_id: record.id
            }
          })
          priceSynced = true
        } else {
          stripePrice = existingPrice
          priceSynced = true
        }
      } catch (error) {
        // Price doesn't exist, create new one
        stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: priceInCents,
          currency: 'usd',
          metadata: {
            airtable_record_id: record.id
          }
        })
        priceSynced = true
      }
    } else {
      // Create new price
      stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: priceInCents,
        currency: 'usd',
        metadata: {
          airtable_record_id: record.id
        }
      })
      priceSynced = true
    }

    // Update Airtable with Stripe IDs
    const updateFields: any = {}
    
    if (!fields['Stripe Product ID'] || fields['Stripe Product ID'] !== stripeProduct.id) {
      updateFields['Stripe Product ID'] = stripeProduct.id
    }
    
    if (!fields['Stripe Price ID'] || fields['Stripe Price ID'] !== stripePrice.id) {
      updateFields['Stripe Price ID'] = stripePrice.id
    }

    updateFields['Updated At'] = new Date().toISOString()

    if (Object.keys(updateFields).length > 0) {
      await base('Services').update(record.id, updateFields)
    }

  } catch (error) {
    errors.push(`Stripe sync error for ${fields['Service Name']}: ${(error as Error).message}`)
  }

  return { productSynced, priceSynced, errors }
}