import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Fetch records from Supabase portfolio table
    const { data: records, error } = await supabase
      .from('portfolio')
      .select('*')
      .order('order', { ascending: true })

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    // Transform Supabase records to our portfolio format
    const portfolioItems = (records || [])
      .map((record) => {
        return {
          id: record.id,
          title: record.title || '',
          siteName: record.site_name || record.category || '',
          price: record.price || '$899',
          description: record.description || '',
          category: record.category || '',
          demoUrl: record.demo_url || '#',
          technologies: record.technologies || [],
          features: record.features || [],
          imageUrl: record.image_url || '/api/placeholder/600/400',
          backupUrls: record.backup_urls || []
        }
      })
      .filter(item => item.title && typeof item.title === 'string' && item.title.trim() !== '') // Filter out records with empty titles

    return NextResponse.json({
      success: true,
      data: portfolioItems
    })

  } catch (error) {
    console.error('Portfolio API Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch portfolio items',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
      },
      { status: 500 }
    )
  }
}