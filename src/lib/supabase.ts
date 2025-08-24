import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function getSupabase() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Re-export types for backwards compatibility
export type { 
  VideoSession, 
  StudentProfile, 
  AdminProfile,
  Students,
  VideoSessions,
  Database
} from '@/types/database'