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
          first_name: string | null
          last_name: string | null
          display_name: string | null
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
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
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
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
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
          affiliate_tier_id: string | null
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
          affiliate_tier_id?: string | null
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
          affiliate_tier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_affiliate_tier_id_fkey"
            columns: ["affiliate_tier_id"]
            isOneToOne: false
            referencedRelation: "affiliate_tiers"
            referencedColumns: ["id"]
          }
        ]
      }
      student_points: {
        Row: {
          id: string
          user_id: string
          attendance_points: number
          engagement_points: number
          referral_signup_points: number
          referral_cash_points: number
          bonus_points: number
          total_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          attendance_points?: number
          engagement_points?: number
          referral_signup_points?: number
          referral_cash_points?: number
          bonus_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          attendance_points?: number
          engagement_points?: number
          referral_signup_points?: number
          referral_cash_points?: number
          bonus_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      badges: {
        Row: {
          id: string
          badge_name: string
          badge_description: string | null
          badge_category: string | null
          points_value: number
          badge_tier: string | null
          created_at: string
        }
        Insert: {
          id?: string
          badge_name: string
          badge_description?: string | null
          badge_category?: string | null
          points_value?: number
          badge_tier?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          badge_name?: string
          badge_description?: string | null
          badge_category?: string | null
          points_value?: number
          badge_tier?: string | null
        }
        Relationships: []
      }
      student_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          awarded_at: string
          awarded_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          awarded_at?: string
          awarded_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          awarded_at?: string
          awarded_by?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_badges_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      course_sessions: {
        Row: {
          id: string
          session_name: string
          session_date: string
          session_code: string | null
          code_expires_at: string | null
          recording_url: string | null
          recording_available_until: string | null
          live_points: number
          recording_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_name: string
          session_date: string
          session_code?: string | null
          code_expires_at?: string | null
          recording_url?: string | null
          recording_available_until?: string | null
          live_points?: number
          recording_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_name?: string
          session_date?: string
          session_code?: string | null
          code_expires_at?: string | null
          recording_url?: string | null
          recording_available_until?: string | null
          live_points?: number
          recording_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      attendance_log: {
        Row: {
          id: string
          user_id: string
          session_id: string
          attendance_type: 'live' | 'recording'
          points_awarded: number
          checked_in_at: string
          watch_duration_minutes: number | null
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          attendance_type: 'live' | 'recording'
          points_awarded: number
          checked_in_at?: string
          watch_duration_minutes?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          attendance_type?: 'live' | 'recording'
          points_awarded?: number
          checked_in_at?: string
          watch_duration_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      social_shares: {
        Row: {
          id: string
          user_id: string
          platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'other'
          post_url: string
          screenshot_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          points_awarded: number
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'other'
          post_url: string
          screenshot_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          points_awarded?: number
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'other'
          post_url?: string
          screenshot_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          points_awarded?: number
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_shares_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_id: string | null
          referee_email: string
          status: 'lead' | 'paid' | 'processed' | 'held'
          signup_points_awarded: number
          cash_convertible_points: number
          points_held_until: string | null
          purchase_amount: number | null
          purchase_date: string | null
          tier_at_referral: string | null
          cap_bypassed: boolean
          created_at: string
          paid_at: string | null
          processed_at: string | null
        }
        Insert: {
          id?: string
          referrer_id: string
          referee_id?: string | null
          referee_email: string
          status?: 'lead' | 'paid' | 'processed' | 'held'
          signup_points_awarded?: number
          cash_convertible_points?: number
          points_held_until?: string | null
          purchase_amount?: number | null
          purchase_date?: string | null
          tier_at_referral?: string | null
          cap_bypassed?: boolean
          created_at?: string
          paid_at?: string | null
          processed_at?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string
          referee_id?: string | null
          referee_email?: string
          status?: 'lead' | 'paid' | 'processed' | 'held'
          signup_points_awarded?: number
          cash_convertible_points?: number
          points_held_until?: string | null
          purchase_amount?: number | null
          purchase_date?: string | null
          tier_at_referral?: string | null
          cap_bypassed?: boolean
          paid_at?: string | null
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      affiliate_tiers: {
        Row: {
          id: string
          tier_name: string
          tier_level: number
          max_cash_per_referral: number
          percentage_bonus: number
          purchase_count_limit: number | null
          spend_cap_for_bonus: number | null
          total_cap_percentage: number
          requirements_description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tier_name: string
          tier_level: number
          max_cash_per_referral: number
          percentage_bonus: number
          purchase_count_limit?: number | null
          spend_cap_for_bonus?: number | null
          total_cap_percentage: number
          requirements_description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tier_name?: string
          tier_level?: number
          max_cash_per_referral?: number
          percentage_bonus?: number
          purchase_count_limit?: number | null
          spend_cap_for_bonus?: number | null
          total_cap_percentage?: number
          requirements_description?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          email: string
          phone: string
          business_name: string | null
          scheduled_date: string
          duration_minutes: number
          timezone: string
          status: string
          jitsi_room_id: string | null
          jitsi_join_url: string | null
          video_session_id: string | null
          website_description: string | null
          notes: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          rescheduled_from: string | null
          reminder_24h_sent: boolean
          reminder_24h_sent_at: string | null
          reminder_1h_sent: boolean
          reminder_1h_sent_at: string | null
          confirmation_sent: boolean
          confirmation_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          email: string
          phone: string
          business_name?: string | null
          scheduled_date: string
          duration_minutes?: number
          timezone?: string
          status?: string
          jitsi_room_id?: string | null
          jitsi_join_url?: string | null
          video_session_id?: string | null
          website_description?: string | null
          notes?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          rescheduled_from?: string | null
          reminder_24h_sent?: boolean
          reminder_24h_sent_at?: string | null
          reminder_1h_sent?: boolean
          reminder_1h_sent_at?: string | null
          confirmation_sent?: boolean
          confirmation_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          email?: string
          phone?: string
          business_name?: string | null
          scheduled_date?: string
          duration_minutes?: number
          timezone?: string
          status?: string
          jitsi_room_id?: string | null
          jitsi_join_url?: string | null
          video_session_id?: string | null
          website_description?: string | null
          notes?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          rescheduled_from?: string | null
          reminder_24h_sent?: boolean
          reminder_24h_sent_at?: string | null
          reminder_1h_sent?: boolean
          reminder_1h_sent_at?: string | null
          confirmation_sent?: boolean
          confirmation_sent_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_rescheduled_from_fkey"
            columns: ["rescheduled_from"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          }
        ]
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          stripe_promo_code_id: string | null
          stripe_coupon_id: string | null
          product_id: string
          discount_type: string
          discount_amount: number
          user_email: string
          user_id: string | null
          expires_at: string
          used: boolean
          used_at: string | null
          used_in_session_id: string | null
          campaign_type: string
          sent_via_email_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          stripe_promo_code_id?: string | null
          stripe_coupon_id?: string | null
          product_id: string
          discount_type: string
          discount_amount: number
          user_email: string
          user_id?: string | null
          expires_at: string
          used?: boolean
          used_at?: string | null
          used_in_session_id?: string | null
          campaign_type?: string
          sent_via_email_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          stripe_promo_code_id?: string | null
          stripe_coupon_id?: string | null
          product_id?: string
          discount_type?: string
          discount_amount?: number
          user_email?: string
          user_id?: string | null
          expires_at?: string
          used?: boolean
          used_at?: string | null
          used_in_session_id?: string | null
          campaign_type?: string
          sent_via_email_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      consultation_blocks: {
        Row: {
          id: string
          start_time: string
          end_time: string
          reason: string | null
          block_type: string
          consultation_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          start_time: string
          end_time: string
          reason?: string | null
          block_type?: string
          consultation_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          start_time?: string
          end_time?: string
          reason?: string | null
          block_type?: string
          consultation_id?: string | null
          created_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_blocks_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      federal_holidays: {
        Row: {
          id: string
          holiday_name: string
          holiday_date: string
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          holiday_name: string
          holiday_date: string
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          holiday_name?: string
          holiday_date?: string
          year?: number
        }
        Relationships: []
      }
      template_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          level: number
          parent_id: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          level: number
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          level?: number
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "template_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      niche_templates: {
        Row: {
          id: string
          category_id: string
          name: string
          slug: string
          description: string | null
          is_active: boolean
          form_steps: Json
          html_generator_config: Json | null
          preview_thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          slug: string
          description?: string | null
          is_active?: boolean
          form_steps: Json
          html_generator_config?: Json | null
          preview_thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          slug?: string
          description?: string | null
          is_active?: boolean
          form_steps?: Json
          html_generator_config?: Json | null
          preview_thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "niche_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "template_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      demo_projects: {
        Row: {
          id: string
          template_id: string
          user_email: string
          business_contact_email: string | null
          business_name: string
          tagline: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          services: Json
          colors: Json | null
          custom_fields: Json
          generated_html: string | null
          preview_url: string | null
          status: string
          viewed_at: string | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          user_email: string
          business_contact_email?: string | null
          business_name: string
          tagline?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          services: Json
          colors?: Json | null
          custom_fields?: Json
          generated_html?: string | null
          preview_url?: string | null
          status?: string
          viewed_at?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          user_email?: string
          business_contact_email?: string | null
          business_name?: string
          tagline?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          services?: Json
          colors?: Json | null
          custom_fields?: Json
          generated_html?: string | null
          preview_url?: string | null
          status?: string
          viewed_at?: string | null
          expires_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_projects_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "niche_templates"
            referencedColumns: ["id"]
          }
        ]
      }
      demo_interactions: {
        Row: {
          id: string
          demo_project_id: string
          interaction_type: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          demo_project_id: string
          interaction_type: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          demo_project_id?: string
          interaction_type?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "demo_interactions_demo_project_id_fkey"
            columns: ["demo_project_id"]
            isOneToOne: false
            referencedRelation: "demo_projects"
            referencedColumns: ["id"]
          }
        ]
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
      increment_campaign_opens: {
        Args: {
          campaign_id: string
        }
        Returns: void
      }
      increment_campaign_clicks: {
        Args: {
          campaign_id: string
        }
        Returns: void
      }
      add_attendance_points: {
        Args: {
          p_user_id: string
          p_points: number
        }
        Returns: void
      }
      add_engagement_points: {
        Args: {
          p_user_id: string
          p_points: number
        }
        Returns: void
      }
      add_referral_signup_points: {
        Args: {
          p_user_id: string
          p_points: number
        }
        Returns: void
      }
      add_referral_cash_points: {
        Args: {
          p_user_id: string
          p_points: number
        }
        Returns: void
      }
      add_bonus_points: {
        Args: {
          p_user_id: string
          p_points: number
        }
        Returns: void
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
export type InviteToken = Tables<"invite_tokens">
export type StudentPoints = Tables<"student_points">
export type Badge = Tables<"badges">
export type StudentBadge = Tables<"student_badges">
export type CourseSession = Tables<"course_sessions">
export type AttendanceLog = Tables<"attendance_log">
export type SocialShare = Tables<"social_shares">
export type Referral = Tables<"referrals">
export type AffiliateTier = Tables<"affiliate_tiers">
export type Consultation = Tables<"consultations">
export type PromoCode = Tables<"promo_codes">
export type ConsultationBlock = Tables<"consultation_blocks">
export type FederalHoliday = Tables<"federal_holidays">

// Backwards compatibility
export type Students = UserProfile // For backwards compatibility
export type AdminProfile = UserProfile // For backwards compatibility

// New type aliases
export type Users = UserProfile
export type Leads = Lead
export type TemplateCategory = Tables<"template_categories">
export type NicheTemplate = Tables<"niche_templates">
export type DemoProject = Tables<"demo_projects">
export type DemoInteraction = Tables<"demo_interactions">