import { NextRequest, NextResponse } from 'next/server'
import { getAirtableBase } from '@/lib/airtable'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, testimonial } = body
    
    if (!name || !testimonial) {
      return NextResponse.json(
        { error: 'Name and testimonial are required' },
        { status: 400 }
      )
    }

    // Basic validation
    if (testimonial.length < 10) {
      return NextResponse.json(
        { error: 'Testimonial must be at least 10 characters long' },
        { status: 400 }
      )
    }

    if (testimonial.length > 1000) {
      return NextResponse.json(
        { error: 'Testimonial must be less than 1000 characters' },
        { status: 400 }
      )
    }

    // Handle email logic - check if it's already in waitlist
    let shouldStoreEmailInAirtable = true
    let isExistingWaitlistUser = false
    
    if (body.email && body.email.trim()) {
      const emailToCheck = body.email.trim().toLowerCase()
      
      // Check if email already exists in waitlist
      const { data: existingEmail, error: checkError } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', emailToCheck)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is what we want
        console.error('Waitlist check error:', checkError)
        // Continue with testimonial submission even if waitlist check fails
      }
      
      if (existingEmail) {
        // User is already in waitlist - don't store email in Airtable to avoid conflicts
        shouldStoreEmailInAirtable = false
        isExistingWaitlistUser = true
      }
    }

    // Handle Airtable record creation or update
    const base = getAirtableBase()
    
    // Check if user already has a testimonial - ONLY allow updates if email is provided
    let existingRecord = null
    
    // Security: Only search for existing records if email is provided
    // This prevents users from updating other people's testimonials by guessing names
    if (body.email && body.email.trim()) {
      const searchEmail = body.email.trim() // Use actual email for search regardless of storage
      
      try {
        const existingRecords = await base('Testimonial Submissions').select({
          filterByFormula: `{Email} = '${searchEmail.replace(/'/g, "\\'")}'`, // Only search by email
          maxRecords: 1
        }).firstPage()
        
        if (existingRecords.length > 0) {
          existingRecord = existingRecords[0]
        }
      } catch (searchError) {
        console.error('Error searching for existing testimonial:', searchError)
        // Continue with creation if search fails
      }
    }
    // If no email provided, we can only create new records (never update)

    const recordData = {
      'Name': name.trim(),
      'Testimonial': testimonial.trim(),
      'Status': 'Pending Review',
      'Submitted Date': new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      'Email': shouldStoreEmailInAirtable ? (body.email?.trim() || '') : '', // Only store email if not in waitlist
      'Arrangement': 0, // Default to 0 (not arranged/displayed yet) - admin can set order number to display
      'Existing Waitlist User': isExistingWaitlistUser ? 'Yes' : 'No', // Track if user was already in waitlist
      'Updated Date': new Date().toISOString().split('T')[0], // Track when it was last updated
      'Title/Role': body.title?.trim() || 'Customer', // Default role if not provided
      'Avatar': body.avatar?.trim() || '😊' // Default emoji if not provided
    }

    let finalRecord
    let isUpdate = false

    if (existingRecord) {
      // Update existing record
      finalRecord = await base('Testimonial Submissions').update([
        {
          id: existingRecord.id,
          fields: recordData
        }
      ])
      isUpdate = true
    } else {
      // Create new record
      finalRecord = await base('Testimonial Submissions').create([{
        fields: recordData
      }])
      isUpdate = false
    }
    
    // TODO: Send email notification to admin
    // You could integrate with your email service here
    
    // Craft appropriate success message based on operation type
    let successMessage = ''
    
    if (isUpdate) {
      if (isExistingWaitlistUser) {
        successMessage = 'Your testimonial has been updated successfully! Since you\'re already on our waitlist, we\'ll review your updated testimonial and notify you when we launch.'
      } else {
        successMessage = 'Your testimonial has been updated successfully! We\'ll review your changes and get back to you.'
      }
    } else {
      if (isExistingWaitlistUser) {
        successMessage = 'Testimonial submitted successfully! Since you\'re already on our waitlist, we\'ll review your testimonial and notify you when we launch.'
      } else {
        if (body.email && body.email.trim()) {
          successMessage = 'Testimonial submitted successfully! We\'ll review it and get back to you. (Tip: You can edit this testimonial anytime by resubmitting with the same email.)'
        } else {
          successMessage = 'Testimonial submitted successfully! We\'ll review it and get back to you.'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: successMessage,
      recordId: finalRecord[0].id,
      existingWaitlistUser: isExistingWaitlistUser,
      isUpdate: isUpdate
    })

  } catch (error) {
    console.error('Testimonial submission error:', error)
    
    // Check if it's an Airtable table not found error
    if ((error as Error).message?.includes('Could not find table') || 
        (error as Error).message?.includes('NOT_FOUND')) {
      return NextResponse.json(
        { 
          error: 'Testimonial system not yet configured. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? 'Airtable table "Testimonial Submissions" needs to be created' : undefined
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to submit testimonial',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}