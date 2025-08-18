// Session endpoint - return empty session since we're using Supabase
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ user: null }, { status: 200 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ user: null }, { status: 200 })
}