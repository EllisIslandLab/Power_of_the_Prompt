import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    // Get service details from Airtable
    const service = await base('Services').find(serviceId)
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const fields = service.fields as any
    const maxSeats = fields['Max Seats'] || null
    const seatsTaken = fields['Seats Taken'] || 0
    const isActive = fields['Is Active'] || false

    // Calculate availability
    const isUnlimited = !maxSeats
    const seatsAvailable = isUnlimited ? null : maxSeats - seatsTaken
    const isFull = !isUnlimited && seatsTaken >= maxSeats
    const isAlmostFull = !isUnlimited && seatsTaken >= (maxSeats * 0.9)

    let enrollmentStatus = 'closed'
    if (!isActive) {
      enrollmentStatus = 'inactive'
    } else if (isUnlimited) {
      enrollmentStatus = 'unlimited'
    } else if (isFull) {
      enrollmentStatus = 'full'
    } else if (isAlmostFull) {
      enrollmentStatus = 'almost_full'
    } else {
      enrollmentStatus = 'open'
    }

    return NextResponse.json({
      success: true,
      data: {
        serviceId: service.id,
        serviceName: fields['Service Name'],
        isActive: isActive,
        maxSeats: maxSeats,
        seatsTaken: seatsTaken,
        seatsAvailable: seatsAvailable,
        isUnlimited: isUnlimited,
        isFull: isFull,
        isAlmostFull: isAlmostFull,
        enrollmentStatus: enrollmentStatus,
        canPurchase: isActive && !isFull,
        message: getAvailabilityMessage(enrollmentStatus, seatsAvailable)
      }
    })

  } catch (error) {
    console.error('Error checking service availability:', error)
    return NextResponse.json(
      { error: 'Failed to check service availability', details: (error as Error)?.message },
      { status: 500 }
    )
  }
}

function getAvailabilityMessage(status: string, seatsAvailable: number | null): string {
  switch (status) {
    case 'inactive':
      return 'This service is currently unavailable'
    case 'full':
      return 'This service is currently full. Join the waitlist to be notified when spots open up.'
    case 'almost_full':
      return `Only ${seatsAvailable} spots left! Register soon to secure your place.`
    case 'open':
      return seatsAvailable ? `${seatsAvailable} spots available` : 'Open enrollment'
    case 'unlimited':
      return 'Open enrollment - unlimited capacity'
    default:
      return 'Enrollment status unknown'
  }
}