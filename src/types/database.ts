export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      invite_tokens: {
        Row: {
          id: string
          token: string
          email: string
          full_name: string | null
          tier: 'free' | 'full'
          expires_at: string
          used_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          token: string
          email: string
          full_name?: string | null
          tier?: 'free' | 'full'
          expires_at: string
          used_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          token?: string
          email?: string
          full_name?: string | null
          tier?: 'free' | 'full'
          expires_at?: string
          used_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          email: string
          full_name: string | null
          email_verified: boolean
          created_at: string
          updated_at: string
          tier: 'free' | 'full'
          payment_status: 'pending' | 'paid' | 'trial' | 'expired'
          invited_by: string | null
          invited_at: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          tier?: 'free' | 'full'
          payment_status?: 'pending' | 'paid' | 'trial' | 'expired'
          invited_by?: string | null
          invited_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          tier?: 'free' | 'full'
          payment_status?: 'pending' | 'paid' | 'trial' | 'expired'
          invited_by?: string | null
          invited_at?: string | null
        }
        Relationships: []
      }
      video_sessions: {
        Row: {
          id: string
          title: string
          room_name: string
          host_id: string
          status: 'scheduled' | 'active' | 'ended'
          scheduled_for: string | null
          started_at: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
          max_participants: number | null
          description: string | null
        }
        Insert: {
          id?: string
          title: string
          room_name: string
          host_id: string
          status?: 'scheduled' | 'active' | 'ended'
          scheduled_for?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
          max_participants?: number | null
          description?: string | null
        }
        Update: {
          id?: string
          title?: string
          room_name?: string
          host_id?: string
          status?: 'scheduled' | 'active' | 'ended'
          scheduled_for?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
          max_participants?: number | null
          description?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_invite_tokens: {
        Args: {}
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

// Convenience types for common use cases
export type StudentProfile = Tables<"students">
export type VideoSession = Tables<"video_sessions">
export type InviteToken = Tables<"invite_tokens">

export type Students = StudentProfile
export type VideoSessions = VideoSession
export type AdminProfile = StudentProfile // For backwards compatibility