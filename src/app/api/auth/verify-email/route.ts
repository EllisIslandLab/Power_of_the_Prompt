import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find student with this verification token
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('email_verification_token', token)
      .single()

    if (error || !student) {
      console.error('Student not found for token:', error)
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (student.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
      })
    }

    // Check if token has expired
    const now = new Date()
    const expiresAt = new Date(student.email_verification_expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Update student to mark email as verified
    const { error: updateError } = await supabase
      .from('students')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', student.id)

    if (updateError) {
      console.error('Failed to update student verification status:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify email. Please try again.' },
        { status: 500 }
      )
    }

    console.log('✅ Email verified for student:', student.email)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      student: {
        id: student.id,
        email: student.email,
        full_name: student.full_name,
      },
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}