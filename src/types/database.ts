export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      affiliate_badge_clicks: {
        Row: {
          clicked_at: string
          converted: boolean | null
          created_at: string
          id: string
          ip_address: string | null
          referee_email: string | null
          referee_id: string | null
          referrer_email: string
          referrer_id: string
          session_id: string | null
          source_domain: string | null
          source_url: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string
          converted?: boolean | null
          created_at?: string
          id?: string
          ip_address?: string | null
          referee_email?: string | null
          referee_id?: string | null
          referrer_email: string
          referrer_id: string
          session_id?: string | null
          source_domain?: string | null
          source_url?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string
          converted?: boolean | null
          created_at?: string
          id?: string
          ip_address?: string | null
          referee_email?: string | null
          referee_id?: string | null
          referrer_email?: string
          referrer_id?: string
          session_id?: string | null
          source_domain?: string | null
          source_url?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      affiliate_compensations: {
        Row: {
          badge_click_id: string | null
          commission_amount: number
          commission_percentage: number
          created_at: string
          held_until: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payout_email: string | null
          payout_method: string | null
          purchase_amount: number
          purchase_id: string
          referrer_email: string
          referrer_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          badge_click_id?: string | null
          commission_amount: number
          commission_percentage: number
          created_at?: string
          held_until?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payout_email?: string | null
          payout_method?: string | null
          purchase_amount: number
          purchase_id: string
          referrer_email: string
          referrer_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          badge_click_id?: string | null
          commission_amount?: number
          commission_percentage?: number
          created_at?: string
          held_until?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payout_email?: string | null
          payout_method?: string | null
          purchase_amount?: number
          purchase_id?: string
          referrer_email?: string
          referrer_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_compensations_badge_click_id_fkey"
            columns: ["badge_click_id"]
            isOneToOne: false
            referencedRelation: "affiliate_badge_clicks"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_sends: {
        Row: {
          bounced_at: string | null
          campaign_id: string | null
          clicked_at: string | null
          email_client: string | null
          id: string
          opened_at: string | null
          recipient_email: string
          recipient_name: string | null
          resend_email_id: string | null
          send_error: string | null
          sent_at: string | null
          unsubscribed_at: string | null
          user_agent: string | null
        }
        Insert: {
          bounced_at?: string | null
          campaign_id?: string | null
          clicked_at?: string | null
          email_client?: string | null
          id?: string
          opened_at?: string | null
          recipient_email: string
          recipient_name?: string | null
          resend_email_id?: string | null
          send_error?: string | null
          sent_at?: string | null
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string | null
          clicked_at?: string | null
          email_client?: string | null
          id?: string
          opened_at?: string | null
          recipient_email?: string
          recipient_name?: string | null
          resend_email_id?: string | null
          send_error?: string | null
          sent_at?: string | null
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          clicked_count: number | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          opened_count: number | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          subject: string
          target_audience: Json | null
          updated_at: string | null
        }
        Insert: {
          clicked_count?: number | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject: string
          target_audience?: Json | null
          updated_at?: string | null
        }
        Update: {
          clicked_count?: number | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject?: string
          target_audience?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_accounts: {
        Row: {
          account_balance: number | null
          created_at: string | null
          held_balance: number | null
          id: string
          total_free_bug_fixes_used: number | null
          total_lifetime_spent: number | null
          trial_expiration_date: string | null
          trial_extended_by_matt: boolean | null
          trial_extended_date: string | null
          trial_start_date: string | null
          trial_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_balance?: number | null
          created_at?: string | null
          held_balance?: number | null
          id?: string
          total_free_bug_fixes_used?: number | null
          total_lifetime_spent?: number | null
          trial_expiration_date?: string | null
          trial_extended_by_matt?: boolean | null
          trial_extended_date?: string | null
          trial_start_date?: string | null
          trial_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_balance?: number | null
          created_at?: string | null
          held_balance?: number | null
          id?: string
          total_free_bug_fixes_used?: number | null
          total_lifetime_spent?: number | null
          trial_expiration_date?: string | null
          trial_extended_by_matt?: boolean | null
          trial_extended_date?: string | null
          trial_start_date?: string | null
          trial_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_environment_variables: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_provided: boolean | null
          is_required: boolean | null
          key: string
          project_id: string
          updated_at: string | null
          user_id: string
          value_encrypted: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_provided?: boolean | null
          is_required?: boolean | null
          key: string
          project_id: string
          updated_at?: string | null
          user_id: string
          value_encrypted: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_provided?: boolean | null
          is_required?: boolean | null
          key?: string
          project_id?: string
          updated_at?: string | null
          user_id?: string
          value_encrypted?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_environment_variables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      client_preferences: {
        Row: {
          auto_preview_navigation: boolean | null
          chat_history_mode: string | null
          code_font_size: number | null
          created_at: string | null
          deployment_preference: string | null
          id: string
          input_font_size: number | null
          manual_review_required_by_default: boolean | null
          one_change_per_turn_strict: boolean | null
          output_font_size: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_preview_navigation?: boolean | null
          chat_history_mode?: string | null
          code_font_size?: number | null
          created_at?: string | null
          deployment_preference?: string | null
          id?: string
          input_font_size?: number | null
          manual_review_required_by_default?: boolean | null
          one_change_per_turn_strict?: boolean | null
          output_font_size?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_preview_navigation?: boolean | null
          chat_history_mode?: string | null
          code_font_size?: number | null
          created_at?: string | null
          deployment_preference?: string | null
          id?: string
          input_font_size?: number | null
          manual_review_required_by_default?: boolean | null
          one_change_per_turn_strict?: boolean | null
          output_font_size?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_projects: {
        Row: {
          connection_status: string | null
          created_at: string | null
          framework: string | null
          github_default_branch: string | null
          github_installation_id: number | null
          github_owner: string | null
          github_repo_name: string | null
          github_repo_url: string | null
          github_repository_id: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          package_manager: string | null
          project_name: string
          updated_at: string | null
          user_id: string
          vercel_production_url: string | null
          vercel_project_id: string | null
          vercel_project_name: string | null
          vercel_team_id: string | null
        }
        Insert: {
          connection_status?: string | null
          created_at?: string | null
          framework?: string | null
          github_default_branch?: string | null
          github_installation_id?: number | null
          github_owner?: string | null
          github_repo_name?: string | null
          github_repo_url?: string | null
          github_repository_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          package_manager?: string | null
          project_name: string
          updated_at?: string | null
          user_id: string
          vercel_production_url?: string | null
          vercel_project_id?: string | null
          vercel_project_name?: string | null
          vercel_team_id?: string | null
        }
        Update: {
          connection_status?: string | null
          created_at?: string | null
          framework?: string | null
          github_default_branch?: string | null
          github_installation_id?: number | null
          github_owner?: string | null
          github_repo_name?: string | null
          github_repo_url?: string | null
          github_repository_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          package_manager?: string | null
          project_name?: string
          updated_at?: string | null
          user_id?: string
          vercel_production_url?: string | null
          vercel_project_id?: string | null
          vercel_project_name?: string | null
          vercel_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_projects_github_repository_id_fkey"
            columns: ["github_repository_id"]
            isOneToOne: false
            referencedRelation: "github_repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      client_service_credentials: {
        Row: {
          access_token_encrypted: string | null
          api_key_encrypted: string | null
          api_secret_encrypted: string | null
          created_at: string | null
          id: string
          is_valid: boolean | null
          last_validated_at: string | null
          metadata: Json | null
          project_id: string | null
          refresh_token_encrypted: string | null
          service_name: string
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          metadata?: Json | null
          project_id?: string | null
          refresh_token_encrypted?: string | null
          service_name: string
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          metadata?: Json | null
          project_id?: string | null
          refresh_token_encrypted?: string | null
          service_name?: string
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_service_credentials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      client_uploaded_images: {
        Row: {
          client_account_id: string
          conversation_id: string | null
          file_path: string
          file_size_bytes: number
          height: number | null
          id: string
          mime_type: string
          original_filename: string
          stored_filename: string
          uploaded_at: string | null
          width: number | null
        }
        Insert: {
          client_account_id: string
          conversation_id?: string | null
          file_path: string
          file_size_bytes: number
          height?: number | null
          id?: string
          mime_type: string
          original_filename: string
          stored_filename: string
          uploaded_at?: string | null
          width?: number | null
        }
        Update: {
          client_account_id?: string
          conversation_id?: string | null
          file_path?: string
          file_size_bytes?: number
          height?: number | null
          id?: string
          mime_type?: string
          original_filename?: string
          stored_filename?: string
          uploaded_at?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_uploaded_images_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_account_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_uploaded_images_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_uploaded_images_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "top_clients_by_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_uploaded_images_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "revision_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_website_config: {
        Row: {
          client_account_id: string
          created_at: string | null
          github_branch: string | null
          github_repo_url: string | null
          id: string
          images_folder_path: string | null
          is_configured: boolean | null
          public_folder_path: string | null
          updated_at: string | null
          vercel_project_name: string | null
          vercel_team_slug: string | null
          website_url: string | null
        }
        Insert: {
          client_account_id: string
          created_at?: string | null
          github_branch?: string | null
          github_repo_url?: string | null
          id?: string
          images_folder_path?: string | null
          is_configured?: boolean | null
          public_folder_path?: string | null
          updated_at?: string | null
          vercel_project_name?: string | null
          vercel_team_slug?: string | null
          website_url?: string | null
        }
        Update: {
          client_account_id?: string
          created_at?: string | null
          github_branch?: string | null
          github_repo_url?: string | null
          id?: string
          images_folder_path?: string | null
          is_configured?: boolean | null
          public_folder_path?: string | null
          updated_at?: string | null
          vercel_project_name?: string | null
          vercel_team_slug?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_website_config_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: true
            referencedRelation: "client_account_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_website_config_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: true
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_website_config_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: true
            referencedRelation: "top_clients_by_activity"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_services: {
        Row: {
          access_token_encrypted: string | null
          client_account_id: string
          created_at: string | null
          id: string
          is_connected: boolean | null
          metadata: Json | null
          refresh_token_encrypted: string | null
          service_type: string
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          client_account_id: string
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          metadata?: Json | null
          refresh_token_encrypted?: string | null
          service_type: string
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          client_account_id?: string
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          metadata?: Json | null
          refresh_token_encrypted?: string | null
          service_type?: string
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connected_services_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_account_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connected_services_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connected_services_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "top_clients_by_activity"
            referencedColumns: ["id"]
          },
        ]
      }
      database_backups: {
        Row: {
          backup_data: Json
          backup_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_restorable: boolean | null
          metadata: Json | null
          record_count: number | null
          restored_by_user_at: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          backup_data: Json
          backup_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_restorable?: boolean | null
          metadata?: Json | null
          record_count?: number | null
          restored_by_user_at?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          backup_data?: Json
          backup_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_restorable?: boolean | null
          metadata?: Json | null
          record_count?: number | null
          restored_by_user_at?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      database_work_requests: {
        Row: {
          actual_cost: number | null
          client_option: string
          completed_at: string | null
          conversation_id: string
          created_at: string | null
          estimated_cost: number | null
          id: string
          implementation_prompt: string | null
          manual_testing_cost: number | null
          manual_testing_hours: number | null
          request_description: string
          status: string | null
          testing_checklist: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          client_option: string
          completed_at?: string | null
          conversation_id: string
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          implementation_prompt?: string | null
          manual_testing_cost?: number | null
          manual_testing_hours?: number | null
          request_description: string
          status?: string | null
          testing_checklist?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          client_option?: string
          completed_at?: string | null
          conversation_id?: string
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          implementation_prompt?: string | null
          manual_testing_cost?: number | null
          manual_testing_hours?: number | null
          request_description?: string
          status?: string | null
          testing_checklist?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "database_work_requests_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "revision_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_history: {
        Row: {
          branch_name: string | null
          changes_summary: string | null
          commit_sha: string | null
          conversation_id: string
          created_at: string | null
          deployed_at: string | null
          deployed_by: string | null
          deployment_id: string | null
          deployment_status: string | null
          deployment_url: string | null
          github_branch_merged: string | null
          id: string
          project_id: string | null
          user_id: string
          vercel_deployment_url: string | null
        }
        Insert: {
          branch_name?: string | null
          changes_summary?: string | null
          commit_sha?: string | null
          conversation_id: string
          created_at?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          deployment_id?: string | null
          deployment_status?: string | null
          deployment_url?: string | null
          github_branch_merged?: string | null
          id?: string
          project_id?: string | null
          user_id: string
          vercel_deployment_url?: string | null
        }
        Update: {
          branch_name?: string | null
          changes_summary?: string | null
          commit_sha?: string | null
          conversation_id?: string
          created_at?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          deployment_id?: string | null
          deployment_status?: string | null
          deployment_url?: string | null
          github_branch_merged?: string | null
          id?: string
          project_id?: string | null
          user_id?: string
          vercel_deployment_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_history_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "revision_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_notifications: {
        Row: {
          acknowledged_at: string | null
          action_url: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          message: string
          notification_type: string
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          action_url?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          notification_type: string
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          action_url?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          notification_type?: string
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_notifications_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "revision_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string | null
          content_template: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          subject_template: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content_template: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject_template: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content_template?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject_template?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          client_email: string
          client_name: string
          created_at: string
          date_submitted: string
          detailed_instructions: string
          form_type: string
          id: string
          internal_notes: string | null
          revision_status: string | null
          selected_items: Json | null
          status: string
          topic_1_details: string | null
          topic_1_name: string | null
          topic_2_details: string | null
          topic_2_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_email: string
          client_name: string
          created_at?: string
          date_submitted?: string
          detailed_instructions: string
          form_type: string
          id?: string
          internal_notes?: string | null
          revision_status?: string | null
          selected_items?: Json | null
          status?: string
          topic_1_details?: string | null
          topic_1_name?: string | null
          topic_2_details?: string | null
          topic_2_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_email?: string
          client_name?: string
          created_at?: string
          date_submitted?: string
          detailed_instructions?: string
          form_type?: string
          id?: string
          internal_notes?: string | null
          revision_status?: string | null
          selected_items?: Json | null
          status?: string
          topic_1_details?: string | null
          topic_1_name?: string | null
          topic_2_details?: string | null
          topic_2_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      github_installations: {
        Row: {
          account_login: string
          account_type: string
          created_at: string | null
          id: string
          installation_id: number
          suspended_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_login: string
          account_type: string
          created_at?: string | null
          id?: string
          installation_id: number
          suspended_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_login?: string
          account_type?: string
          created_at?: string | null
          id?: string
          installation_id?: number
          suspended_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      github_oauth_tokens: {
        Row: {
          access_token_encrypted: string
          created_at: string | null
          github_login: string
          github_user_id: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          created_at?: string | null
          github_login: string
          github_user_id: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          created_at?: string | null
          github_login?: string
          github_user_id?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      github_repositories: {
        Row: {
          created_at: string | null
          default_branch: string | null
          full_name: string
          html_url: string
          id: string
          installation_id: number
          language: string | null
          owner: string
          private: boolean | null
          repository_id: number
          repository_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_branch?: string | null
          full_name: string
          html_url: string
          id?: string
          installation_id: number
          language?: string | null
          owner: string
          private?: boolean | null
          repository_id: number
          repository_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_branch?: string | null
          full_name?: string
          html_url?: string
          id?: string
          installation_id?: number
          language?: string | null
          owner?: string
          private?: boolean | null
          repository_id?: number
          repository_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invite_tokens: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string
          full_name: string | null
          id: string
          tier: string | null
          token: string
          updated_at: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          expires_at: string
          full_name?: string | null
          id?: string
          tier?: string | null
          token: string
          updated_at?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          tier?: string | null
          token?: string
          updated_at?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          converted_at: string | null
          created_at: string | null
          custom_fields: Json | null
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          last_engagement: string | null
          last_name: string | null
          name: string | null
          notes: string | null
          referrer_url: string | null
          signup_date: string | null
          source: string | null
          status: string | null
          tags: Json | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          wants_ownership: boolean | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          display_name?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_engagement?: string | null
          last_name?: string | null
          name?: string | null
          notes?: string | null
          referrer_url?: string | null
          signup_date?: string | null
          source?: string | null
          status?: string | null
          tags?: Json | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          wants_ownership?: boolean | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_engagement?: string | null
          last_name?: string | null
          name?: string | null
          notes?: string | null
          referrer_url?: string | null
          signup_date?: string | null
          source?: string | null
          status?: string | null
          tags?: Json | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          wants_ownership?: boolean | null
        }
        Relationships: []
      }
      lighthouse_scores: {
        Row: {
          accessibility: number | null
          best_practices: number | null
          created_at: string | null
          id: string
          overall_score: number | null
          page_id: string | null
          performance: number | null
          pwa: number | null
          raw_data: Json | null
          seo: number | null
          test_notes: string | null
          tested_at: string | null
          tested_by: string | null
          tested_url: string | null
          user_id: string
        }
        Insert: {
          accessibility?: number | null
          best_practices?: number | null
          created_at?: string | null
          id?: string
          overall_score?: number | null
          page_id?: string | null
          performance?: number | null
          pwa?: number | null
          raw_data?: Json | null
          seo?: number | null
          test_notes?: string | null
          tested_at?: string | null
          tested_by?: string | null
          tested_url?: string | null
          user_id: string
        }
        Update: {
          accessibility?: number | null
          best_practices?: number | null
          created_at?: string | null
          id?: string
          overall_score?: number | null
          page_id?: string | null
          performance?: number | null
          pwa?: number | null
          raw_data?: Json | null
          seo?: number | null
          test_notes?: string | null
          tested_at?: string | null
          tested_by?: string | null
          tested_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_scores_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "website_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lighthouse_scores_tested_by_fkey"
            columns: ["tested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lighthouse_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_last4: string | null
          account_type: string | null
          bank_name: string | null
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          client_account_id: string
          created_at: string | null
          id: string
          is_default: boolean | null
          payment_type: string
          stripe_payment_method_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_last4?: string | null
          account_type?: string | null
          bank_name?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          client_account_id: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          payment_type: string
          stripe_payment_method_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_last4?: string | null
          account_type?: string | null
          bank_name?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          client_account_id?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          payment_type?: string
          stripe_payment_method_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_account_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_methods_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "client_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_methods_client_account_id_fkey"
            columns: ["client_account_id"]
            isOneToOne: false
            referencedRelation: "top_clients_by_activity"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_code_changes: {
        Row: {
          approved_at: string | null
          branch_name: string
          change_type: string
          commit_sha: string | null
          committed_at: string | null
          conversation_id: string
          created_at: string | null
          description: string | null
          file_path: string
          file_sha: string | null
          full_file_content: string | null
          id: string
          new_content: string | null
          old_content: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          branch_name: string
          change_type: string
          commit_sha?: string | null
          committed_at?: string | null
          conversation_id: string
          created_at?: string | null
          description?: string | null
          file_path: string
          file_sha?: string | null
          full_file_content?: string | null
          id?: string
          new_content?: string | null
          old_content?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          branch_name?: string
          change_type?: string
          commit_sha?: string | null
          committed_at?: string | null
          conversation_id?: string
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_sha?: string | null
          full_file_content?: string | null
          id?: string
          new_content?: string | null
          old_content?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_code_changes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "revision_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_contents: {
        Row: {
          category: string
          claude_command: string | null
          content_type_id: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          file_urls: Json | null
          id: string
          implementation_time: string | null
          name: string
          prerequisites: Json | null
          price_individual: number | null
          product_id: string | null
          slug: string
          sort_order: number | null
          time_saved_max: number | null
          time_saved_min: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category: string
          claude_command?: string | null
          content_type_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          file_urls?: Json | null
          id?: string
          implementation_time?: string | null
          name: string
          prerequisites?: Json | null
          price_individual?: number | null
          product_id?: string | null
          slug: string
          sort_order?: number | null
          time_saved_max?: number | null
          time_saved_min?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string
          claude_command?: string | null
          content_type_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          file_urls?: Json | null
          id?: string
          implementation_time?: string | null
          name?: string
          prerequisites?: Json | null
          price_individual?: number | null
          product_id?: string | null
          slug?: string
          sort_order?: number | null
          time_saved_max?: number | null
          time_saved_min?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_contents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number
          slug: string
          status: string | null
          stripe_lookup_key: string | null
          stripe_price_id: string | null
          total_purchases: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price: number
          slug: string
          status?: string | null
          stripe_lookup_key?: string | null
          stripe_price_id?: string | null
          total_purchases?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number
          slug?: string
          status?: string | null
          stripe_lookup_key?: string | null
          stripe_price_id?: string | null
          total_purchases?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          access_granted: boolean | null
          amount_paid: number | null
          id: string
          product_id: string | null
          product_slug: string | null
          purchased_at: string | null
          status: string | null
          stripe_payment_intent: string | null
          user_id: string | null
        }
        Insert: {
          access_granted?: boolean | null
          amount_paid?: number | null
          id?: string
          product_id?: string | null
          product_slug?: string | null
          purchased_at?: string | null
          status?: string | null
          stripe_payment_intent?: string | null
          user_id?: string | null
        }
        Update: {
          access_granted?: boolean | null
          amount_paid?: number | null
          id?: string
          product_id?: string | null
          product_slug?: string | null
          purchased_at?: string | null
          status?: string | null
          stripe_payment_intent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          minimum_payout: number | null
          paid_out: number | null
          pending_payout: number | null
          referral_code: string
          total_clicks: number | null
          total_conversions: number | null
          total_earnings: number | null
          user_email: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_payout?: number | null
          paid_out?: number | null
          pending_payout?: number | null
          referral_code: string
          total_clicks?: number | null
          total_conversions?: number | null
          total_earnings?: number | null
          user_email: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_payout?: number | null
          paid_out?: number | null
          pending_payout?: number | null
          referral_code?: string
          total_clicks?: number | null
          total_conversions?: number | null
          total_earnings?: number | null
          user_email?: string
        }
        Relationships: []
      }
      revision_chat_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          cumulative_tokens_this_conversation: number | null
          id: string
          includes_code_preview: boolean | null
          includes_preview_url: boolean | null
          is_final_approval: boolean | null
          message_text: string
          message_type: string
          tokens_in: number | null
          tokens_out: number | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          cumulative_tokens_this_conversation?: number | null
          id?: string
          includes_code_preview?: boolean | null
          includes_preview_url?: boolean | null
          is_final_approval?: boolean | null
          message_text: string
          message_type: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          cumulative_tokens_this_conversation?: number | null
          id?: string
          includes_code_preview?: boolean | null
          includes_preview_url?: boolean | null
          is_final_approval?: boolean | null
          message_text?: string
          message_type?: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "revision_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_conversations: {
        Row: {
          conversation_type: string
          cost_usd: number | null
          created_at: string | null
          deployment_status: string | null
          id: string
          is_trial_period: boolean
          preview_branch_name: string | null
          preview_url: string | null
          project_id: string | null
          status: string | null
          tokens_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_type: string
          cost_usd?: number | null
          created_at?: string | null
          deployment_status?: string | null
          id?: string
          is_trial_period: boolean
          preview_branch_name?: string | null
          preview_url?: string | null
          project_id?: string | null
          status?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_type?: string
          cost_usd?: number | null
          created_at?: string | null
          deployment_status?: string | null
          id?: string
          is_trial_period?: boolean
          preview_branch_name?: string | null
          preview_url?: string | null
          project_id?: string | null
          status?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          arrangement: number | null
          avatar: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          rating: number | null
          source: string | null
          status: string | null
          submitted_date: string | null
          testimonial: string
          title_role: string | null
          updated_date: string | null
        }
        Insert: {
          arrangement?: number | null
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          rating?: number | null
          source?: string | null
          status?: string | null
          submitted_date?: string | null
          testimonial: string
          title_role?: string | null
          updated_date?: string | null
        }
        Update: {
          arrangement?: number | null
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          rating?: number | null
          source?: string | null
          status?: string | null
          submitted_date?: string | null
          testimonial?: string
          title_role?: string | null
          updated_date?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          chat_font: string | null
          claude_context: string | null
          claude_instructions: string | null
          created_at: string | null
          id: string
          notification_deployments: boolean | null
          notification_email: boolean | null
          notification_errors: boolean | null
          profile_icon_url: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
          username_for_claude: string | null
        }
        Insert: {
          chat_font?: string | null
          claude_context?: string | null
          claude_instructions?: string | null
          created_at?: string | null
          id?: string
          notification_deployments?: boolean | null
          notification_email?: boolean | null
          notification_errors?: boolean | null
          profile_icon_url?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          username_for_claude?: string | null
        }
        Update: {
          chat_font?: string | null
          claude_context?: string | null
          claude_instructions?: string | null
          created_at?: string | null
          id?: string
          notification_deployments?: boolean | null
          notification_email?: boolean | null
          notification_errors?: boolean | null
          profile_icon_url?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          username_for_claude?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          affiliate_tier_id: string | null
          ai_model_tier: string | null
          available_ai_credits: number | null
          created_at: string | null
          data_retention_expires_at: string | null
          email: string
          email_verified: boolean | null
          free_tokens_claimed: boolean | null
          free_tokens_claimed_at: string | null
          free_tokens_used: boolean | null
          free_tokens_used_at: string | null
          full_name: string | null
          has_purchased: boolean | null
          highest_tier_purchased: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          payment_method_id: string | null
          payment_status: string | null
          phone_number: string | null
          purchased_at: string | null
          referral_code: string | null
          referred_by_code: string | null
          role: string | null
          sms_consent: boolean | null
          sms_consent_timestamp: string | null
          tech_stack_preferences: Json | null
          tier: string | null
          total_ai_credits: number | null
          total_spent: number | null
          updated_at: string | null
          used_ai_credits: number | null
          website_url: string | null
          youtube_playlist_id: string | null
        }
        Insert: {
          affiliate_tier_id?: string | null
          ai_model_tier?: string | null
          available_ai_credits?: number | null
          created_at?: string | null
          data_retention_expires_at?: string | null
          email: string
          email_verified?: boolean | null
          free_tokens_claimed?: boolean | null
          free_tokens_claimed_at?: string | null
          free_tokens_used?: boolean | null
          free_tokens_used_at?: string | null
          full_name?: string | null
          has_purchased?: boolean | null
          highest_tier_purchased?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          phone_number?: string | null
          purchased_at?: string | null
          referral_code?: string | null
          referred_by_code?: string | null
          role?: string | null
          sms_consent?: boolean | null
          sms_consent_timestamp?: string | null
          tech_stack_preferences?: Json | null
          tier?: string | null
          total_ai_credits?: number | null
          total_spent?: number | null
          updated_at?: string | null
          used_ai_credits?: number | null
          website_url?: string | null
          youtube_playlist_id?: string | null
        }
        Update: {
          affiliate_tier_id?: string | null
          ai_model_tier?: string | null
          available_ai_credits?: number | null
          created_at?: string | null
          data_retention_expires_at?: string | null
          email?: string
          email_verified?: boolean | null
          free_tokens_claimed?: boolean | null
          free_tokens_claimed_at?: string | null
          free_tokens_used?: boolean | null
          free_tokens_used_at?: string | null
          full_name?: string | null
          has_purchased?: boolean | null
          highest_tier_purchased?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          phone_number?: string | null
          purchased_at?: string | null
          referral_code?: string | null
          referred_by_code?: string | null
          role?: string | null
          sms_consent?: boolean | null
          sms_consent_timestamp?: string | null
          tech_stack_preferences?: Json | null
          tier?: string | null
          total_ai_credits?: number | null
          total_spent?: number | null
          updated_at?: string | null
          used_ai_credits?: number | null
          website_url?: string | null
          youtube_playlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      website_pages: {
        Row: {
          created_at: string | null
          full_url: string | null
          id: string
          is_primary: boolean | null
          order_index: number
          page_name: string
          page_path: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          full_url?: string | null
          id?: string
          is_primary?: boolean | null
          order_index?: number
          page_name: string
          page_path: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          full_url?: string | null
          id?: string
          is_primary?: boolean | null
          order_index?: number
          page_name?: string
          page_path?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_pages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      client_account_summary: {
        Row: {
          account_balance: number | null
          held_balance: number | null
          id: string | null
          total_conversations: number | null
          total_lifetime_spent: number | null
          total_messages: number | null
          total_tokens_used: number | null
          trial_expiration_date: string | null
          trial_status: string | null
          user_id: string | null
        }
        Relationships: []
      }
      daily_activity: {
        Row: {
          activity_date: string | null
          conversations: number | null
          messages: number | null
          total_tokens: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      top_clients_by_activity: {
        Row: {
          conversation_count: number | null
          email: string | null
          id: string | null
          last_activity: string | null
          message_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_attendance_points: {
        Args: { p_points?: number; p_user_id: string }
        Returns: undefined
      }
      add_bonus_points:
        | { Args: { p_points: number; p_user_id: string }; Returns: undefined }
        | {
            Args: { p_points: number; p_reason: string; p_user_id: string }
            Returns: undefined
          }
      add_engagement_points:
        | { Args: { p_points: number; p_user_id: string }; Returns: undefined }
        | {
            Args: { p_points: number; p_reason: string; p_user_id: string }
            Returns: undefined
          }
      add_funds: {
        Args: { account_id: string; amount: number }
        Returns: undefined
      }
      add_referral_cash_points: {
        Args: { p_points?: number; p_user_id: string }
        Returns: undefined
      }
      add_referral_signup_points: {
        Args: { p_points?: number; p_user_id: string }
        Returns: undefined
      }
      calculate_affiliate_commission: {
        Args: { p_purchase_amount: number; p_referrer_id: string }
        Returns: {
          commission_amount: number
          commission_percentage: number
        }[]
      }
      calculate_referral_commission: {
        Args: { purchase_amount: number; referral_code_param: string }
        Returns: number
      }
      can_user_modify_demo: {
        Args: { p_demo_project_id: string; p_user_email: string }
        Returns: boolean
      }
      check_preview_limit: { Args: { check_email: string }; Returns: boolean }
      clean_expired_backups: { Args: never; Returns: undefined }
      cleanup_expired_demos: { Args: never; Returns: number }
      cleanup_expired_invite_tokens: { Args: never; Returns: number }
      cleanup_expired_verification_codes: { Args: never; Returns: undefined }
      convert_lead_to_user: {
        Args: { lead_email: string; user_tier?: string }
        Returns: boolean
      }
      decrement_balance: {
        Args: { account_id: string; amount: number }
        Returns: number
      }
      demo_time_remaining: { Args: { demo_id: string }; Returns: string }
      generate_referral_code: { Args: { user_email: string }; Returns: string }
      get_active_template_with_categories: {
        Args: never
        Returns: {
          level1_name: string
          level2_name: string
          level3_name: string
          template_id: string
          template_name: string
          template_slug: string
        }[]
      }
      get_latest_lighthouse_scores: {
        Args: { p_user_id: string }
        Returns: {
          accessibility: number
          best_practices: number
          overall_score: number
          page_id: string
          page_name: string
          page_path: string
          performance: number
          pwa: number
          seo: number
          tested_at: string
        }[]
      }
      get_tier_permissions: { Args: { p_tier: string }; Returns: Json }
      get_user_ai_credits: {
        Args: { user_email_param: string }
        Returns: {
          available: number
          total: number
          used: number
        }[]
      }
      hold_balance: {
        Args: { account_id: string; amount: number }
        Returns: boolean
      }
      increment_campaign_clicks: {
        Args: { campaign_id: string }
        Returns: undefined
      }
      increment_campaign_opens: {
        Args: { campaign_id: string }
        Returns: undefined
      }
      increment_modification_count: {
        Args: { p_demo_project_id: string }
        Returns: undefined
      }
      increment_product_purchases: {
        Args: { product_id: string }
        Returns: undefined
      }
      increment_referral_clicks: { Args: { code: string }; Returns: undefined }
      is_demo_expired: { Args: { demo_id: string }; Returns: boolean }
      link_demo_to_user: {
        Args: { p_demo_project_id: string; p_user_id: string }
        Returns: boolean
      }
      log_ai_interaction: {
        Args: {
          p_credits_used?: number
          p_demo_session_id?: string
          p_interaction_type: string
          p_prompt: string
          p_response?: string
          p_user_email: string
        }
        Returns: string
      }
      mark_badge_click_converted: {
        Args: {
          p_badge_click_id: string
          p_referee_email: string
          p_referee_id: string
        }
        Returns: undefined
      }
      refund_held_balance: {
        Args: { account_id: string; amount: number }
        Returns: boolean
      }
      release_held_balance: {
        Args: { account_id: string; amount: number }
        Returns: boolean
      }
      track_demo_interaction: {
        Args: {
          p_demo_project_id: string
          p_interaction_type: string
          p_metadata?: Json
        }
        Returns: string
      }
      update_user_ai_credits: {
        Args: { credits_to_add: number; user_email_param: string }
        Returns: undefined
      }
      update_user_total_spent: {
        Args: { amount_param: number; user_email_param: string }
        Returns: undefined
      }
      use_ai_credit: {
        Args: { credits_to_use?: number; user_email_param: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
