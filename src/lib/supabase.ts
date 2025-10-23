import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export function getSupabase(useServiceRole: boolean = false) {
  if (useServiceRole) {
    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Re-export types for backwards compatibility
export type {
  UserProfile,
  AdminProfile,
  Students,
  CourseSession,
  StudentPoints,
  Badge,
  Referral,
  Database
} from '@/types/database'