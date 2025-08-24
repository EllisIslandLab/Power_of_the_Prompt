// Database types for Web Launch Academy
// Based on current database schema

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          full_name: string
          email: string
          email_verified: boolean
          course_enrolled: 'Foundation' | 'Premium' | 'None'
          status: 'Active' | 'Inactive' | 'Completed'
          payment_status: 'Paid' | 'Pending' | 'Trial'
          progress: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Students, 'created_at' | 'updated_at'>
        Update: Partial<StudentsInsert>
      }
      video_sessions: {
        Row: {
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
        Insert: Omit<VideoSessions, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<VideoSessionsInsert>
      }
      consultations: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          website_description: string | null
          preferred_time: string | null
          status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Consultations, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<ConsultationsInsert>
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_type: string
          enrollment_date: string
          status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Enrollments, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<EnrollmentsInsert>
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string | null
          content: string
          message_type: 'CHAT' | 'SUPPORT' | 'ANNOUNCEMENT'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Messages, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<MessagesInsert>
      }
    }
  }
}

// Helper type exports
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

// Individual table types
export type Students = Database['public']['Tables']['students']['Row']
export type StudentsInsert = Database['public']['Tables']['students']['Insert']
export type StudentsUpdate = Database['public']['Tables']['students']['Update']

export type VideoSessions = Database['public']['Tables']['video_sessions']['Row']
export type VideoSessionsInsert = Database['public']['Tables']['video_sessions']['Insert']
export type VideoSessionsUpdate = Database['public']['Tables']['video_sessions']['Update']

export type Consultations = Database['public']['Tables']['consultations']['Row']
export type ConsultationsInsert = Database['public']['Tables']['consultations']['Insert']
export type ConsultationsUpdate = Database['public']['Tables']['consultations']['Update']

export type Enrollments = Database['public']['Tables']['enrollments']['Row']
export type EnrollmentsInsert = Database['public']['Tables']['enrollments']['Insert']
export type EnrollmentsUpdate = Database['public']['Tables']['enrollments']['Update']

export type Messages = Database['public']['Tables']['messages']['Row']
export type MessagesInsert = Database['public']['Tables']['messages']['Insert']
export type MessagesUpdate = Database['public']['Tables']['messages']['Update']

// Legacy compatibility exports
export type StudentProfile = Students
export type VideoSession = VideoSessions
export type AdminProfile = {
  id: string
  user_id: string
  full_name: string
  email: string
  role: 'Super Admin' | 'Admin' | 'Support'
  permissions: string[]
  created_at: string
  updated_at: string
}