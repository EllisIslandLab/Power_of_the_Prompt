import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function getSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Type definitions for compatibility
export interface VideoSession {
  id: string
  session_name: string
  session_type: string
  scheduled_start: string
  duration_minutes: number
  host_id: string
  max_participants: number
  jitsi_room_name: string
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  created_at: string
  updated_at: string
}

export interface StudentProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  course_enrolled: 'Foundation' | 'Premium' | 'None'
  status: 'Active' | 'Inactive' | 'Completed'
  payment_status: 'Paid' | 'Pending' | 'Trial'
  progress: number
  created_at: string
  updated_at: string
}

export interface AdminProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  role: 'Super Admin' | 'Admin' | 'Support'
  permissions: string[]
  created_at: string
  updated_at: string
}