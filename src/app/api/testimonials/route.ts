import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Fetch approved testimonials with arrangement order (Arrangement > 0 means it should be displayed)
    const { data: records, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'Approved')
      .gt('arrangement', 0)
      .order('arrangement', { ascending: true })
      .limit(100)

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    const testimonials = (records || []).map(record => ({
      id: record.id,
      name: record.name,
      testimonial: record.testimonial,
      title: record.title_role || 'Customer',
      avatar: record.avatar || '😊',
      email: record.email,
      submittedDate: record.submitted_date,
      updatedDate: record.updated_date,
      arrangement: record.arrangement || 0,
    }))

    return NextResponse.json({
      success: true,
      testimonials: testimonials
    })

  } catch (error) {
    console.error('Error fetching testimonials:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch testimonials',
        testimonials: [],
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}