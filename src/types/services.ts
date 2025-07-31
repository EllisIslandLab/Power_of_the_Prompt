// Types for the new Services architecture

export interface Service {
  id: string
  service_name: string
  service_type: 'course' | 'build' | 'audit' | 'consultation'
  price: number
  description: string
  duration_estimate: string
  is_active: boolean
  stripe_price_id: string
  stripe_product_id?: string
  features: string[]
  category: string
  order: number
  created_at: string
  updated_at: string
  // Discount fields
  sale_price?: number
  discount_percentage?: number
  discount_amount?: number
  sale_start_date?: string
  sale_end_date?: string
  coupon_code?: string
}

export interface AirtableService {
  id: string
  fields: {
    'Service Name': string
    'Service Type': 'Course' | 'Build' | 'Audit' | 'Consultation'
    'Price': number
    'Description': string
    'Duration Estimate': string
    'Is Active': boolean
    'Stripe Price ID': string
    'Stripe Product ID'?: string
    'Features': string[]
    'Category': string
    'Order': number
    'Created At': string
    'Updated At': string
    // Discount fields
    'Sale Price'?: number
    'Discount Percentage'?: number
    'Discount Amount'?: number
    'Sale Start Date'?: string
    'Sale End Date'?: string
    'Coupon Code'?: string
  }
}

export interface StripeProduct {
  id: string
  name: string
  description?: string
  active: boolean
  metadata: {
    airtable_record_id?: string
    service_type?: string
  }
}

export interface StripePrice {
  id: string
  product: string
  unit_amount: number
  currency: string
  active: boolean
  metadata: {
    airtable_record_id?: string
  }
}

export interface PaymentIntent {
  service_id: string
  service_name: string
  amount: number
  currency: string
  customer_email?: string
  customer_name?: string
  metadata?: Record<string, string>
}

export interface ServicePurchase {
  id: string
  service_id: string
  service_name: string
  customer_email: string
  customer_name?: string
  amount_paid: number
  payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  stripe_payment_intent_id: string
  purchased_at: string
  metadata?: Record<string, string>
}

// API Response types
export interface ServicesResponse {
  success: boolean
  data: Service[]
  error?: string
}

export interface ServiceResponse {
  success: boolean
  data: Service
  error?: string
}

export interface PaymentResponse {
  success: boolean
  data: {
    client_secret: string
    payment_intent_id: string
  }
  error?: string
}

export interface SyncResponse {
  success: boolean
  data: {
    synced_products: number
    synced_prices: number
    errors: string[]
  }
  error?: string
}