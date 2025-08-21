import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from './env-config'

// Singleton pattern to prevent multiple clients
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  // Get configuration with proper validation and fallbacks
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig()

  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`)
  }

  // Validate key format  
  if (!supabaseAnonKey.startsWith('eyJ')) {
    throw new Error(`Invalid Supabase anon key format: ${supabaseAnonKey.substring(0, 20)}...`)
  }
  
  try {
    // Create client with additional options for debugging
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'weblaunchcoach-auth', // Unique storage key
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      },
      global: {
        headers: {
          'X-Client-Info': 'weblaunchcoach/1.0.0'
        }
      }
    })
    
    console.log('✅ Supabase client created successfully')
    return supabaseClient
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    throw new Error(`Failed to create Supabase client: ${(error as Error).message}`)
  }
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
      video_sessions: {
        Row: {
          id: string
          session_name: string
          jitsi_room_id: string
          host_user_id: string
          participant_user_ids: string[]
          session_type: 'FREE_CONSULTATION' | 'PAID_SESSION' | 'GROUP_COACHING' | 'WORKSHOP' | 'OFFICE_HOURS'
          scheduled_start: string
          scheduled_end: string
          actual_start: string | null
          actual_end: string | null
          stripe_payment_intent_id: string | null
          session_status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          meeting_notes: string | null
          recording_url: string | null
          jitsi_config: any | null
          waiting_room_enabled: boolean
          max_participants: number | null
          consultation_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_name: string
          jitsi_room_id: string
          host_user_id: string
          participant_user_ids?: string[]
          session_type?: 'FREE_CONSULTATION' | 'PAID_SESSION' | 'GROUP_COACHING' | 'WORKSHOP' | 'OFFICE_HOURS'
          scheduled_start: string
          scheduled_end: string
          actual_start?: string | null
          actual_end?: string | null
          stripe_payment_intent_id?: string | null
          session_status?: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          meeting_notes?: string | null
          recording_url?: string | null
          jitsi_config?: any | null
          waiting_room_enabled?: boolean
          max_participants?: number | null
          consultation_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_name?: string
          jitsi_room_id?: string
          host_user_id?: string
          participant_user_ids?: string[]
          session_type?: 'FREE_CONSULTATION' | 'PAID_SESSION' | 'GROUP_COACHING' | 'WORKSHOP' | 'OFFICE_HOURS'
          scheduled_start?: string
          scheduled_end?: string
          actual_start?: string | null
          actual_end?: string | null
          stripe_payment_intent_id?: string | null
          session_status?: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          meeting_notes?: string | null
          recording_url?: string | null
          jitsi_config?: any | null
          waiting_room_enabled?: boolean
          max_participants?: number | null
          consultation_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          user_id: string
          scheduled_time: string
          status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
          notes: string | null
          type: 'FREE' | 'PREMIUM'
          video_session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scheduled_time: string
          status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
          notes?: string | null
          type: 'FREE' | 'PREMIUM'
          video_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scheduled_time?: string
          status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
          notes?: string | null
          type?: 'FREE' | 'PREMIUM'
          video_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_type: 'STANDARD' | 'PREMIUM'
          payment_status: 'PENDING' | 'COMPLETED' | 'FAILED'
          start_date: string
          completion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_type: 'STANDARD' | 'PREMIUM'
          payment_status?: 'PENDING' | 'COMPLETED' | 'FAILED'
          start_date?: string
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_type?: 'STANDARD' | 'PREMIUM'
          payment_status?: 'PENDING' | 'COMPLETED' | 'FAILED'
          start_date?: string
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          content: string
          thread_id: string | null
          read_status: boolean
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          content: string
          thread_id?: string | null
          read_status?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          content?: string
          thread_id?: string | null
          read_status?: boolean
          created_at?: string
        }
      }
    }
  }
}

export type Student = Database['public']['Tables']['students']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type VideoSession = Database['public']['Tables']['video_sessions']['Row']
export type Consultation = Database['public']['Tables']['consultations']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type Message = Database['public']['Tables']['messages']['Row']