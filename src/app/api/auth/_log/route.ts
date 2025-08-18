// Log endpoint - return success since we're using Supabase
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true }, { status: 200 })
}