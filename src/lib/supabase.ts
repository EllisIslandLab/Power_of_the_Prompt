import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (we'll expand this as needed)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          role: 'STUDENT' | 'COACH' | 'ADMIN'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          role?: 'STUDENT' | 'COACH' | 'ADMIN'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          role?: 'STUDENT' | 'COACH' | 'ADMIN'
          created_at?: string
          updated_at?: string
        }
      }
      cohorts: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
          start_date: string | null
          end_date: string | null
          max_students: number
          current_students: number
          coach_id: string | null
          price: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
          start_date?: string | null
          end_date?: string | null
          max_students?: number
          current_students?: number
          coach_id?: string | null
          price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
          start_date?: string | null
          end_date?: string | null
          max_students?: number
          current_students?: number
          coach_id?: string | null
          price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Cohort = Database['public']['Tables']['cohorts']['Row']