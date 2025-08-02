import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!)

export interface EnrollmentCheck {
  canEnroll: boolean
  seatsAvailable: number | null
  isUnlimited: boolean
  message: string
  enrollmentStatus: string
}

export interface ServicePurchaseData {
  serviceId: string
  customerEmail: string
  customerName: string
  amountPaid: number
  stripePaymentIntentId: string
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'refunded'
}

/**
 * Check if a service has available seats for enrollment
 */
export async function checkEnrollmentAvailability(serviceId: string): Promise<EnrollmentCheck> {
  try {
    const service = await base('Services').find(serviceId)
    const fields = service.fields as any

    const maxSeats = fields['Max Seats'] || null
    const seatsTaken = fields['Seats Taken'] || 0
    const isActive = fields['Is Active'] || false

    const isUnlimited = !maxSeats
    const seatsAvailable = isUnlimited ? null : maxSeats - seatsTaken
    const isFull = !isUnlimited && seatsTaken >= maxSeats

    let enrollmentStatus = 'closed'
    let message = ''
    let canEnroll = false

    if (!isActive) {
      enrollmentStatus = 'inactive'
      message = 'This service is currently unavailable'
      canEnroll = false
    } else if (isUnlimited) {
      enrollmentStatus = 'unlimited'
      message = 'Open enrollment - unlimited capacity'
      canEnroll = true
    } else if (isFull) {
      enrollmentStatus = 'full'
      message = 'This service is currently full'
      canEnroll = false
    } else if (seatsTaken >= (maxSeats * 0.9)) {
      enrollmentStatus = 'almost_full'
      message = `Only ${seatsAvailable} spots left!`
      canEnroll = true
    } else {
      enrollmentStatus = 'open'
      message = `${seatsAvailable} spots available`
      canEnroll = true
    }

    return {
      canEnroll,
      seatsAvailable,
      isUnlimited,
      message,
      enrollmentStatus
    }

  } catch (error) {
    console.error('Error checking enrollment availability:', error)
    throw new Error('Failed to check enrollment availability')
  }
}

/**
 * Record a service purchase and update seat counts
 */
export async function recordServicePurchase(purchaseData: ServicePurchaseData): Promise<string> {
  try {
    // First check if service has available seats
    const availability = await checkEnrollmentAvailability(purchaseData.serviceId)
    
    if (!availability.canEnroll) {
      throw new Error(`Cannot enroll: ${availability.message}`)
    }

    // Create purchase record in Service Purchases table
    const purchaseRecord = await base('Service Purchases').create([
      {
        fields: {
          'Service': [purchaseData.serviceId], // Link to Services table
          'Customer Email': purchaseData.customerEmail,
          'Customer Name': purchaseData.customerName,
          'Amount Paid': purchaseData.amountPaid,
          'Payment Status': purchaseData.paymentStatus,
          'Stripe Payment ID': purchaseData.stripePaymentIntentId,
          'Purchase Date': new Date().toISOString()
        }
      }
    ])

    return purchaseRecord[0].id

  } catch (error) {
    console.error('Error recording service purchase:', error)
    throw error
  }
}

/**
 * Update purchase payment status (e.g., when Stripe webhook confirms payment)
 */
export async function updatePurchaseStatus(
  purchaseId: string, 
  paymentStatus: 'succeeded' | 'failed' | 'refunded'
): Promise<void> {
  try {
    await base('Service Purchases').update([
      {
        id: purchaseId,
        fields: {
          'Payment Status': paymentStatus,
          'Updated At': new Date().toISOString()
        }
      }
    ])
  } catch (error) {
    console.error('Error updating purchase status:', error)
    throw error
  }
}

/**
 * Get current enrollment stats for a service
 */
export async function getEnrollmentStats(serviceId: string) {
  try {
    const service = await base('Services').find(serviceId)
    const fields = service.fields as any

    // Get all purchases for this service
    const purchases = await base('Service Purchases').select({
      filterByFormula: `AND({Service} = '${serviceId}', {Payment Status} = 'succeeded')`,
      fields: ['Customer Email', 'Customer Name', 'Amount Paid', 'Purchase Date']
    }).all()

    return {
      serviceName: fields['Service Name'],
      maxSeats: fields['Max Seats'] || null,
      seatsTaken: purchases.length,
      seatsAvailable: fields['Max Seats'] ? fields['Max Seats'] - purchases.length : null,
      isUnlimited: !fields['Max Seats'],
      totalRevenue: purchases.reduce((sum, record) => sum + (record.fields['Amount Paid'] || 0), 0),
      enrolledStudents: purchases.map(record => ({
        email: record.fields['Customer Email'],
        name: record.fields['Customer Name'],
        purchaseDate: record.fields['Purchase Date']
      }))
    }
  } catch (error) {
    console.error('Error getting enrollment stats:', error)
    throw error
  }
}

/**
 * Get services that are almost full or full (for marketing purposes)
 */
export async function getUrgentServices() {
  try {
    const services = await base('Services').select({
      filterByFormula: `AND({Is Active} = TRUE(), {Max Seats} > 0)`,
      fields: ['Service Name', 'Max Seats', 'Seats Taken', 'Price', 'Service Type']
    }).all()

    return services
      .map(record => {
        const fields = record.fields as any
        const maxSeats = fields['Max Seats'] || 0
        const seatsTaken = fields['Seats Taken'] || 0
        const seatsAvailable = maxSeats - seatsTaken
        const fillPercentage = maxSeats > 0 ? (seatsTaken / maxSeats) * 100 : 0

        return {
          id: record.id,
          serviceName: fields['Service Name'],
          maxSeats,
          seatsTaken,
          seatsAvailable,
          fillPercentage,
          isAlmostFull: fillPercentage >= 90,
          isFull: fillPercentage >= 100,
          price: fields['Price'],
          serviceType: fields['Service Type']
        }
      })
      .filter(service => service.fillPercentage >= 75) // Show services that are 75%+ full
      .sort((a, b) => b.fillPercentage - a.fillPercentage) // Sort by most full first
  } catch (error) {
    console.error('Error getting urgent services:', error)
    throw error
  }
}