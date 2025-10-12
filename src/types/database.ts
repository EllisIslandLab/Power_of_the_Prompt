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
      campaigns: {
        Row: {
          id: string
          subject: string
          content: string
          status: 'draft' | 'sending' | 'sent' | 'failed'
          recipient_count: number
          sent_count: number
          opened_count: number
          clicked_count: number
          target_audience: Json
          scheduled_at: string | null
          sent_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject: string
          content: string
          status?: 'draft' | 'sending' | 'sent' | 'failed'
          recipient_count?: number
          sent_count?: number
          opened_count?: number
          clicked_count?: number
          target_audience?: Json
          scheduled_at?: string | null
          sent_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject?: string
          content?: string
          status?: 'draft' | 'sending' | 'sent' | 'failed'
          recipient_count?: number
          sent_count?: number
          opened_count?: number
          clicked_count?: number
          target_audience?: Json
          scheduled_at?: string | null
          sent_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaign_sends: {
        Row: {
          id: string
          campaign_id: string
          recipient_email: string
          recipient_name: string | null
          sent_at: string
          opened_at: string | null
          clicked_at: string | null
          bounced_at: string | null
          unsubscribed_at: string | null
          send_error: string | null
          email_client: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string
          opened_at?: string | null
          clicked_at?: string | null
          bounced_at?: string | null
          unsubscribed_at?: string | null
          send_error?: string | null
          email_client?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string
          opened_at?: string | null
          clicked_at?: string | null
          bounced_at?: string | null
          unsubscribed_at?: string | null
          send_error?: string | null
          email_client?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      email_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          subject_template: string
          content_template: string
          variables: Json
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string
          subject_template: string
          content_template: string
          variables?: Json
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          subject_template?: string
          content_template?: string
          variables?: Json
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          email: string
          name: string | null
          status: 'waitlist' | 'interested' | 'nurturing' | 'converted'
          source: string | null
          notes: string | null
          tags: Json
          custom_fields: Json
          signup_date: string
          last_engagement: string | null
          converted_at: string | null
          referrer_url: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          status?: 'waitlist' | 'interested' | 'nurturing' | 'converted'
          source?: string | null
          notes?: string | null
          tags?: Json
          custom_fields?: Json
          signup_date?: string
          last_engagement?: string | null
          converted_at?: string | null
          referrer_url?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          status?: 'waitlist' | 'interested' | 'nurturing' | 'converted'
          source?: string | null
          notes?: string | null
          tags?: Json
          custom_fields?: Json
          signup_date?: string
          last_engagement?: string | null
          converted_at?: string | null
          referrer_url?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          email_verified: boolean
          created_at: string
          updated_at: string
          role: 'student' | 'admin'
          tier: 'basic' | 'premium' | 'vip' | 'enterprise'
          payment_status: 'pending' | 'paid' | 'trial' | 'expired'
          invited_by: string | null
          invited_at: string | null
          phone_number: string | null
          sms_consent: boolean
          sms_consent_timestamp: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          role?: 'student' | 'admin'
          tier?: 'basic' | 'premium' | 'vip' | 'enterprise'
          payment_status?: 'pending' | 'paid' | 'trial' | 'expired'
          invited_by?: string | null
          invited_at?: string | null
          phone_number?: string | null
          sms_consent?: boolean
          sms_consent_timestamp?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          role?: 'student' | 'admin'
          tier?: 'basic' | 'premium' | 'vip' | 'enterprise'
          payment_status?: 'pending' | 'paid' | 'trial' | 'expired'
          invited_by?: string | null
          invited_at?: string | null
          phone_number?: string | null
          sms_consent?: boolean
          sms_consent_timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
      migrate_airtable_leads: {
        Args: {}
        Returns: { migrated_count: number; error_count: number }[]
      }
      migrate_waitlist_to_leads: {
        Args: {}
        Returns: { migrated_count: number; skipped_count: number }[]
      }
      convert_lead_to_user: {
        Args: {
          lead_email: string
          user_tier?: string
        }
        Returns: boolean
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
export type UserProfile = Tables<"users">
export type Lead = Tables<"leads">
export type Campaign = Tables<"campaigns">
export type EmailTemplate = Tables<"email_templates">
export type VideoSession = Tables<"video_sessions">
export type InviteToken = Tables<"invite_tokens">

// Backwards compatibility
export type Students = UserProfile // For backwards compatibility
export type AdminProfile = UserProfile // For backwards compatibility

// New type aliases
export type Users = UserProfile
export type Leads = Lead
export type VideoSessions = VideoSession