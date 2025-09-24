import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()

    // Get current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' })
    }

    // Check if user is admin in users table
    const { data: userRecord, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (dbError || !userRecord) {
      return NextResponse.json({ isAdmin: false, error: 'User not found' })
    }

    return NextResponse.json({
      isAdmin: userRecord.role === 'admin',
      role: userRecord.role
    })

  } catch (error) {
    console.error('Admin role check error:', error)
    return NextResponse.json({ isAdmin: false, error: 'Server error' })
  }
}