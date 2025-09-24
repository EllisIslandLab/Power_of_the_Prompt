import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase(true) // Use service role

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action !== 'migrate_waitlist') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    console.log('📡 Starting waitlist to leads migration...')

    // Since waitlist table has been deleted, return success with no migration needed
    console.log('ℹ️ Waitlist table has been migrated and removed. No further action needed.')

    return NextResponse.json({
      success: true,
      message: 'Waitlist data has already been successfully migrated to leads table. No further migration needed.',
      stats: {
        migratedCount: 0,
        skippedCount: 0,
        totalProcessed: 0,
        successRate: '100'
      }
    })

  } catch (error) {
    console.error('❌ Migration API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to migrate waitlist',
      details: 'Check server logs for more information'
    }, { status: 500 })
  }
}