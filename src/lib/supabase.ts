import { createClient } from '@supabase/supabase-js'

// Singleton pattern to prevent multiple clients
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured')
  }
  
  // Create and store the client
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

// Database types for our new schema
export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          course_enrolled: 'Foundation' | 'Premium' | 'None'
          enrollment_date: string
          status: 'Active' | 'Inactive' | 'Completed'
          payment_status: 'Paid' | 'Pending' | 'Trial'
          progress: number
          last_login: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          course_enrolled?: 'Foundation' | 'Premium' | 'None'
          enrollment_date?: string
          status?: 'Active' | 'Inactive' | 'Completed'
          payment_status?: 'Paid' | 'Pending' | 'Trial'
          progress?: number
          last_login?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          course_enrolled?: 'Foundation' | 'Premium' | 'None'
          enrollment_date?: string
          status?: 'Active' | 'Inactive' | 'Completed'
          payment_status?: 'Paid' | 'Pending' | 'Trial'
          progress?: number
          last_login?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          role: 'Super Admin' | 'Admin' | 'Support'
          permissions: string[]
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          role?: 'Super Admin' | 'Admin' | 'Support'
          permissions?: string[]
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          role?: 'Super Admin' | 'Admin' | 'Support'
          permissions?: string[]
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jitsi_sessions: {
        Row: {
          id: string
          session_name: string
          room_name: string
          scheduled_for: string
          duration_minutes: number
          max_participants: number
          course_type: 'Foundation' | 'Premium' | 'All' | null
          status: 'Scheduled' | 'Active' | 'Completed' | 'Cancelled'
          meeting_password: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_name: string
          room_name: string
          scheduled_for: string
          duration_minutes?: number
          max_participants?: number
          course_type?: 'Foundation' | 'Premium' | 'All' | null
          status?: 'Scheduled' | 'Active' | 'Completed' | 'Cancelled'
          meeting_password?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_name?: string
          room_name?: string
          scheduled_for?: string
          duration_minutes?: number
          max_participants?: number
          course_type?: 'Foundation' | 'Premium' | 'All' | null
          status?: 'Scheduled' | 'Active' | 'Completed' | 'Cancelled'
          meeting_password?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Student = Database['public']['Tables']['students']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type JitsiSession = Database['public']['Tables']['jitsi_sessions']['Row']