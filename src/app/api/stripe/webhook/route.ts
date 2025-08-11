import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import Airtable from 'airtable'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!)

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object)
        // TODO: Update user subscription status
        break
      
      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object)
        // TODO: Update user subscription status
        break
      
      case 'customer.subscription.deleted':
        console.log('Subscription cancelled:', event.data.object)
        // TODO: Update user subscription status
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const serviceId = paymentIntent.metadata.service_id
    const serviceName = paymentIntent.metadata.service_name
    const serviceType = paymentIntent.metadata.service_type
    const customerEmail = paymentIntent.metadata.customer_email
    const customerName = paymentIntent.metadata.customer_name

    // Update purchase record in Airtable
    const purchaseRecords = await base('Purchases').select({
      filterByFormula: `{Stripe Payment Intent ID} = '${paymentIntent.id}'`,
      maxRecords: 1
    }).all()

    if (purchaseRecords.length > 0) {
      await base('Purchases').update(purchaseRecords[0].id, {
        'Payment Status': 'succeeded',
        'Completed At': new Date().toISOString(),
        'Amount Paid': paymentIntent.amount / 100
      })
    } else {
      // Create new purchase record if it doesn't exist
      await base('Purchases').create({
        fields: {
          'Service ID': serviceId,
          'Service Name': serviceName,
          'Customer Email': customerEmail,
          'Customer Name': customerName || '',
          'Amount': paymentIntent.amount / 100,
          'Payment Status': 'succeeded',
          'Stripe Payment Intent ID': paymentIntent.id,
          'Purchased At': new Date().toISOString(),
          'Completed At': new Date().toISOString(),
          'Service Type': serviceType,
          'Metadata': JSON.stringify(paymentIntent.metadata)
        }
      })
    }

    // Handle service-specific post-purchase actions
    await handleServiceSpecificActions(serviceType, {
      serviceId,
      serviceName,
      customerEmail,
      customerName,
      paymentIntentId: paymentIntent.id
    })

    console.log(`Payment succeeded for service: ${serviceName}`)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update purchase record in Airtable
    const purchaseRecords = await base('Purchases').select({
      filterByFormula: `{Stripe Payment Intent ID} = '${paymentIntent.id}'`,
      maxRecords: 1
    }).all()

    if (purchaseRecords.length > 0) {
      await base('Purchases').update(purchaseRecords[0].id, {
        'Payment Status': 'failed',
        'Failed At': new Date().toISOString()
      })
    }

    console.log(`Payment failed for payment intent: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    // Handle checkout session completion
    // This would be used if you're using Stripe Checkout instead of Payment Intents
    console.log(`Checkout session completed: ${session.id}`)
    
    if (session.payment_intent) {
      // Get the payment intent and handle it
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string
      )
      await handlePaymentSuccess(paymentIntent)
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

async function handleServiceSpecificActions(
  serviceType: string,
  data: {
    serviceId: string
    serviceName: string
    customerEmail: string
    customerName: string
    paymentIntentId: string
  }
) {
  try {
    switch (serviceType) {
      case 'course':
        // Grant access to course content
        await grantCourseAccess(data)
        break
      
      case 'consultation':
        // Create consultation booking or send booking instructions
        await handleConsultationPurchase(data)
        break
      
      case 'audit':
        // Send audit instructions or create audit task
        await handleAuditPurchase(data)
        break
      
      case 'build':
        // Create project kickoff or send onboarding
        await handleBuildPurchase(data)
        break
      
      default:
        console.log(`No specific handler for service type: ${serviceType}`)
    }
  } catch (error) {
    console.error(`Error in service-specific handler for ${serviceType}:`, error)
  }
}

async function grantCourseAccess(data: any) {
  // Update user record to grant course access
  // This would integrate with your user management system
  console.log(`Granting course access to ${data.customerEmail}`)
  
  // Example: Update user record in database
  // await updateUserCourseAccess(data.customerEmail, data.serviceId)
}

async function handleConsultationPurchase(data: any) {
  // Create consultation booking request or send booking link
  console.log(`Creating consultation booking for ${data.customerEmail}`)
  
  // Example: Create consultation record
  try {
    await base('Consultations').create({
      fields: {
        'Name': data.customerName,
        'Email': data.customerEmail,
        'Status': 'Paid - Needs Scheduling',
        'Notes': `Purchased ${data.serviceName} - Payment ID: ${data.paymentIntentId}`
      }
    })
  } catch (error) {
    console.error('Error creating consultation record:', error)
  }
}

async function handleAuditPurchase(data: any) {
  // Create audit task or send instructions
  console.log(`Creating audit task for ${data.customerEmail}`)
  
  // Example: Create audit record
  try {
    await base('Audits').create({
      fields: {
        'Customer Name': data.customerName,
        'Customer Email': data.customerEmail,
        'Status': 'Paid - Pending Start',
        'Service': data.serviceName,
        'Payment Intent ID': data.paymentIntentId,
        'Created At': new Date().toISOString()
      }
    })
  } catch (error) {
    // Audits table might not exist yet
    console.log('Audits table not found, will need to be created')
  }
}

async function handleBuildPurchase(data: any) {
  // Create build project or send onboarding
  console.log(`Creating build project for ${data.customerEmail}`)
  
  // Example: Create build project record
  try {
    await base('Build Projects').create({
      fields: {
        'Client Name': data.customerName,
        'Client Email': data.customerEmail,
        'Status': 'Paid - Onboarding',
        'Service': data.serviceName,
        'Payment Intent ID': data.paymentIntentId,
        'Project Start': new Date().toISOString()
      }
    })
  } catch (error) {
    // Build Projects table might not exist yet
    console.log('Build Projects table not found, will need to be created')
  }
}