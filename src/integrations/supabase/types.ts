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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_communications: {
        Row: {
          content: string
          content_type: string | null
          created_at: string | null
          created_by: string
          delivery_channels: string[]
          email_subject: string | null
          id: string
          metadata: Json | null
          priority: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          target_roles: string[]
          template_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          content_type?: string | null
          created_at?: string | null
          created_by: string
          delivery_channels?: string[]
          email_subject?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          target_roles: string[]
          template_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          content_type?: string | null
          created_at?: string | null
          created_by?: string
          delivery_channels?: string[]
          email_subject?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          target_roles?: string[]
          template_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_encrypted: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      ai_generated_solutions: {
        Row: {
          architecture_flowchart: Json | null
          completion_percentage: number | null
          completion_tokens: number | null
          created_at: string | null
          data_flow_diagram: Json | null
          framework_mapping: Json | null
          generation_model: string | null
          generation_time_ms: number | null
          id: string
          implementation_checklist: Json | null
          implementation_status: string | null
          is_complete: boolean | null
          is_favorited: boolean | null
          last_accessed_at: string | null
          lovable_prompt: string | null
          mind_map: Json | null
          original_idea: string
          prompt_tokens: number | null
          required_tools: Json | null
          short_description: string | null
          technical_stack_diagram: Json | null
          title: string | null
          updated_at: string | null
          user_id: string
          user_journey_map: Json | null
        }
        Insert: {
          architecture_flowchart?: Json | null
          completion_percentage?: number | null
          completion_tokens?: number | null
          created_at?: string | null
          data_flow_diagram?: Json | null
          framework_mapping?: Json | null
          generation_model?: string | null
          generation_time_ms?: number | null
          id?: string
          implementation_checklist?: Json | null
          implementation_status?: string | null
          is_complete?: boolean | null
          is_favorited?: boolean | null
          last_accessed_at?: string | null
          lovable_prompt?: string | null
          mind_map?: Json | null
          original_idea: string
          prompt_tokens?: number | null
          required_tools?: Json | null
          short_description?: string | null
          technical_stack_diagram?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          user_journey_map?: Json | null
        }
        Update: {
          architecture_flowchart?: Json | null
          completion_percentage?: number | null
          completion_tokens?: number | null
          created_at?: string | null
          data_flow_diagram?: Json | null
          framework_mapping?: Json | null
          generation_model?: string | null
          generation_time_ms?: number | null
          id?: string
          implementation_checklist?: Json | null
          implementation_status?: string | null
          is_complete?: boolean | null
          is_favorited?: boolean | null
          last_accessed_at?: string | null
          lovable_prompt?: string | null
          mind_map?: Json | null
          original_idea?: string
          prompt_tokens?: number | null
          required_tools?: Json | null
          short_description?: string | null
          technical_stack_diagram?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          user_journey_map?: Json | null
        }
        Relationships: []
      }
      ai_solution_usage: {
        Row: {
          created_at: string | null
          generations_count: number | null
          id: string
          last_generation_at: string | null
          month_year: string
          monthly_limit: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          generations_count?: number | null
          id?: string
          last_generation_at?: string | null
          month_year: string
          monthly_limit?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          generations_count?: number | null
          id?: string
          last_generation_at?: string | null
          month_year?: string
          monthly_limit?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          module_id: string | null
          solution_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          module_id?: string | null
          solution_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          module_id?: string | null
          solution_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_backups: {
        Row: {
          backup_data: Json
          backup_reason: string
          created_at: string
          id: string
          record_count: number
          table_name: string
        }
        Insert: {
          backup_data: Json
          backup_reason: string
          created_at?: string
          id?: string
          record_count?: number
          table_name: string
        }
        Update: {
          backup_data?: Json
          backup_reason?: string
          created_at?: string
          id?: string
          record_count?: number
          table_name?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          resource_id: string | null
          session_id: string | null
          severity: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          session_id?: string | null
          severity?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          session_id?: string | null
          severity?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_interventions: {
        Row: {
          action_taken: string
          created_at: string
          executed_at: string | null
          id: string
          intervention_type: string
          metadata: Json | null
          scheduled_for: string | null
          status: string
          trigger_condition: string
          user_id: string
        }
        Insert: {
          action_taken: string
          created_at?: string
          executed_at?: string | null
          id?: string
          intervention_type: string
          metadata?: Json | null
          scheduled_for?: string | null
          status?: string
          trigger_condition: string
          user_id: string
        }
        Update: {
          action_taken?: string
          created_at?: string
          executed_at?: string | null
          id?: string
          intervention_type?: string
          metadata?: Json | null
          scheduled_for?: string | null
          status?: string
          trigger_condition?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          executed_actions: Json
          execution_time_ms: number | null
          id: string
          rule_id: string | null
          status: string
          trigger_data: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          executed_actions?: Json
          execution_time_ms?: number | null
          id?: string
          rule_id?: string | null
          status?: string
          trigger_data?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          executed_actions?: Json
          execution_time_ms?: number | null
          id?: string
          rule_id?: string | null
          status?: string
          trigger_data?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          rule_type: string
          updated_at: string
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          rule_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          rule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      benefit_access_control: {
        Row: {
          created_at: string
          id: string
          role_id: string
          tool_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          tool_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_access_control_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_access_control_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_clicks: {
        Row: {
          benefit_link: string
          clicked_at: string | null
          id: string
          tool_id: string
          user_id: string
        }
        Insert: {
          benefit_link: string
          clicked_at?: string | null
          id?: string
          tool_id: string
          user_id: string
        }
        Update: {
          benefit_link?: string
          clicked_at?: string | null
          id?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefit_clicks_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_invites: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          invite_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          invite_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          invite_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_invites_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "invite_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_invites_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_files: {
        Row: {
          certificate_id: string
          created_at: string | null
          file_path: string
          file_size: number | null
          file_url: string | null
          id: string
          mime_type: string | null
          updated_at: string | null
        }
        Insert: {
          certificate_id: string
          created_at?: string | null
          file_path: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          updated_at?: string | null
        }
        Update: {
          certificate_id?: string
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificate_files_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "solution_certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_deliveries: {
        Row: {
          clicked_at: string | null
          communication_id: string
          delivered_at: string | null
          delivery_channel: string
          error_message: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          communication_id: string
          delivered_at?: string | null
          delivery_channel: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          communication_id?: string
          delivered_at?: string | null
          delivery_channel?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_deliveries_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "admin_communications"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean | null
          id: string
          preferred_channel: string | null
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          preferred_channel?: string | null
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          preferred_channel?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      community_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          slug: string
          topic_count: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          slug: string
          topic_count?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          slug?: string
          topic_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_hidden: boolean | null
          is_solution: boolean | null
          likes_count: number | null
          parent_id: string | null
          topic_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          is_solution?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          topic_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          is_solution?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          topic_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "community_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          post_id: string | null
          reason: string
          report_type: string
          reported_user_id: string | null
          reporter_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          topic_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          post_id?: string | null
          reason: string
          report_type: string
          reported_user_id?: string | null
          reporter_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          report_type?: string
          reported_user_id?: string | null
          reporter_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_community_reports_reported_user_id"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_community_reports_reported_user_id"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_community_reports_reported_user_id"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_community_reports_reporter_id"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_community_reports_reporter_id"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_community_reports_reporter_id"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_community_reports_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_community_reports_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_community_reports_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      community_topics: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          is_solved: boolean | null
          last_activity_at: string | null
          reply_count: number | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          is_solved?: boolean | null
          last_activity_at?: string | null
          reply_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          is_solved?: boolean | null
          last_activity_at?: string | null
          reply_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_interactions: {
        Row: {
          connection_id: string | null
          created_at: string | null
          created_by: string | null
          estimated_value: number | null
          id: string
          interaction_type: string
          interaction_value: Json | null
          match_id: string | null
        }
        Insert: {
          connection_id?: string | null
          created_at?: string | null
          created_by?: string | null
          estimated_value?: number | null
          id?: string
          interaction_type: string
          interaction_value?: Json | null
          match_id?: string | null
        }
        Update: {
          connection_id?: string | null
          created_at?: string | null
          created_by?: string | null
          estimated_value?: number | null
          id?: string
          interaction_type?: string
          interaction_value?: Json | null
          match_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connection_interactions_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "member_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_interactions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "strategic_matches_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          updated_at: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      course_access_control: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          role_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          role_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_access_control_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_access_control_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_durations: {
        Row: {
          calculated_hours: string
          course_id: string
          created_at: string
          id: string
          last_sync_at: string | null
          sync_status: string
          synced_videos: number
          total_duration_seconds: number
          total_videos: number
          updated_at: string
        }
        Insert: {
          calculated_hours?: string
          course_id: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          sync_status?: string
          synced_videos?: number
          total_duration_seconds?: number
          total_videos?: number
          updated_at?: string
        }
        Update: {
          calculated_hours?: string
          course_id?: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          sync_status?: string
          synced_videos?: number
          total_duration_seconds?: number
          total_videos?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_durations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          deleted_at: string | null
          delivered_at: string | null
          edited_at: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          recipient_id: string
          reply_to_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          deleted_at?: string | null
          delivered_at?: string | null
          edited_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          recipient_id: string
          reply_to_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          delivered_at?: string | null
          edited_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          reply_to_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          email: string
          external_id: string | null
          failed_at: string | null
          html_content: string
          html_content_encrypted: string | null
          id: string
          invite_id: string | null
          last_attempt_at: string | null
          last_error: string | null
          priority: number | null
          retry_after: string | null
          sent_at: string | null
          status: string | null
          subject: string
          subject_encrypted: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email: string
          external_id?: string | null
          failed_at?: string | null
          html_content: string
          html_content_encrypted?: string | null
          id?: string
          invite_id?: string | null
          last_attempt_at?: string | null
          last_error?: string | null
          priority?: number | null
          retry_after?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          subject_encrypted?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email?: string
          external_id?: string | null
          failed_at?: string | null
          html_content?: string
          html_content_encrypted?: string | null
          id?: string
          invite_id?: string | null
          last_attempt_at?: string | null
          last_error?: string | null
          priority?: number | null
          retry_after?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          subject_encrypted?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
        ]
      }
      event_access_control: {
        Row: {
          created_at: string
          event_id: string
          id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          role_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_access_control_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_access_control_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          reminder_type: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          reminder_type: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          reminder_type?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          id: string
          is_recurring: boolean | null
          location_link: string | null
          parent_event_id: string | null
          physical_location: string | null
          recurrence_count: number | null
          recurrence_day: number | null
          recurrence_end_date: string | null
          recurrence_interval: number | null
          recurrence_pattern: string | null
          start_time: string
          title: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          is_recurring?: boolean | null
          location_link?: string | null
          parent_event_id?: string | null
          physical_location?: string | null
          recurrence_count?: number | null
          recurrence_day?: number | null
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_pattern?: string | null
          start_time: string
          title: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          location_link?: string | null
          parent_event_id?: string | null
          physical_location?: string | null
          recurrence_count?: number | null
          recurrence_day?: number | null
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_pattern?: string | null
          start_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      hubla_webhooks: {
        Row: {
          created_at: string
          event_type: string
          headers: Json | null
          id: string
          payload: Json
          processed: boolean
          processing_notes: string | null
          received_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_type: string
          headers?: Json | null
          id?: string
          payload: Json
          processed?: boolean
          processing_notes?: string | null
          received_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          headers?: Json | null
          id?: string
          payload?: Json
          processed?: boolean
          processing_notes?: string | null
          received_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      implementation_requests: {
        Row: {
          created_at: string
          discord_message_id: string | null
          id: string
          metadata: Json | null
          notes: string | null
          pipedrive_deal_id: string | null
          processed_at: string | null
          solution_category: string
          solution_id: string
          solution_title: string
          status: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
          user_phone: string | null
        }
        Insert: {
          created_at?: string
          discord_message_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          pipedrive_deal_id?: string | null
          processed_at?: string | null
          solution_category: string
          solution_id: string
          solution_title: string
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
          user_name: string
          user_phone?: string | null
        }
        Update: {
          created_at?: string
          discord_message_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          pipedrive_deal_id?: string | null
          processed_at?: string | null
          solution_category?: string
          solution_id?: string
          solution_title?: string
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "implementation_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "implementation_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "implementation_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_tab_progress: {
        Row: {
          completed_at: string | null
          id: string
          progress_data: Json | null
          solution_id: string
          tab_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          progress_data?: Json | null
          solution_id: string
          tab_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          progress_data?: Json | null
          solution_id?: string
          tab_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      implementation_trails: {
        Row: {
          created_at: string | null
          error_message: string | null
          generation_attempts: number | null
          id: string
          status: string
          trail_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          generation_attempts?: number | null
          id?: string
          status?: string
          trail_data?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          generation_attempts?: number | null
          id?: string
          status?: string
          trail_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invite_analytics_events: {
        Row: {
          channel: string
          event_type: string
          id: string
          invite_id: string
          ip_address: string | null
          metadata: Json | null
          provider_id: string | null
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          channel: string
          event_type: string
          id?: string
          invite_id: string
          ip_address?: string | null
          metadata?: Json | null
          provider_id?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          channel?: string
          event_type?: string
          id?: string
          invite_id?: string
          ip_address?: string | null
          metadata?: Json | null
          provider_id?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_analytics_events_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_backups: {
        Row: {
          backup_data: Json
          backup_reason: string
          created_at: string
          email: string
          id: string
          original_invite_id: string | null
        }
        Insert: {
          backup_data: Json
          backup_reason: string
          created_at?: string
          email: string
          id?: string
          original_invite_id?: string | null
        }
        Update: {
          backup_data?: Json
          backup_reason?: string
          created_at?: string
          email?: string
          id?: string
          original_invite_id?: string | null
        }
        Relationships: []
      }
      invite_campaigns: {
        Row: {
          channels: string[]
          created_at: string
          created_by: string
          description: string | null
          email_template: string
          follow_up_rules: Json | null
          id: string
          name: string
          scheduled_for: string | null
          segmentation: Json | null
          status: string
          target_role_id: string | null
          updated_at: string
          whatsapp_template: string | null
        }
        Insert: {
          channels?: string[]
          created_at?: string
          created_by: string
          description?: string | null
          email_template: string
          follow_up_rules?: Json | null
          id?: string
          name: string
          scheduled_for?: string | null
          segmentation?: Json | null
          status?: string
          target_role_id?: string | null
          updated_at?: string
          whatsapp_template?: string | null
        }
        Update: {
          channels?: string[]
          created_at?: string
          created_by?: string
          description?: string | null
          email_template?: string
          follow_up_rules?: Json | null
          id?: string
          name?: string
          scheduled_for?: string | null
          segmentation?: Json | null
          status?: string
          target_role_id?: string | null
          updated_at?: string
          whatsapp_template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_campaigns_target_role_id_fkey"
            columns: ["target_role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_deliveries: {
        Row: {
          channel: string
          clicked_at: string | null
          clicked_count: number | null
          conversion_value: number | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          invite_id: string
          metadata: Json | null
          opened_at: string | null
          opened_count: number | null
          provider_id: string | null
          sent_at: string | null
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          channel: string
          clicked_at?: string | null
          clicked_count?: number | null
          conversion_value?: number | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          invite_id: string
          metadata?: Json | null
          opened_at?: string | null
          opened_count?: number | null
          provider_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          channel?: string
          clicked_at?: string | null
          clicked_count?: number | null
          conversion_value?: number | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          invite_id?: string
          metadata?: Json | null
          opened_at?: string | null
          opened_count?: number | null
          provider_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_deliveries_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_delivery_events: {
        Row: {
          channel: string | null
          created_at: string | null
          email_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          invite_id: string
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          email_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          invite_id: string
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          email_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          invite_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_delivery_events_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          email: string
          expires_at: string
          id: string
          last_sent_at: string | null
          notes: string | null
          preferred_channel: string | null
          role_id: string
          send_attempts: number | null
          token: string
          used_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          email: string
          expires_at: string
          id?: string
          last_sent_at?: string | null
          notes?: string | null
          preferred_channel?: string | null
          role_id: string
          send_attempts?: number | null
          token: string
          used_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          last_sent_at?: string | null
          notes?: string | null
          preferred_channel?: string | null
          role_id?: string
          send_attempts?: number | null
          token?: string
          used_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_certificate_templates: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string | null
          css_styles: string | null
          description: string | null
          html_template: string
          id: string
          is_active: boolean
          is_default: boolean
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          css_styles?: string | null
          description?: string | null
          html_template: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          css_styles?: string | null
          description?: string | null
          html_template?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_certificates: {
        Row: {
          certificate_url: string | null
          completion_date: string | null
          course_id: string
          created_at: string
          id: string
          issued_at: string
          metadata: Json | null
          template_id: string | null
          user_id: string
          validation_code: string
        }
        Insert: {
          certificate_url?: string | null
          completion_date?: string | null
          course_id: string
          created_at?: string
          id?: string
          issued_at?: string
          metadata?: Json | null
          template_id?: string | null
          user_id: string
          validation_code?: string
        }
        Update: {
          certificate_url?: string | null
          completion_date?: string | null
          course_id?: string
          created_at?: string
          id?: string
          issued_at?: string
          metadata?: Json | null
          template_id?: string | null
          user_id?: string
          validation_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "learning_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_comments: {
        Row: {
          admin_replied: boolean | null
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          lesson_id: string
          likes_count: number
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_replied?: boolean | null
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          lesson_id: string
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_replied?: boolean | null
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          lesson_id?: string
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "learning_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_courses: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          order_index: number | null
          published: boolean | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_lesson_nps: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          lesson_id: string
          response_code: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          lesson_id: string
          response_code: string
          score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          lesson_id?: string
          response_code?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_lesson_nps_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_lesson_tags: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_lesson_tags_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_lesson_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "lesson_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_lesson_tools: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          order_index: number
          tool_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          order_index?: number
          tool_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          order_index?: number
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_lesson_tools_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_lesson_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_lesson_videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          lesson_id: string
          order_index: number
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string
          video_file_name: string | null
          video_file_path: string | null
          video_id: string | null
          video_type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          lesson_id: string
          order_index?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url: string
          video_file_name?: string | null
          video_file_path?: string | null
          video_id?: string | null
          video_type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          lesson_id?: string
          order_index?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
          video_file_name?: string | null
          video_file_path?: string | null
          video_id?: string | null
          video_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_lesson_videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_lessons: {
        Row: {
          ai_assistant_enabled: boolean | null
          ai_assistant_id: string | null
          ai_assistant_prompt: string | null
          content: Json | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          estimated_time_minutes: number | null
          id: string
          module_id: string
          order_index: number
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_assistant_enabled?: boolean | null
          ai_assistant_id?: string | null
          ai_assistant_prompt?: string | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_time_minutes?: number | null
          id?: string
          module_id: string
          order_index?: number
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_assistant_enabled?: boolean | null
          ai_assistant_id?: string | null
          ai_assistant_prompt?: string | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_time_minutes?: number | null
          id?: string
          module_id?: string
          order_index?: number
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_modules: {
        Row: {
          blocked: boolean
          course_id: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          order_index: number
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          blocked?: boolean
          course_id: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          blocked?: boolean
          course_id?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_position_seconds: number | null
          lesson_id: string
          notes: string | null
          progress_percentage: number | null
          started_at: string
          updated_at: string
          user_id: string
          video_progress: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position_seconds?: number | null
          lesson_id: string
          notes?: string | null
          progress_percentage?: number | null
          started_at?: string
          updated_at?: string
          user_id: string
          video_progress?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position_seconds?: number | null
          lesson_id?: string
          notes?: string | null
          progress_percentage?: number | null
          started_at?: string
          updated_at?: string
          user_id?: string
          video_progress?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_resources: {
        Row: {
          created_at: string
          description: string | null
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string | null
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id?: string | null
          name: string
          order_index?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string | null
          name?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_tags: {
        Row: {
          category: string | null
          color: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      linkedin_connections: {
        Row: {
          access_token_encrypted: string
          connected_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          linkedin_user_id: string
          profile_data: Json | null
          refresh_token_encrypted: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          connected_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          linkedin_user_id: string
          profile_data?: Json | null
          refresh_token_encrypted?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          connected_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          linkedin_user_id?: string
          profile_data?: Json | null
          refresh_token_encrypted?: string | null
          user_id?: string
        }
        Relationships: []
      }
      master_member_backup: {
        Row: {
          backup_date: string
          backup_reason: string
          id: string
          organizations_backup: Json
          profiles_backup: Json
          sync_log_backup: Json
        }
        Insert: {
          backup_date?: string
          backup_reason?: string
          id?: string
          organizations_backup: Json
          profiles_backup: Json
          sync_log_backup: Json
        }
        Update: {
          backup_date?: string
          backup_reason?: string
          id?: string
          organizations_backup?: Json
          profiles_backup?: Json
          sync_log_backup?: Json
        }
        Relationships: []
      }
      master_member_sync_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          master_email: string
          member_email: string | null
          metadata: Json | null
          operation: string
          sync_status: string
          synced_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          master_email: string
          member_email?: string | null
          metadata?: Json | null
          operation: string
          sync_status?: string
          synced_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          master_email?: string
          member_email?: string | null
          metadata?: Json | null
          operation?: string
          sync_status?: string
          synced_at?: string | null
        }
        Relationships: []
      }
      member_connections: {
        Row: {
          created_at: string | null
          id: string
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipient_id: string
          requester_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_connections_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_connections_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_connections_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          message_id: string
          reason: string
          reporter_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          message_id: string
          reason: string
          reporter_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          message_id?: string
          reason?: string
          reporter_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          duration_hours: number | null
          expires_at: string | null
          id: string
          moderator_id: string
          post_id: string | null
          reason: string
          target_user_id: string | null
          topic_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          duration_hours?: number | null
          expires_at?: string | null
          id?: string
          moderator_id: string
          post_id?: string | null
          reason: string
          target_user_id?: string | null
          topic_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          duration_hours?: number | null
          expires_at?: string | null
          id?: string
          moderator_id?: string
          post_id?: string | null
          reason?: string
          target_user_id?: string | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_settings: {
        Row: {
          auto_moderation_enabled: boolean
          default_suspension_hours: number
          id: string
          max_warnings_before_suspension: number
          new_user_moderation: boolean
          profanity_filter_enabled: boolean
          settings: Json | null
          spam_detection_enabled: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auto_moderation_enabled?: boolean
          default_suspension_hours?: number
          id?: string
          max_warnings_before_suspension?: number
          new_user_moderation?: boolean
          profanity_filter_enabled?: boolean
          settings?: Json | null
          spam_detection_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auto_moderation_enabled?: boolean
          default_suspension_hours?: number
          id?: string
          max_warnings_before_suspension?: number
          new_user_moderation?: boolean
          profanity_filter_enabled?: boolean
          settings?: Json | null
          spam_detection_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_events: {
        Row: {
          id: string
          ip_address: string | null
          path: string
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          path: string
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          path?: string
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      network_connections: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      network_matches: {
        Row: {
          ai_analysis: Json | null
          compatibility_score: number | null
          created_at: string
          id: string
          match_reason: string | null
          match_type: string
          matched_user_id: string
          month_year: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          compatibility_score?: number | null
          created_at?: string
          id?: string
          match_reason?: string | null
          match_type: string
          matched_user_id: string
          month_year: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          compatibility_score?: number | null
          created_at?: string
          id?: string
          match_reason?: string | null
          match_type?: string
          matched_user_id?: string
          month_year?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "network_matches_matched_user_id_fkey"
            columns: ["matched_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_matches_matched_user_id_fkey"
            columns: ["matched_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_matches_matched_user_id_fkey"
            columns: ["matched_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      networking_analytics: {
        Row: {
          compatibility_score: number | null
          created_at: string
          event_data: Json
          event_type: string
          id: string
          match_type: string | null
          month_year: string
          partner_id: string | null
          user_id: string
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          match_type?: string | null
          month_year?: string
          partner_id?: string | null
          user_id: string
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          match_type?: string | null
          month_year?: string
          partner_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      networking_match_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          matches_count: number | null
          metadata: Json | null
          processing_time_ms: number | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          matches_count?: number | null
          metadata?: Json | null
          processing_time_ms?: number | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          matches_count?: number | null
          metadata?: Json | null
          processing_time_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "networking_match_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "networking_match_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "networking_match_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      networking_meetings: {
        Row: {
          connection_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          location: string | null
          meeting_link: string | null
          meeting_type: string
          notes: string | null
          organizer_id: string
          participant_id: string
          reminder_sent: boolean | null
          scheduled_for: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          meeting_link?: string | null
          meeting_type?: string
          notes?: string | null
          organizer_id: string
          participant_id: string
          reminder_sent?: boolean | null
          scheduled_for: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          meeting_link?: string | null
          meeting_type?: string
          notes?: string | null
          organizer_id?: string
          participant_id?: string
          reminder_sent?: boolean | null
          scheduled_for?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_networking_meetings_connection"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "member_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      networking_metrics: {
        Row: {
          active_connections: number | null
          compatibility_score: number | null
          created_at: string | null
          id: string
          last_activity_at: string | null
          metric_month: string | null
          total_matches: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active_connections?: number | null
          compatibility_score?: number | null
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          metric_month?: string | null
          total_matches?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active_connections?: number | null
          compatibility_score?: number | null
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          metric_month?: string | null
          total_matches?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      networking_opportunities_backup: {
        Row: {
          contact_preference: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          opportunity_type: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          contact_preference?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          opportunity_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          contact_preference?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          opportunity_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      networking_preferences: {
        Row: {
          created_at: string
          exclude_sectors: string[] | null
          is_active: boolean | null
          looking_for: Json | null
          min_compatibility: number | null
          preferred_connections_per_week: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exclude_sectors?: string[] | null
          is_active?: boolean | null
          looking_for?: Json | null
          min_compatibility?: number | null
          preferred_connections_per_week?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exclude_sectors?: string[] | null
          is_active?: boolean | null
          looking_for?: Json | null
          min_compatibility?: number | null
          preferred_connections_per_week?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      networking_profiles_v2: {
        Row: {
          ai_persona: Json | null
          created_at: string | null
          id: string
          keywords: string[]
          last_match_generation: string | null
          last_updated_at: string | null
          looking_for: string[]
          main_challenge: string | null
          match_compatibility_vector: Json | null
          networking_score: number | null
          profile_completed_at: string | null
          user_id: string
          value_proposition: string
        }
        Insert: {
          ai_persona?: Json | null
          created_at?: string | null
          id?: string
          keywords?: string[]
          last_match_generation?: string | null
          last_updated_at?: string | null
          looking_for?: string[]
          main_challenge?: string | null
          match_compatibility_vector?: Json | null
          networking_score?: number | null
          profile_completed_at?: string | null
          user_id: string
          value_proposition: string
        }
        Update: {
          ai_persona?: Json | null
          created_at?: string | null
          id?: string
          keywords?: string[]
          last_match_generation?: string | null
          last_updated_at?: string | null
          looking_for?: string[]
          main_challenge?: string | null
          match_compatibility_vector?: Json | null
          networking_score?: number | null
          profile_completed_at?: string | null
          user_id?: string
          value_proposition?: string
        }
        Relationships: [
          {
            foreignKeyName: "networking_profiles_v2_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "networking_profiles_v2_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "networking_profiles_v2_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          admin_broadcast: boolean | null
          admin_communications_email: boolean | null
          admin_communications_inapp: boolean | null
          admin_direct_message: boolean | null
          community_achievement: boolean | null
          community_mention: boolean | null
          community_moderated: boolean | null
          community_new_topic: boolean | null
          community_post_liked: boolean | null
          community_post_reply: boolean | null
          community_topic_pinned: boolean | null
          community_topic_reply: boolean | null
          community_topic_solved: boolean | null
          community_weekly_digest: boolean | null
          created_at: string
          digest_frequency: string | null
          email_enabled: boolean
          events_cancelled: boolean | null
          events_new_event: boolean | null
          events_registration_confirmed: boolean | null
          events_reminder: boolean | null
          events_starting_soon: boolean | null
          events_updated: boolean | null
          id: string
          in_app_enabled: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          solutions_access_granted: boolean | null
          solutions_new_comment: boolean | null
          solutions_new_solution: boolean | null
          solutions_reply: boolean | null
          solutions_updated: boolean | null
          solutions_weekly_digest: boolean | null
          suggestions_comment_reply: boolean | null
          suggestions_milestone: boolean | null
          suggestions_new_comment: boolean | null
          suggestions_new_suggestion: boolean | null
          suggestions_status_changed: boolean | null
          suggestions_upvoted: boolean | null
          system_maintenance: boolean | null
          system_new_feature: boolean | null
          system_security_alert: boolean | null
          updated_at: string
          user_achievement: boolean | null
          user_id: string
          user_role_changed: boolean | null
          whatsapp_enabled: boolean
        }
        Insert: {
          admin_broadcast?: boolean | null
          admin_communications_email?: boolean | null
          admin_communications_inapp?: boolean | null
          admin_direct_message?: boolean | null
          community_achievement?: boolean | null
          community_mention?: boolean | null
          community_moderated?: boolean | null
          community_new_topic?: boolean | null
          community_post_liked?: boolean | null
          community_post_reply?: boolean | null
          community_topic_pinned?: boolean | null
          community_topic_reply?: boolean | null
          community_topic_solved?: boolean | null
          community_weekly_digest?: boolean | null
          created_at?: string
          digest_frequency?: string | null
          email_enabled?: boolean
          events_cancelled?: boolean | null
          events_new_event?: boolean | null
          events_registration_confirmed?: boolean | null
          events_reminder?: boolean | null
          events_starting_soon?: boolean | null
          events_updated?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          solutions_access_granted?: boolean | null
          solutions_new_comment?: boolean | null
          solutions_new_solution?: boolean | null
          solutions_reply?: boolean | null
          solutions_updated?: boolean | null
          solutions_weekly_digest?: boolean | null
          suggestions_comment_reply?: boolean | null
          suggestions_milestone?: boolean | null
          suggestions_new_comment?: boolean | null
          suggestions_new_suggestion?: boolean | null
          suggestions_status_changed?: boolean | null
          suggestions_upvoted?: boolean | null
          system_maintenance?: boolean | null
          system_new_feature?: boolean | null
          system_security_alert?: boolean | null
          updated_at?: string
          user_achievement?: boolean | null
          user_id: string
          user_role_changed?: boolean | null
          whatsapp_enabled?: boolean
        }
        Update: {
          admin_broadcast?: boolean | null
          admin_communications_email?: boolean | null
          admin_communications_inapp?: boolean | null
          admin_direct_message?: boolean | null
          community_achievement?: boolean | null
          community_mention?: boolean | null
          community_moderated?: boolean | null
          community_new_topic?: boolean | null
          community_post_liked?: boolean | null
          community_post_reply?: boolean | null
          community_topic_pinned?: boolean | null
          community_topic_reply?: boolean | null
          community_topic_solved?: boolean | null
          community_weekly_digest?: boolean | null
          created_at?: string
          digest_frequency?: string | null
          email_enabled?: boolean
          events_cancelled?: boolean | null
          events_new_event?: boolean | null
          events_registration_confirmed?: boolean | null
          events_reminder?: boolean | null
          events_starting_soon?: boolean | null
          events_updated?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          solutions_access_granted?: boolean | null
          solutions_new_comment?: boolean | null
          solutions_new_solution?: boolean | null
          solutions_reply?: boolean | null
          solutions_updated?: boolean | null
          solutions_weekly_digest?: boolean | null
          suggestions_comment_reply?: boolean | null
          suggestions_milestone?: boolean | null
          suggestions_new_comment?: boolean | null
          suggestions_new_suggestion?: boolean | null
          suggestions_status_changed?: boolean | null
          suggestions_upvoted?: boolean | null
          system_maintenance?: boolean | null
          system_new_feature?: boolean | null
          system_security_alert?: boolean | null
          updated_at?: string
          user_achievement?: boolean | null
          user_id?: string
          user_role_changed?: boolean | null
          whatsapp_enabled?: boolean
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          channels: string[]
          created_at: string
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          priority: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          channels?: string[]
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          priority?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          channels?: string[]
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          priority?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          actor_id: string | null
          category: string | null
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: number | null
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          actor_id?: string | null
          category?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: number | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          actor_id?: string | null
          category?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: number | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_abandonment_points: {
        Row: {
          abandoned_at: string
          abandonment_reason: string | null
          id: string
          metadata: Json | null
          step_number: number
          time_on_step_seconds: number | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          abandoned_at?: string
          abandonment_reason?: string | null
          id?: string
          metadata?: Json | null
          step_number: number
          time_on_step_seconds?: number | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          abandoned_at?: string
          abandonment_reason?: string | null
          id?: string
          metadata?: Json | null
          step_number?: number
          time_on_step_seconds?: number | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_backups: {
        Row: {
          additional_data: Json | null
          backup_type: string
          created_at: string
          id: string
          onboarding_data: Json
          profiles_data: Json | null
          user_id: string
        }
        Insert: {
          additional_data?: Json | null
          backup_type?: string
          created_at?: string
          id?: string
          onboarding_data: Json
          profiles_data?: Json | null
          user_id: string
        }
        Update: {
          additional_data?: Json | null
          backup_type?: string
          created_at?: string
          id?: string
          onboarding_data?: Json
          profiles_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_final: {
        Row: {
          abandonment_points: Json | null
          ai_experience: Json
          business_context: Json
          business_goals: Json | null
          business_info: Json
          company_sector: string | null
          complementary_info: Json | null
          completed_at: string | null
          completed_steps: number[]
          completion_message: string | null
          completion_score: number | null
          created_at: string
          current_step: number
          discovery_info: Json
          experience_personalization: Json | null
          goals_info: Json
          help_requests: number | null
          id: string
          is_completed: boolean
          location_info: Json
          main_goal: string | null
          message_generated: boolean | null
          nina_message: string | null
          personal_info: Json
          personalization: Json
          professional_info: Json | null
          status: string | null
          time_per_step: Json | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          abandonment_points?: Json | null
          ai_experience?: Json
          business_context?: Json
          business_goals?: Json | null
          business_info?: Json
          company_sector?: string | null
          complementary_info?: Json | null
          completed_at?: string | null
          completed_steps?: number[]
          completion_message?: string | null
          completion_score?: number | null
          created_at?: string
          current_step?: number
          discovery_info?: Json
          experience_personalization?: Json | null
          goals_info?: Json
          help_requests?: number | null
          id?: string
          is_completed?: boolean
          location_info?: Json
          main_goal?: string | null
          message_generated?: boolean | null
          nina_message?: string | null
          personal_info?: Json
          personalization?: Json
          professional_info?: Json | null
          status?: string | null
          time_per_step?: Json | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          abandonment_points?: Json | null
          ai_experience?: Json
          business_context?: Json
          business_goals?: Json | null
          business_info?: Json
          company_sector?: string | null
          complementary_info?: Json | null
          completed_at?: string | null
          completed_steps?: number[]
          completion_message?: string | null
          completion_score?: number | null
          created_at?: string
          current_step?: number
          discovery_info?: Json
          experience_personalization?: Json | null
          goals_info?: Json
          help_requests?: number | null
          id?: string
          is_completed?: boolean
          location_info?: Json
          main_goal?: string | null
          message_generated?: boolean | null
          nina_message?: string | null
          personal_info?: Json
          personalization?: Json
          professional_info?: Json | null
          status?: string | null
          time_per_step?: Json | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      onboarding_integrity_checks: {
        Row: {
          auto_corrected: boolean | null
          check_type: string
          created_at: string
          id: string
          issues_found: Json | null
          status: string
          user_id: string
        }
        Insert: {
          auto_corrected?: boolean | null
          check_type: string
          created_at?: string
          id?: string
          issues_found?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          auto_corrected?: boolean | null
          check_type?: string
          created_at?: string
          id?: string
          issues_found?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_step_tracking: {
        Row: {
          attempts: number | null
          completed_at: string | null
          id: string
          is_completed: boolean | null
          started_at: string
          step_data: Json | null
          step_name: string
          step_number: number
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          started_at?: string
          step_data?: Json | null
          step_name: string
          step_number: number
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          started_at?: string
          step_data?: Json | null
          step_name?: string
          step_number?: number
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_sync: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          master_user_id: string
          max_users: number
          name: string
          plan_type: string
          settings: Json | null
          subscription_status: string | null
          team_limit: number | null
          updated_at: string | null
        }
        Insert: {
          billing_email?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          master_user_id: string
          max_users?: number
          name: string
          plan_type?: string
          settings?: Json | null
          subscription_status?: string | null
          team_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_email?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          master_user_id?: string
          max_users?: number
          name?: string
          plan_type?: string
          settings?: Json | null
          subscription_status?: string | null
          team_limit?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permission_audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_value: string | null
          old_value: string | null
          permission_code: string | null
          permission_id: string | null
          role_id: string | null
          role_name: string | null
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          permission_code?: string | null
          permission_id?: string | null
          role_id?: string | null
          role_name?: string | null
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          permission_code?: string | null
          permission_id?: string | null
          role_id?: string | null
          role_name?: string | null
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      permission_definitions: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profile_cache: {
        Row: {
          cached_at: string
          expires_at: string
          profile_data: Json
          user_id: string
        }
        Insert: {
          cached_at?: string
          expires_at?: string
          profile_data: Json
          user_id: string
        }
        Update: {
          cached_at?: string
          expires_at?: string
          profile_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          annual_revenue: string | null
          available_for_networking: boolean | null
          avatar_url: string | null
          company_name: string | null
          company_size: string | null
          created_at: string
          current_position: string | null
          email: string
          id: string
          industry: string | null
          is_active: boolean | null
          is_master_user: boolean | null
          last_active: string | null
          linkedin_url: string | null
          main_challenge: string | null
          master_email: string | null
          name: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          organization_id: string | null
          plan_type: string | null
          primary_goal: string | null
          priority_areas: string[] | null
          professional_bio: string | null
          referrals_count: number
          role: string
          role_id: string | null
          skills: string[] | null
          status: string | null
          successful_referrals_count: number
          team_size: number | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          annual_revenue?: string | null
          available_for_networking?: boolean | null
          avatar_url?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          current_position?: string | null
          email: string
          id: string
          industry?: string | null
          is_active?: boolean | null
          is_master_user?: boolean | null
          last_active?: string | null
          linkedin_url?: string | null
          main_challenge?: string | null
          master_email?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          organization_id?: string | null
          plan_type?: string | null
          primary_goal?: string | null
          priority_areas?: string[] | null
          professional_bio?: string | null
          referrals_count?: number
          role?: string
          role_id?: string | null
          skills?: string[] | null
          status?: string | null
          successful_referrals_count?: number
          team_size?: number | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          annual_revenue?: string | null
          available_for_networking?: boolean | null
          avatar_url?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          current_position?: string | null
          email?: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_master_user?: boolean | null
          last_active?: string | null
          linkedin_url?: string | null
          main_challenge?: string | null
          master_email?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          organization_id?: string | null
          plan_type?: string | null
          primary_goal?: string | null
          priority_areas?: string[] | null
          professional_bio?: string | null
          referrals_count?: number
          role?: string
          role_id?: string | null
          skills?: string[] | null
          status?: string | null
          successful_referrals_count?: number
          team_size?: number | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          completed_at: string | null
          completed_modules: number[] | null
          completion_data: Json | null
          completion_percentage: number | null
          created_at: string | null
          current_module: number | null
          id: string
          implementation_status: string | null
          is_completed: boolean | null
          last_activity: string | null
          solution_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_modules?: number[] | null
          completion_data?: Json | null
          completion_percentage?: number | null
          created_at?: string | null
          current_module?: number | null
          id?: string
          implementation_status?: string | null
          is_completed?: boolean | null
          last_activity?: string | null
          solution_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_modules?: number[] | null
          completion_data?: Json | null
          completion_percentage?: number | null
          created_at?: string | null
          current_module?: number | null
          id?: string
          implementation_status?: string | null
          is_completed?: boolean | null
          last_activity?: string | null
          solution_id?: string
          user_id?: string
        }
        Relationships: []
      }
      quick_onboarding: {
        Row: {
          ai_knowledge_level: string | null
          annual_revenue_range: string | null
          birth_date: string | null
          company_name: string | null
          company_segment: string | null
          company_size: string | null
          company_website: string | null
          country_code: string | null
          created_at: string | null
          current_step: number | null
          desired_ai_areas: string[] | null
          email: string
          has_implemented: string | null
          how_found_us: string | null
          id: string
          instagram_url: string | null
          is_completed: boolean | null
          linkedin_url: string | null
          main_challenge: string | null
          main_goal: string | null
          name: string | null
          previous_tools: string[] | null
          referred_by: string | null
          role: string | null
          updated_at: string | null
          user_id: string
          uses_ai: string | null
          whatsapp: string | null
        }
        Insert: {
          ai_knowledge_level?: string | null
          annual_revenue_range?: string | null
          birth_date?: string | null
          company_name?: string | null
          company_segment?: string | null
          company_size?: string | null
          company_website?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          desired_ai_areas?: string[] | null
          email: string
          has_implemented?: string | null
          how_found_us?: string | null
          id?: string
          instagram_url?: string | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          previous_tools?: string[] | null
          referred_by?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
          uses_ai?: string | null
          whatsapp?: string | null
        }
        Update: {
          ai_knowledge_level?: string | null
          annual_revenue_range?: string | null
          birth_date?: string | null
          company_name?: string | null
          company_segment?: string | null
          company_size?: string | null
          company_website?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          desired_ai_areas?: string[] | null
          email?: string
          has_implemented?: string | null
          how_found_us?: string | null
          id?: string
          instagram_url?: string | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          previous_tools?: string[] | null
          referred_by?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
          uses_ai?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          attempts: number | null
          block_level: number | null
          block_until: string | null
          created_at: string | null
          first_attempt: string | null
          id: string
          identifier: string
          last_attempt: string | null
        }
        Insert: {
          attempts?: number | null
          block_level?: number | null
          block_until?: string | null
          created_at?: string | null
          first_attempt?: string | null
          id?: string
          identifier: string
          last_attempt?: string | null
        }
        Update: {
          attempts?: number | null
          block_level?: number | null
          block_until?: string | null
          created_at?: string | null
          first_attempt?: string | null
          id?: string
          identifier?: string
          last_attempt?: string | null
        }
        Relationships: []
      }
      rate_limit_blocks: {
        Row: {
          action: string
          blocked_until: string
          created_at: string | null
          id: string
          identifier: string
        }
        Insert: {
          action: string
          blocked_until: string
          created_at?: string | null
          id?: string
          identifier: string
        }
        Update: {
          action?: string
          blocked_until?: string
          created_at?: string | null
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          attempt_count: number
          blocked_until: string | null
          created_at: string
          id: string
          identifier: string
          updated_at: string
          window_start: string
        }
        Insert: {
          action_type: string
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier: string
          updated_at?: string
          window_start?: string
        }
        Update: {
          action_type?: string
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      referral_benefits: {
        Row: {
          benefit_type: string
          benefit_value: string
          created_at: string
          expires_at: string | null
          id: string
          referral_id: string
          referrer_id: string
          used: boolean
        }
        Insert: {
          benefit_type: string
          benefit_value: string
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_id: string
          referrer_id: string
          used?: boolean
        }
        Update: {
          benefit_type?: string
          benefit_value?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_id?: string
          referrer_id?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "referral_benefits_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_benefits_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_benefits_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          referrer_id: string
          role_id: string | null
          status: string
          token: string
          type: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          referrer_id: string
          role_id?: string | null
          status?: string
          token: string
          type?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          referrer_id?: string
          role_id?: string | null
          status?: string
          token?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permission_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_anomalies: {
        Row: {
          affected_user_id: string | null
          anomaly_type: string
          confidence_score: number | null
          description: string | null
          detected_at: string
          detection_data: Json | null
          id: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          affected_user_id?: string | null
          anomaly_type: string
          confidence_score?: number | null
          description?: string | null
          detected_at?: string
          detection_data?: Json | null
          id?: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          affected_user_id?: string | null
          anomaly_type?: string
          confidence_score?: number | null
          description?: string | null
          detected_at?: string
          detection_data?: Json | null
          id?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          related_logs: string[] | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          related_logs?: string[] | null
          resolved_at?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          related_logs?: string[] | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_linter_history: {
        Row: {
          baseline_comparison: Json | null
          created_by: string | null
          critical_warnings: number
          execution_date: string
          id: string
          improvement_percentage: number | null
          total_warnings: number
          warning_details: Json
        }
        Insert: {
          baseline_comparison?: Json | null
          created_by?: string | null
          critical_warnings?: number
          execution_date?: string
          id?: string
          improvement_percentage?: number | null
          total_warnings?: number
          warning_details?: Json
        }
        Update: {
          baseline_comparison?: Json | null
          created_by?: string | null
          critical_warnings?: number
          execution_date?: string
          id?: string
          improvement_percentage?: number | null
          total_warnings?: number
          warning_details?: Json
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          action: string
          correlation_id: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          location: Json | null
          processed: boolean | null
          resource_id: string | null
          resource_type: string | null
          severity: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          correlation_id?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          location?: Json | null
          processed?: boolean | null
          resource_id?: string | null
          resource_type?: string | null
          severity: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          correlation_id?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          location?: Json | null
          processed?: boolean | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_metrics: {
        Row: {
          id: string
          labels: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          labels?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          id?: string
          labels?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string
        }
        Relationships: []
      }
      security_violations: {
        Row: {
          additional_data: Json | null
          auto_blocked: boolean | null
          created_at: string
          description: string
          id: string
          ip_address: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          resource_accessed: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
          violation_type: string
        }
        Insert: {
          additional_data?: Json | null
          auto_blocked?: boolean | null
          created_at?: string
          description: string
          id?: string
          ip_address?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          resource_accessed?: string | null
          severity: string
          user_agent?: string | null
          user_id?: string | null
          violation_type: string
        }
        Update: {
          additional_data?: Json | null
          auto_blocked?: boolean | null
          created_at?: string
          description?: string
          id?: string
          ip_address?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          resource_accessed?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
          violation_type?: string
        }
        Relationships: []
      }
      solution_access_overrides: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role_id: string
          solution_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role_id: string
          solution_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role_id?: string
          solution_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_access_overrides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_access_overrides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_access_overrides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_access_overrides_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_access_overrides_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_certificate_templates: {
        Row: {
          created_at: string
          css_styles: string | null
          description: string | null
          html_template: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          css_styles?: string | null
          description?: string | null
          html_template: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          css_styles?: string | null
          description?: string | null
          html_template?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      solution_certificates: {
        Row: {
          certificate_url: string | null
          completion_date: string | null
          created_at: string
          id: string
          implementation_date: string
          issued_at: string
          metadata: Json | null
          solution_id: string
          template_id: string | null
          updated_at: string
          user_id: string
          validation_code: string
        }
        Insert: {
          certificate_url?: string | null
          completion_date?: string | null
          created_at?: string
          id?: string
          implementation_date: string
          issued_at?: string
          metadata?: Json | null
          solution_id: string
          template_id?: string | null
          updated_at?: string
          user_id: string
          validation_code?: string
        }
        Update: {
          certificate_url?: string | null
          completion_date?: string | null
          created_at?: string
          id?: string
          implementation_date?: string
          issued_at?: string
          metadata?: Json | null
          solution_id?: string
          template_id?: string | null
          updated_at?: string
          user_id?: string
          validation_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_certificates_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_certificates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "solution_certificate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      solution_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          likes_count: number
          parent_id: string | null
          solution_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          likes_count?: number
          parent_id?: string | null
          solution_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          likes_count?: number
          parent_id?: string | null
          solution_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "solution_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_metrics: {
        Row: {
          abandonment_rates: Json | null
          average_completion_time: number | null
          id: string
          last_updated: string | null
          solution_id: string | null
          total_completions: number | null
          total_starts: number | null
          total_views: number | null
        }
        Insert: {
          abandonment_rates?: Json | null
          average_completion_time?: number | null
          id?: string
          last_updated?: string | null
          solution_id?: string | null
          total_completions?: number | null
          total_starts?: number | null
          total_views?: number | null
        }
        Update: {
          abandonment_rates?: Json | null
          average_completion_time?: number | null
          id?: string
          last_updated?: string | null
          solution_id?: string | null
          total_completions?: number | null
          total_starts?: number | null
          total_views?: number | null
        }
        Relationships: []
      }
      solution_ratings: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          rating: number
          solution_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          rating: number
          solution_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          rating?: number
          solution_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      solution_resources: {
        Row: {
          created_at: string | null
          format: string | null
          id: string
          metadata: Json | null
          module_id: string | null
          name: string
          size: number | null
          solution_id: string | null
          type: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          module_id?: string | null
          name: string
          size?: number | null
          solution_id?: string | null
          type: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          module_id?: string | null
          name?: string
          size?: number | null
          solution_id?: string | null
          type?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      solution_tools: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          solution_id: string | null
          tool_name: string
          tool_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          solution_id?: string | null
          tool_name: string
          tool_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          solution_id?: string | null
          tool_name?: string
          tool_url?: string | null
        }
        Relationships: []
      }
      solutions: {
        Row: {
          category: string | null
          checklist_items: Json | null
          completion_requirements: Json | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          implementation_steps: Json | null
          published: boolean | null
          related_solutions: string[] | null
          slug: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          checklist_items?: Json | null
          completion_requirements?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          implementation_steps?: Json | null
          published?: boolean | null
          related_solutions?: string[] | null
          slug?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          checklist_items?: Json | null
          completion_requirements?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          implementation_steps?: Json | null
          published?: boolean | null
          related_solutions?: string[] | null
          slug?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      strategic_matches_v2: {
        Row: {
          ai_analysis: Json | null
          compatibility_score: number
          connection_copy: string | null
          created_at: string | null
          expires_at: string | null
          ice_breaker: string
          id: string
          match_type: string
          matched_user_id: string
          message_sent: string | null
          opportunities: string[] | null
          responded_at: string | null
          status: string
          updated_at: string | null
          user_id: string
          viewed_at: string | null
          why_connect: string
        }
        Insert: {
          ai_analysis?: Json | null
          compatibility_score: number
          connection_copy?: string | null
          created_at?: string | null
          expires_at?: string | null
          ice_breaker: string
          id?: string
          match_type: string
          matched_user_id: string
          message_sent?: string | null
          opportunities?: string[] | null
          responded_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          viewed_at?: string | null
          why_connect: string
        }
        Update: {
          ai_analysis?: Json | null
          compatibility_score?: number
          connection_copy?: string | null
          created_at?: string | null
          expires_at?: string | null
          ice_breaker?: string
          id?: string
          match_type?: string
          matched_user_id?: string
          message_sent?: string | null
          opportunities?: string[] | null
          responded_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          viewed_at?: string | null
          why_connect?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategic_matches_v2_matched_user_id_fkey"
            columns: ["matched_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_matches_v2_matched_user_id_fkey"
            columns: ["matched_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_matches_v2_matched_user_id_fkey"
            columns: ["matched_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_matches_v2_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_matches_v2_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_matches_v2_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      suggestion_comment_votes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
          vote_type?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "suggestion_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_comments: {
        Row: {
          content: string
          created_at: string
          downvotes: number
          id: string
          is_hidden: boolean
          is_official: boolean
          parent_id: string | null
          suggestion_id: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          downvotes?: number
          id?: string
          is_hidden?: boolean
          is_official?: boolean
          parent_id?: string | null
          suggestion_id: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          downvotes?: number
          id?: string
          is_hidden?: boolean
          is_official?: boolean
          parent_id?: string | null
          suggestion_id?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "suggestion_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_notifications: {
        Row: {
          comment_id: string | null
          content: string | null
          created_at: string
          id: string
          is_read: boolean
          suggestion_id: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          suggestion_id: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          comment_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          suggestion_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "suggestion_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_votes: {
        Row: {
          created_at: string
          id: string
          suggestion_id: string
          updated_at: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          suggestion_id: string
          updated_at?: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          suggestion_id?: string
          updated_at?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          category_id: string | null
          comment_count: number | null
          created_at: string | null
          description: string
          downvotes: number | null
          id: string
          image_url: string | null
          is_hidden: boolean | null
          is_pinned: boolean | null
          status: string | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          description: string
          downvotes?: number | null
          id?: string
          image_url?: string | null
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          status?: string | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          description?: string
          downvotes?: number | null
          id?: string
          image_url?: string | null
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "suggestion_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "tool_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number
          parent_id: string | null
          tool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number
          parent_id?: string | null
          tool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number
          parent_id?: string | null
          tool_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tool_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          benefit_badge_url: string | null
          benefit_clicks: number | null
          benefit_description: string | null
          benefit_link: string | null
          benefit_title: string | null
          benefit_type: string | null
          category: string
          created_at: string
          description: string
          has_member_benefit: boolean | null
          id: string
          logo_url: string | null
          name: string
          official_url: string
          status: boolean | null
          tags: string[] | null
          updated_at: string
          video_tutorials: Json | null
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          benefit_badge_url?: string | null
          benefit_clicks?: number | null
          benefit_description?: string | null
          benefit_link?: string | null
          benefit_title?: string | null
          benefit_type?: string | null
          category: string
          created_at?: string
          description: string
          has_member_benefit?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          official_url: string
          status?: boolean | null
          tags?: string[] | null
          updated_at?: string
          video_tutorials?: Json | null
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          benefit_badge_url?: string | null
          benefit_clicks?: number | null
          benefit_description?: string | null
          benefit_link?: string | null
          benefit_title?: string | null
          benefit_type?: string | null
          category?: string
          created_at?: string
          description?: string
          has_member_benefit?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          official_url?: string
          status?: boolean | null
          tags?: string[] | null
          updated_at?: string
          video_tutorials?: Json | null
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      unified_checklists: {
        Row: {
          checklist_data: Json
          checklist_type: string
          completed_at: string | null
          completed_items: number | null
          created_at: string
          id: string
          is_completed: boolean | null
          is_template: boolean | null
          metadata: Json | null
          progress_percentage: number | null
          solution_id: string
          template_id: string | null
          total_items: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checklist_data?: Json
          checklist_type?: string
          completed_at?: string | null
          completed_items?: number | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          is_template?: boolean | null
          metadata?: Json | null
          progress_percentage?: number | null
          solution_id: string
          template_id?: string | null
          total_items?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checklist_data?: Json
          checklist_type?: string
          completed_at?: string | null
          completed_items?: number | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          is_template?: boolean | null
          metadata?: Json | null
          progress_percentage?: number | null
          solution_id?: string
          template_id?: string | null
          total_items?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_tracking: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          ip_address: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_backups: {
        Row: {
          affected_tables: string[]
          backup_data: Json
          backup_reason: string
          created_at: string
          email: string
          id: string
          original_user_id: string
          total_records_deleted: number
        }
        Insert: {
          affected_tables?: string[]
          backup_data: Json
          backup_reason: string
          created_at?: string
          email: string
          id?: string
          original_user_id: string
          total_records_deleted?: number
        }
        Update: {
          affected_tables?: string[]
          backup_data?: Json
          backup_reason?: string
          created_at?: string
          email?: string
          id?: string
          original_user_id?: string
          total_records_deleted?: number
        }
        Relationships: []
      }
      user_checklists: {
        Row: {
          checked_items: Json | null
          created_at: string
          id: string
          solution_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_items?: Json | null
          created_at?: string
          id?: string
          solution_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_items?: Json | null
          created_at?: string
          id?: string
          solution_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_course_access: {
        Row: {
          access_type: string
          course_id: string
          created_at: string
          expires_at: string | null
          granted_by: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_type?: string
          course_id: string
          created_at?: string
          expires_at?: string | null
          granted_by: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_type?: string
          course_id?: string
          created_at?: string
          expires_at?: string | null
          granted_by?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_health_alerts: {
        Row: {
          alert_type: string
          description: string
          id: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
          triggered_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          description: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title: string
          triggered_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          description?: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
          triggered_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_moderation_status: {
        Row: {
          ban_reason: string | null
          banned_by: string | null
          created_at: string
          id: string
          is_banned: boolean
          is_suspended: boolean
          suspended_by: string | null
          suspended_until: string | null
          suspension_reason: string | null
          updated_at: string
          user_id: string
          warning_count: number
        }
        Insert: {
          ban_reason?: string | null
          banned_by?: string | null
          created_at?: string
          id?: string
          is_banned?: boolean
          is_suspended?: boolean
          suspended_by?: string | null
          suspended_until?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id: string
          warning_count?: number
        }
        Update: {
          ban_reason?: string | null
          banned_by?: string | null
          created_at?: string
          id?: string
          is_banned?: boolean
          is_suspended?: boolean
          suspended_by?: string | null
          suspended_until?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id?: string
          warning_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_moderation_status_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_moderation_status_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_moderation_status_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_moderation_status_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_moderation_status_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_moderation_status_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_moderation_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_moderation_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_networking_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_moderation_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_activity: string
          session_token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity?: string
          session_token: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity?: string
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_content: string
          message_type: string
          phone_number: string
          sent_at: string | null
          status: string
          template_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_content: string
          message_type: string
          phone_number: string
          sent_at?: string | null
          status?: string
          template_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_content?: string
          message_type?: string
          phone_number?: string
          sent_at?: string | null
          status?: string
          template_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      builder_analytics: {
        Row: {
          avg_generation_time: number | null
          completed_solutions: number | null
          date: string | null
          solutions_generated: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      profiles_networking_safe: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          current_position: string | null
          email: string | null
          id: string | null
          industry: string | null
          is_masked: boolean | null
          linkedin_url: string | null
          name: string | null
          professional_bio: string | null
          role: string | null
          skills: string[] | null
          whatsapp_number: string | null
        }
        Relationships: []
      }
      profiles_safe: {
        Row: {
          available_for_networking: boolean | null
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          current_position: string | null
          email: string | null
          id: string | null
          industry: string | null
          is_master_user: boolean | null
          linkedin_url: string | null
          master_email: string | null
          name: string | null
          onboarding_completed: boolean | null
          organization_id: string | null
          professional_bio: string | null
          role_id: string | null
          skills: string[] | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          available_for_networking?: boolean | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          current_position?: string | null
          email?: never
          id?: string | null
          industry?: string | null
          is_master_user?: boolean | null
          linkedin_url?: never
          master_email?: never
          name?: never
          onboarding_completed?: boolean | null
          organization_id?: string | null
          professional_bio?: string | null
          role_id?: string | null
          skills?: string[] | null
          updated_at?: string | null
          whatsapp_number?: never
        }
        Update: {
          available_for_networking?: boolean | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          current_position?: string | null
          email?: never
          id?: string | null
          industry?: string | null
          is_master_user?: boolean | null
          linkedin_url?: never
          master_email?: never
          name?: never
          onboarding_completed?: boolean | null
          organization_id?: string | null
          professional_bio?: string | null
          role_id?: string | null
          skills?: string[] | null
          updated_at?: string | null
          whatsapp_number?: never
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invite: { Args: { token: string }; Returns: Json }
      activate_invited_user: {
        Args: {
          p_email: string
          p_invite_token?: string
          p_name: string
          p_user_id: string
        }
        Returns: Json
      }
      admin_add_team_member: {
        Args: {
          p_master_user_id: string
          p_member_email: string
          p_organization_id: string
        }
        Returns: Json
      }
      admin_complete_user_cleanup:
        | { Args: { user_email: string }; Returns: Json }
        | { Args: { target_user_id: string }; Returns: Json }
      admin_correct_auth_email: {
        Args: {
          admin_notes?: string
          new_email: string
          target_user_id: string
        }
        Returns: Json
      }
      admin_decrypt_email: { Args: { email_id: string }; Returns: Json }
      admin_force_delete_auth_user: {
        Args: { target_user_id: string }
        Returns: Json
      }
      admin_get_all_profiles: {
        Args: never
        Returns: {
          annual_revenue: string | null
          available_for_networking: boolean | null
          avatar_url: string | null
          company_name: string | null
          company_size: string | null
          created_at: string
          current_position: string | null
          email: string
          id: string
          industry: string | null
          is_active: boolean | null
          is_master_user: boolean | null
          last_active: string | null
          linkedin_url: string | null
          main_challenge: string | null
          master_email: string | null
          name: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          organization_id: string | null
          plan_type: string | null
          primary_goal: string | null
          priority_areas: string[] | null
          professional_bio: string | null
          referrals_count: number
          role: string
          role_id: string | null
          skills: string[] | null
          status: string | null
          successful_referrals_count: number
          team_size: number | null
          updated_at: string | null
          whatsapp_number: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_remove_team_member: {
        Args: { p_member_id: string; p_organization_id: string }
        Returns: Json
      }
      admin_reset_user: { Args: { target_user_id: string }; Returns: Json }
      admin_reset_user_secure: { Args: { user_email: string }; Returns: Json }
      admin_secure_delete_user_v2: {
        Args: { target_email: string }
        Returns: Json
      }
      analyze_rls_security_issues: {
        Args: never
        Returns: {
          issue_description: string
          policy_definition: string
          policy_name: string
          policy_type: string
          recommendation: string
          security_level: string
          table_name: string
        }[]
      }
      audit_legacy_references: { Args: never; Returns: Json }
      auto_generate_course_certificate: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: Json
      }
      auto_generate_solution_certificate: {
        Args: { p_solution_id: string; p_user_id: string }
        Returns: Json
      }
      automated_security_monitor: { Args: never; Returns: Json }
      backup_all_onboarding_data: { Args: never; Returns: Json }
      backup_table_data: {
        Args: { p_reason?: string; p_table_name: string }
        Returns: Json
      }
      calculate_average_score: { Args: { scores: number[] }; Returns: number }
      calculate_business_compatibility:
        | { Args: { user1_id: string; user2_id: string }; Returns: number }
        | {
            Args: {
              user1_ai_level: string
              user1_company_size: string
              user1_objectives: string[]
              user1_segment: string
              user2_ai_level: string
              user2_company_size: string
              user2_objectives: string[]
              user2_segment: string
            }
            Returns: number
          }
      can_access_benefit: {
        Args: { p_tool_id: string; p_user_id: string }
        Returns: boolean
      }
      can_access_course: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: boolean
      }
      can_access_course_enhanced: {
        Args: { target_course_id: string; target_user_id: string }
        Returns: boolean
      }
      can_access_learning_content: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      can_access_tool: {
        Args: { p_tool_id: string; p_user_id: string }
        Returns: boolean
      }
      can_assign_role: {
        Args: { admin_user_id: string; target_role_id: string }
        Returns: boolean
      }
      can_manage_role: {
        Args: { target_role_name: string; user_id: string }
        Returns: boolean
      }
      can_use_invite:
        | { Args: { p_token: string; p_user_id: string }; Returns: boolean }
        | { Args: { invite_token: string; user_email: string }; Returns: Json }
      can_view_connection_secure: {
        Args: { target_connection_id: string }
        Returns: boolean
      }
      can_view_full_profile: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      change_user_role: {
        Args: { new_role_id: string; target_user_id: string }
        Returns: Json
      }
      check_admin_access: { Args: never; Returns: boolean }
      check_admin_access_secure: { Args: never; Returns: boolean }
      check_ai_solution_limit: { Args: { p_user_id: string }; Returns: Json }
      check_and_fix_onboarding_data: {
        Args: { user_id_param: string }
        Returns: Json
      }
      check_comment_rate_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_comment_rate_limit_secure: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_course_completion: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: boolean
      }
      check_function_security_status: {
        Args: never
        Returns: {
          function_name: string
          recommendation: string
          search_path_status: string
          security_type: string
        }[]
      }
      check_invite_rate_limit: {
        Args: {
          p_action_type: string
          p_identifier?: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_nps_rate_limit: {
        Args: { p_lesson_id: string; p_user_id: string }
        Returns: boolean
      }
      check_nps_rate_limit_secure: {
        Args: { p_lesson_id: string; p_user_id: string }
        Returns: boolean
      }
      check_onboarding_integrity: { Args: { p_user_id: string }; Returns: Json }
      check_rate_limit:
        | {
            Args: {
              p_action_type: string
              p_identifier: string
              p_max_attempts?: number
              p_window_minutes?: number
            }
            Returns: boolean
          }
        | {
            Args: { p_action: string; p_limit_per_hour?: number }
            Returns: boolean
          }
        | {
            Args: {
              action_type: string
              max_attempts: number
              time_window: unknown
              user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              action_type: string
              max_attempts?: number
              window_minutes?: number
            }
            Returns: boolean
          }
      check_rate_limit_advanced: {
        Args: {
          p_action: string
          p_identifier?: string
          p_limit_per_hour?: number
          p_limit_per_minute?: number
        }
        Returns: Json
      }
      check_rate_limit_safe: {
        Args: {
          p_action: string
          p_identifier?: string
          p_limit_per_hour?: number
          p_limit_per_minute?: number
        }
        Returns: Json
      }
      check_referral: { Args: { p_token: string }; Returns: Json }
      check_rls_status: {
        Args: never
        Returns: {
          has_policies: boolean
          policy_count: number
          rls_enabled: boolean
          security_status: string
          table_name: string
        }[]
      }
      check_role_system_integrity: { Args: never; Returns: Json }
      check_solution_certificate_eligibility: {
        Args: { p_solution_id: string; p_user_id: string }
        Returns: boolean
      }
      check_solution_completion: {
        Args: { p_solution_id: string; p_user_id: string }
        Returns: boolean
      }
      check_system_health: { Args: never; Returns: Json }
      check_tables_without_rls: {
        Args: never
        Returns: {
          recommendation: string
          risk_level: string
          rls_status: string
          table_name: string
        }[]
      }
      check_whatsapp_config: { Args: never; Returns: Json }
      clean_html_tags: { Args: { input_text: string }; Returns: string }
      clean_old_data: {
        Args: { p_retention_period?: unknown; p_table_name: string }
        Returns: Json
      }
      clean_user_onboarding_data: { Args: { p_user_id: string }; Returns: Json }
      cleanup_expired_cache: { Args: never; Returns: number }
      cleanup_expired_invites: { Args: never; Returns: Json }
      cleanup_expired_invites_enhanced: { Args: never; Returns: Json }
      cleanup_expired_rate_limits: { Args: never; Returns: number }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      cleanup_expired_sessions_enhanced: { Args: never; Returns: number }
      cleanup_old_analytics: { Args: { p_days_old?: number }; Returns: Json }
      cleanup_old_audit_logs: {
        Args: { retention_period?: unknown }
        Returns: number
      }
      cleanup_old_emails: { Args: never; Returns: undefined }
      cleanup_old_logs_lgpd: { Args: never; Returns: Json }
      cleanup_old_rate_limits: { Args: never; Returns: number }
      cleanup_onboarding_orphans: { Args: never; Returns: Json }
      cleanup_orphaned_data: { Args: never; Returns: Json }
      cleanup_orphaned_sessions: { Args: never; Returns: number }
      cleanup_stale_sessions: { Args: never; Returns: Json }
      cleanup_user_auth_state: {
        Args: { target_user_id?: string }
        Returns: boolean
      }
      clear_all_networking_data:
        | { Args: { p_user_id: string }; Returns: Json }
        | { Args: never; Returns: Json }
      complete_invite_registration:
        | { Args: { p_token: string; p_user_id: string }; Returns: Json }
        | { Args: { p_invite_token: string; p_user_id: string }; Returns: Json }
      complete_onboarding_and_unlock_features: {
        Args: { p_user_id: string }
        Returns: Json
      }
      complete_onboarding_final_flow: {
        Args: { p_user_id: string }
        Returns: Json
      }
      complete_onboarding_flow: { Args: { p_user_id: string }; Returns: Json }
      complete_onboarding_secure:
        | { Args: { p_user_id: string }; Returns: Json }
        | {
            Args: {
              p_ip_address?: string
              p_onboarding_data: Json
              p_user_agent?: string
              p_user_id: string
            }
            Returns: Json
          }
      configure_auth_security_settings: { Args: never; Returns: Json }
      create_community_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      create_invite: {
        Args: {
          p_email: string
          p_expires_in?: unknown
          p_notes?: string
          p_role_id: string
        }
        Returns: Json
      }
      create_invite_batch:
        | { Args: { p_invites: Json }; Returns: Json }
        | {
            Args: {
              p_emails: string[]
              p_expires_in?: unknown
              p_role_id: string
            }
            Returns: Json
          }
      create_invite_hybrid: {
        Args: {
          p_channel_preference?: string
          p_email: string
          p_expires_in?: unknown
          p_notes?: string
          p_phone?: string
          p_role_id: string
        }
        Returns: Json
      }
      create_learning_certificate_if_eligible: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: string
      }
      create_metadata_snapshot: { Args: never; Returns: Json }
      create_missing_profile_safe: {
        Args: { target_user_id: string }
        Returns: Json
      }
      create_network_connection: {
        Args: { p_message?: string; p_recipient_id: string }
        Returns: Json
      }
      create_notification:
        | {
            Args: {
              p_message: string
              p_metadata?: Json
              p_title: string
              p_type?: string
              p_user_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_action_url?: string
              p_category?: string
              p_data?: Json
              p_message: string
              p_priority?: string
              p_title: string
              p_type: string
              p_user_id: string
            }
            Returns: string
          }
      create_onboarding_backup: {
        Args: { p_backup_type?: string; p_user_id: string }
        Returns: string
      }
      create_referral: {
        Args: {
          p_expires_in?: unknown
          p_referrer_id: string
          p_role_id?: string
          p_type: string
        }
        Returns: Json
      }
      create_solution_certificate_if_eligible: {
        Args: { p_solution_id: string; p_user_id: string }
        Returns: string
      }
      create_storage_public_policy: {
        Args: { bucket_name: string }
        Returns: Json
      }
      create_storage_public_policy_v2: {
        Args: { bucket_name: string }
        Returns: Json
      }
      create_user_backup: {
        Args: { p_backup_type?: string; p_user_id: string }
        Returns: Json
      }
      create_user_badge: {
        Args: { badge_id: string; user_id: string }
        Returns: string
      }
      createstoragepublicpolicy: { Args: never; Returns: Json }
      current_user_is_admin: { Args: never; Returns: boolean }
      debug_tool_permissions: { Args: { user_id?: string }; Returns: Json }
      decrement: {
        Args: { column_name: string; row_id: string; table_name: string }
        Returns: undefined
      }
      decrement_suggestion_downvote: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
      decrement_suggestion_upvote: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
      decrypt_email_content: { Args: { encrypted: string }; Returns: string }
      delete_community_post: { Args: { post_id: string }; Returns: Json }
      delete_community_topic: { Args: { p_topic_id: string }; Returns: Json }
      delete_forum_post: { Args: { p_post_id: string }; Returns: Json }
      delete_forum_topic: { Args: { p_topic_id: string }; Returns: Json }
      delete_user_complete: { Args: { target_user_id: string }; Returns: Json }
      deleteforumpost: { Args: { post_id: string }; Returns: Json }
      deleteforumtopic: { Args: { topic_id: string }; Returns: Json }
      detect_at_risk_users: { Args: never; Returns: undefined }
      detect_login_anomaly: {
        Args: { p_ip_address: string; p_user_id: string }
        Returns: boolean
      }
      detect_navigation_loop: {
        Args: { p_path: string; p_session_id?: string; p_user_id: string }
        Returns: Json
      }
      detect_security_changes: { Args: never; Returns: Json }
      diagnose_auth_state: { Args: { target_user_id?: string }; Returns: Json }
      diagnose_onboarding_system: { Args: never; Returns: Json }
      diagnose_stuck_users: {
        Args: never
        Returns: {
          completed_steps: number[]
          current_step: number
          email: string
          hours_stuck: number
          suggested_action: string
          user_id: string
        }[]
      }
      encrypt_email_content: { Args: { content: string }; Returns: string }
      enhanced_rate_limit_check: {
        Args: {
          p_action_type: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      enhanced_security_audit: { Args: never; Returns: Json }
      ensure_audit_log: {
        Args: {
          p_action: string
          p_details?: Json
          p_event_type: string
          p_resource_id?: string
          p_retry_count?: number
        }
        Returns: boolean
      }
      ensure_bucket_exists: { Args: { p_bucket_name: string }; Returns: Json }
      fix_audit_logs_rls_violations: { Args: never; Returns: Json }
      fix_existing_onboarding_data: { Args: never; Returns: Json }
      fix_existing_users_onboarding: { Args: never; Returns: Json }
      fix_incomplete_onboarding_states: { Args: never; Returns: Json }
      fix_orphaned_invites: { Args: never; Returns: Json }
      fix_stuck_onboarding_users: { Args: never; Returns: Json }
      force_cleanup_connections: { Args: never; Returns: Json }
      format_currency: { Args: { amount: number }; Returns: string }
      format_phone: { Args: { phone: string }; Returns: string }
      format_relative_time: { Args: { target_date: string }; Returns: string }
      generate_certificate_validation_code: { Args: never; Returns: string }
      generate_compatibility_score: {
        Args: { user1_id: string; user2_id: string }
        Returns: number
      }
      generate_email_template: {
        Args: { template_type: string; user_data: Json }
        Returns: Json
      }
      generate_event_recurrence: {
        Args: { input_event_id: string }
        Returns: Json
      }
      generate_final_security_report: {
        Args: never
        Returns: {
          details: string
          recommendations: string
          report_section: string
          status: string
        }[]
      }
      generate_invite_token: { Args: never; Returns: string }
      generate_networking_matches_for_user: {
        Args: { target_user_id: string }
        Returns: Json
      }
      generate_nps_response_code: { Args: never; Returns: string }
      generate_pending_certificates: {
        Args: { p_user_id?: string }
        Returns: Json
      }
      generate_personalized_completion_message: {
        Args: { onboarding_data: Json }
        Returns: Json
      }
      generate_recurring_event_instances:
        | { Args: { parent_event_id: string }; Returns: Json }
        | {
            Args: { p_event_id: string; p_max_instances?: number }
            Returns: Json
          }
      generate_referral_token: { Args: never; Returns: string }
      generate_retroactive_certificates: { Args: never; Returns: Json }
      generate_secure_token: {
        Args: { token_length?: number }
        Returns: string
      }
      generate_security_completion_report: { Args: never; Returns: Json }
      generate_security_metrics: { Args: never; Returns: undefined }
      generate_slug: { Args: { input_text: string }; Returns: string }
      generate_smart_networking_matches: {
        Args: { max_matches?: number; target_user_id: string }
        Returns: Json
      }
      get_admin_analytics_overview: {
        Args: never
        Returns: {
          active_learners: number
          active_users_7d: number
          completed_implementations: number
          completed_onboarding: number
          completion_rate: number
          growth_rate: number
          new_solutions_30d: number
          new_users_30d: number
          total_lessons: number
          total_solutions: number
          total_users: number
        }[]
      }
      get_admin_analytics_overview_secure: {
        Args: never
        Returns: {
          active_users_24h: number
          avg_implementation_time_hours: number
          completed_implementations: number
          completion_rate: number
          new_users_30d: number
          total_solutions: number
          total_users: number
        }[]
      }
      get_admin_analytics_temp: {
        Args: never
        Returns: {
          active_implementations: number
          active_users_7d: number
          completed_implementations: number
          new_implementations_30d: number
          new_users_30d: number
          overall_completion_rate: number
          total_solutions: number
          total_users: number
        }[]
      }
      get_admin_comment_stats: { Args: never; Returns: Json }
      get_admin_learning_comments: {
        Args: {
          p_course_id?: string
          p_lesson_id?: string
          p_limit?: number
          p_offset?: number
          p_status?: string
        }
        Returns: {
          admin_replied: boolean
          content: string
          course_title: string
          created_at: string
          id: string
          lesson_id: string
          lesson_title: string
          module_title: string
          parent_id: string
          replies_count: number
          updated_at: string
          user_avatar_url: string
          user_id: string
          user_name: string
        }[]
      }
      get_admin_stats: { Args: never; Returns: Json }
      get_admin_user_stats: { Args: never; Returns: Json }
      get_admin_user_stats_public: { Args: never; Returns: Json }
      get_age_from_date: { Args: { birth_date: string }; Returns: number }
      get_analytics_overview: { Args: never; Returns: Json }
      get_audit_logs_secure: {
        Args: never
        Returns: {
          action: string
          details: Json
          event_type: string
          log_id: string
          log_timestamp: string
          severity: string
          user_id: string
        }[]
      }
      get_average_implementation_time: { Args: never; Returns: number }
      get_benefits_safe: {
        Args: never
        Returns: {
          benefit_description: string
          benefit_link: string
          benefit_title: string
          benefit_type: string
          category: string
          description: string
          id: string
          logo_url: string
          name: string
          status: boolean
        }[]
      }
      get_cached_profile: { Args: { target_user_id: string }; Returns: Json }
      get_completion_rate_by_solution: {
        Args: { time_range?: string }
        Returns: {
          completion: number
          name: string
        }[]
      }
      get_connection_stats: {
        Args: never
        Returns: {
          application_name: string
          backend_start: string
          client_addr: unknown
          pid: number
          query: string
          state: string
          usename: unknown
        }[]
      }
      get_courses_with_stats: {
        Args: never
        Returns: {
          cover_image_url: string
          created_at: string
          created_by: string
          description: string
          id: string
          is_restricted: boolean
          lesson_count: number
          module_count: number
          order_index: number
          published: boolean
          slug: string
          title: string
          updated_at: string
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_current_user_role_safe: { Args: never; Returns: string }
      get_engagement_metrics_by_period: {
        Args: { time_range?: string }
        Returns: {
          name: string
          value: number
        }[]
      }
      get_engagement_metrics_secure: { Args: never; Returns: Json }
      get_enhanced_user_stats_public: { Args: never; Returns: Json }
      get_implementation_stats_secure: { Args: never; Returns: Json }
      get_invite_dashboard_stats: {
        Args: never
        Returns: {
          active_invites: number
          conversion_rate: number
          expired_invites: number
          recent_invites: number
          total_invites: number
          used_invites: number
        }[]
      }
      get_learning_courses_with_stats: {
        Args: never
        Returns: {
          cover_image_url: string
          created_at: string
          created_by: string
          description: string
          enrolled_users: number
          id: string
          order_index: number
          published: boolean
          slug: string
          title: string
          total_lessons: number
          total_modules: number
          updated_at: string
        }[]
      }
      get_lessons_with_relations: {
        Args: { p_course_id?: string }
        Returns: Json
      }
      get_master_members_count: { Args: { master_id: string }; Returns: number }
      get_master_team_members: {
        Args: { p_master_user_id: string; p_organization_id: string }
        Returns: {
          avatar_url: string
          company_name: string
          created_at: string
          email: string
          id: string
          industry: string
          name: string
          onboarding_completed: boolean
          role_id: string
          user_roles: Json
        }[]
      }
      get_networking_analytics: { Args: never; Returns: Json }
      get_networking_contacts:
        | {
            Args: { p_user_id: string }
            Returns: {
              avatar_url: string
              company_name: string
              compatibility_score: number
              current_position: string
              email: string
              id: string
              match_type: string
              name: string
            }[]
          }
        | {
            Args: { p_user_ids: string[] }
            Returns: {
              company_name: string
              current_position: string
              linkedin_url: string
              phone: string
              profile_picture: string
              user_id: string
            }[]
          }
      get_networking_stats_secure: { Args: never; Returns: Json }
      get_nps_analytics: {
        Args: never
        Returns: {
          average_score: number
          detractors_count: number
          nps_score: number
          passives_count: number
          promoters_count: number
          response_rate: number
          total_responses: number
        }[]
      }
      get_nps_analytics_data: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          course_title: string
          created_at: string
          feedback: string
          id: string
          lesson_id: string
          lesson_title: string
          module_title: string
          response_code: string
          score: number
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_nps_analytics_secure: { Args: never; Returns: Json }
      get_nps_evolution_data: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_onboarding_analytics: { Args: never; Returns: Json }
      get_onboarding_progress: { Args: { p_user_id: string }; Returns: Json }
      get_onboarding_stats_admin: { Args: never; Returns: Json }
      get_privilege_escalation_attempts: {
        Args: never
        Returns: {
          attempt_date: string
          attempted_role: string
          details: Json
          user_email: string
        }[]
      }
      get_profile_safe: {
        Args: { target_user_id?: string }
        Returns: {
          annual_revenue: string | null
          available_for_networking: boolean | null
          avatar_url: string | null
          company_name: string | null
          company_size: string | null
          created_at: string
          current_position: string | null
          email: string
          id: string
          industry: string | null
          is_active: boolean | null
          is_master_user: boolean | null
          last_active: string | null
          linkedin_url: string | null
          main_challenge: string | null
          master_email: string | null
          name: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          organization_id: string | null
          plan_type: string | null
          primary_goal: string | null
          priority_areas: string[] | null
          professional_bio: string | null
          referrals_count: number
          role: string
          role_id: string | null
          skills: string[] | null
          status: string | null
          successful_referrals_count: number
          team_size: number | null
          updated_at: string | null
          whatsapp_number: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_progress_analytics: { Args: never; Returns: Json }
      get_recent_system_activities: {
        Args: { limit_count?: number }
        Returns: {
          created_at: string
          event_type: string
          id: string
          solution: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_safe_profile: { Args: { target_user_id: string }; Returns: Json }
      get_security_configuration_reminders: { Args: never; Returns: Json }
      get_security_metrics: {
        Args: { p_days?: number; p_user_id?: string }
        Returns: Json
      }
      get_simplified_user_stats_public: { Args: never; Returns: Json }
      get_solution_performance_metrics: {
        Args: never
        Returns: {
          avg_rating: number
          category: string
          completion_rate: number
          created_at: string
          id: string
          title: string
          total_implementations: number
        }[]
      }
      get_standardized_buckets: {
        Args: never
        Returns: {
          bucket_id: string
          bucket_name: string
          created_at: string
          public: boolean
          updated_at: string
        }[]
      }
      get_stats_overview: { Args: never; Returns: Json }
      get_system_health_check: { Args: never; Returns: Json }
      get_system_setting: { Args: { setting_key: string }; Returns: string }
      get_total_referrals: { Args: { p_user_id: string }; Returns: number }
      get_unified_analytics_data: {
        Args: { time_range?: string }
        Returns: Json
      }
      get_unified_checklist: {
        Args: {
          p_checklist_type?: string
          p_solution_id: string
          p_user_id: string
        }
        Returns: {
          checklist_data: Json
          checklist_type: string
          completed_at: string
          completed_items: number
          created_at: string
          id: string
          is_completed: boolean
          is_template: boolean
          metadata: Json
          progress_percentage: number
          solution_id: string
          template_id: string
          total_items: number
          updated_at: string
          user_id: string
        }[]
      }
      get_user_analytics_summary: {
        Args: { p_days_back?: number; p_user_id: string }
        Returns: Json
      }
      get_user_badges: {
        Args: { p_user_id: string }
        Returns: {
          category: string
          description: string
          earned_at: string
          id: string
          image_url: string
          name: string
        }[]
      }
      get_user_complete_data: { Args: { p_user_id: string }; Returns: Json }
      get_user_engagement_metrics: {
        Args: { time_range?: string }
        Returns: Json
      }
      get_user_growth_by_date: {
        Args: never
        Returns: {
          date: string
          name: string
          novos: number
          total: number
        }[]
      }
      get_user_growth_secure: {
        Args: never
        Returns: {
          cumulative_users: number
          date_period: string
          new_users: number
        }[]
      }
      get_user_growth_trends: { Args: { time_range?: string }; Returns: Json }
      get_user_journey_analytics: {
        Args: { time_range?: string }
        Returns: Json
      }
      get_user_learning_stats: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_user_organization: { Args: never; Returns: string }
      get_user_permissions: { Args: { p_user_id: string }; Returns: string[] }
      get_user_profile_optimized: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_user_profile_optimized_secure: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_user_profile_safe: {
        Args: { target_user_id: string }
        Returns: {
          company_name: string
          created_at: string
          email: string
          id: string
          name: string
          onboarding_completed: boolean
          onboarding_completed_at: string
          role_id: string
          updated_at: string
          user_roles: Json
        }[]
      }
      get_user_role:
        | { Args: { user_id: string }; Returns: string }
        | { Args: never; Returns: string }
      get_user_role_safe: { Args: { user_id?: string }; Returns: string }
      get_user_role_secure: {
        Args: { target_user_id?: string }
        Returns: string
      }
      get_user_role_via_table: { Args: never; Returns: string }
      get_user_security_permissions: {
        Args: { user_id: string }
        Returns: string[]
      }
      get_user_segmentation_analytics: {
        Args: never
        Returns: {
          percentage: number
          role_name: string
          user_count: number
        }[]
      }
      get_user_segmentation_secure: { Args: never; Returns: Json }
      get_user_share_stats: { Args: { user_uuid: string }; Returns: Json }
      get_user_stats_corrected: { Args: never; Returns: Json }
      get_users_paginated: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_organization_id?: string
          p_search?: string
          p_user_type?: string
        }
        Returns: {
          avatar_url: string
          company_name: string
          created_at: string
          email: string
          id: string
          industry: string
          is_master_user: boolean
          name: string
          organization: Json
          organization_id: string
          role: string
          role_id: string
          total_count: number
          user_roles: Json
        }[]
      }
      get_users_paginated_public: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_organization_id?: string
          p_search?: string
          p_user_type?: string
        }
        Returns: {
          avatar_url: string
          company_name: string
          created_at: string
          email: string
          id: string
          industry: string
          is_master_user: boolean
          name: string
          organization: Json
          organization_id: string
          role: string
          role_id: string
          total_count: number
          user_roles: Json
        }[]
      }
      get_users_with_advanced_filters_public: {
        Args: {
          p_date_filter?: string
          p_limit?: number
          p_offset?: number
          p_onboarding?: string
          p_organization_id?: string
          p_role_id?: string
          p_search?: string
          p_status?: string
          p_user_type?: string
        }
        Returns: {
          avatar_url: string
          company_name: string
          created_at: string
          email: string
          id: string
          industry: string
          is_master_user: boolean
          name: string
          onboarding_completed: boolean
          organization: Json
          organization_id: string
          role_id: string
          status: string
          total_count: number
          user_roles: Json
        }[]
      }
      get_users_with_filters_corrected:
        | {
            Args: {
              p_date_range?: string
              p_limit?: number
              p_offset?: number
              p_onboarding?: string
              p_search_query?: string
              p_status?: string
              p_user_type?: string
            }
            Returns: {
              avatar_url: string
              company_name: string
              created_at: string
              email: string
              id: string
              industry: string
              is_master_user: boolean
              master_email: string
              name: string
              onboarding_completed: boolean
              role: string
              role_id: string
              status: string
              total_count: number
              updated_at: string
              user_roles: Json
            }[]
          }
        | {
            Args: {
              p_limit?: number
              p_offset?: number
              p_search?: string
              p_user_type?: string
            }
            Returns: {
              avatar_url: string
              company_name: string
              created_at: string
              email: string
              id: string
              industry: string
              is_master_user: boolean
              name: string
              onboarding_completed: boolean
              organization: Json
              organization_id: string
              role_id: string
              total_count: number
              user_roles: Json
            }[]
          }
        | {
            Args: {
              p_filter_type?: string
              p_limit?: number
              p_offset?: number
              p_search_query?: string
            }
            Returns: {
              avatar_url: string
              company_name: string
              created_at: string
              email: string
              id: string
              industry: string
              master_email: string
              member_count: number
              name: string
              onboarding_completed: boolean
              role: string
              role_id: string
            }[]
          }
      get_users_with_filters_public: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_user_type?: string
        }
        Returns: {
          avatar_url: string
          company_name: string
          created_at: string
          email: string
          id: string
          industry: string
          is_master_user: boolean
          name: string
          onboarding_completed: boolean
          organization: Json
          organization_id: string
          role: string
          role_id: string
          total_count: number
          user_roles: Json
        }[]
      }
      get_users_with_filters_v2: {
        Args: {
          p_filter_type?: string
          p_limit?: number
          p_offset?: number
          p_search_query?: string
        }
        Returns: {
          avatar_url: string
          company_name: string
          created_at: string
          email: string
          id: string
          industry: string
          is_master_user: boolean
          master_email: string
          member_count: number
          name: string
          onboarding_completed: boolean
          organization: Json
          organization_id: string
          role: string
          role_id: string
          total_count: number
          user_roles: Json
        }[]
      }
      get_users_with_master_members_public: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_user_type?: string
        }
        Returns: {
          avatar_url: string
          company_name: string
          created_at: string
          email: string
          id: string
          industry: string
          is_master_user: boolean
          name: string
          onboarding_completed: boolean
          organization: Json
          organization_id: string
          role: string
          role_id: string
          total_count: number
          user_roles: Json
        }[]
      }
      get_users_with_roles: {
        Args: {
          limit_count?: number
          offset_count?: number
          search_query?: string
        }
        Returns: {
          avatar_url: string
          company_name: string
          created_at: string
          email: string
          id: string
          industry: string
          name: string
          role: string
          role_id: string
          user_roles: Json
        }[]
      }
      get_visible_events_for_user: {
        Args: { p_user_id: string }
        Returns: {
          cover_image_url: string
          created_at: string
          created_by: string
          description: string
          end_time: string
          id: string
          is_recurring: boolean
          location_link: string
          parent_event_id: string
          physical_location: string
          recurrence_count: number
          recurrence_day: number
          recurrence_end_date: string
          recurrence_interval: number
          recurrence_pattern: string
          start_time: string
          title: string
        }[]
      }
      get_weekly_activity_patterns: {
        Args: never
        Returns: {
          atividade: number
          day: string
          day_of_week: number
        }[]
      }
      get_weekly_activity_secure: {
        Args: never
        Returns: {
          active_users: number
          total_events: number
          week_start: string
        }[]
      }
      handle_supabase_email_rate_limit_error: {
        Args: { error_message: string }
        Returns: Json
      }
      has_role: { Args: { role_name: string }; Returns: boolean }
      has_role_name: {
        Args: { check_user_id?: string; role_name: string }
        Returns: boolean
      }
      hash_sensitive_data: { Args: { input_data: string }; Returns: string }
      hash_sensitive_data_secure: {
        Args: { input_text: string }
        Returns: string
      }
      identify_insecure_functions: { Args: never; Returns: Json }
      increment: {
        Args: { column_name: string; row_id: string; table_name: string }
        Returns: undefined
      }
      increment_ai_solution_usage: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      increment_benefit_clicks: {
        Args: { tool_id: string }
        Returns: undefined
      }
      increment_invite_send_attempts: {
        Args: { invite_id_param: string }
        Returns: undefined
      }
      increment_suggestion_downvote: {
        Args: { p_suggestion_id: string }
        Returns: Json
      }
      increment_suggestion_upvote: {
        Args: { p_suggestion_id: string }
        Returns: Json
      }
      increment_topic_replies: {
        Args: { topic_id: string }
        Returns: undefined
      }
      increment_topic_views: { Args: { topic_id: string }; Returns: undefined }
      initialize_networking_preferences_for_user: {
        Args: { target_user_id: string }
        Returns: Json
      }
      initialize_onboarding_for_all_users: { Args: never; Returns: Json }
      initialize_onboarding_for_all_users_secure: { Args: never; Returns: Json }
      initialize_onboarding_for_user: {
        Args: { p_invite_token?: string; p_user_id: string }
        Returns: Json
      }
      invalidate_profile_cache: {
        Args: { user_id?: string }
        Returns: undefined
      }
      invalidate_profile_cache_secure: {
        Args: { user_id?: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_safe: { Args: never; Returns: boolean }
      is_admin_secure: { Args: { target_user_id?: string }; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_admin_via_role_table: { Args: never; Returns: boolean }
      is_legacy_user: { Args: { user_id: string }; Returns: boolean }
      is_new_user: { Args: { check_user_id?: string }; Returns: boolean }
      is_organization_master: { Args: { org_id: string }; Returns: boolean }
      is_owner: { Args: { resource_user_id: string }; Returns: boolean }
      is_user_admin:
        | { Args: never; Returns: boolean }
        | { Args: { user_id?: string }; Returns: boolean }
      is_user_admin_enhanced: { Args: { user_id?: string }; Returns: boolean }
      is_user_admin_fast: { Args: { target_user_id: string }; Returns: boolean }
      is_user_admin_safe: { Args: { user_id: string }; Returns: boolean }
      is_user_admin_secure: {
        Args: { target_user_id?: string }
        Returns: boolean
      }
      is_user_admin_via_jwt: { Args: never; Returns: boolean }
      is_valid_url: { Args: { url: string }; Returns: boolean }
      issue_solution_certificate: {
        Args: {
          p_implementation_data?: Json
          p_solution_id: string
          p_user_id: string
        }
        Returns: Json
      }
      log_auth_event_secure: {
        Args: {
          p_action: string
          p_additional_data?: Json
          p_event_type: string
          p_user_id?: string
        }
        Returns: undefined
      }
      log_critical_action: {
        Args: { p_action: string; p_details?: Json }
        Returns: undefined
      }
      log_invite_delivery: {
        Args: {
          p_channel: string
          p_error_message?: string
          p_invite_id: string
          p_metadata?: Json
          p_provider_id?: string
          p_status: string
        }
        Returns: string
      }
      log_invite_validation_attempt: {
        Args: { p_details: string; p_success: boolean; p_token: string }
        Returns: undefined
      }
      log_learning_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id: string
          p_resource_type: string
        }
        Returns: undefined
      }
      log_onboarding_event: {
        Args: {
          p_event_data?: Json
          p_event_type: string
          p_step: number
          p_user_id: string
        }
        Returns: undefined
      }
      log_permission_change: {
        Args: {
          action_type: string
          ip_address?: string
          new_value?: string
          old_value?: string
          permission_code?: string
          permission_id?: string
          role_id?: string
          role_name?: string
          target_user_id?: string
          user_id: string
        }
        Returns: string
      }
      log_registration_attempt: {
        Args: { p_email: string; p_error_details?: Json; p_success: boolean }
        Returns: undefined
      }
      log_rls_violation_attempt: {
        Args: { p_operation: string; p_table_name: string; p_user_id?: string }
        Returns: undefined
      }
      log_security_access: {
        Args: {
          p_operation: string
          p_resource_id?: string
          p_table_name: string
        }
        Returns: undefined
      }
      log_security_event:
        | {
            Args: {
              p_action_type: string
              p_new_values?: Json
              p_old_values?: Json
              p_resource_id?: string
              p_resource_type: string
            }
            Returns: string
          }
        | {
            Args: {
              p_details?: Json
              p_event_type: string
              p_severity?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_event_data?: Json
              p_event_type: string
              p_ip_address?: unknown
              p_severity?: string
              p_user_agent?: string
              p_user_id?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_action_type: string
              p_new_values?: string
              p_old_values?: string
              p_resource_id?: string
              p_resource_type: string
            }
            Returns: undefined
          }
      log_security_violation:
        | {
            Args: {
              p_additional_data?: Json
              p_auto_block?: boolean
              p_description?: string
              p_ip_address?: string
              p_resource_accessed?: string
              p_severity?: string
              p_user_agent?: string
              p_user_id?: string
              p_violation_type?: string
            }
            Returns: string
          }
        | {
            Args: {
              attempted_action: string
              resource_table: string
              user_context?: Json
              violation_type: string
            }
            Returns: undefined
          }
      log_unauthorized_access: {
        Args: { attempted_action: string; resource_details?: Json }
        Returns: undefined
      }
      log_upload_activity: {
        Args: {
          p_bucket_name: string
          p_error_message?: string
          p_file_path: string
          p_file_size: number
          p_file_type: string
          p_success: boolean
        }
        Returns: undefined
      }
      log_user_action: {
        Args: { action_type: string; details?: Json; user_id: string }
        Returns: undefined
      }
      manage_user_session: {
        Args: {
          p_ip_address?: string
          p_session_token: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      mark_comment_as_replied: { Args: { p_comment_id: string }; Returns: Json }
      mark_notifications_read: {
        Args: { p_notification_ids?: string[]; p_user_id: string }
        Returns: Json
      }
      mask_email: { Args: { email_input: string }; Returns: string }
      mask_email_secure: { Args: { email_input: string }; Returns: string }
      mask_ip_address: { Args: { ip_input: string }; Returns: string }
      mask_personal_name: { Args: { name_input: string }; Returns: string }
      mask_phone_secure: { Args: { phone_input: string }; Returns: string }
      merge_json_data: { Args: { source: Json; target: Json }; Returns: Json }
      migrate_existing_onboarding_data: { Args: never; Returns: undefined }
      migrate_onboarding_data_to_quick: { Args: never; Returns: Json }
      moderate_content: {
        Args: {
          p_action: string
          p_content_id: string
          p_content_type: string
          p_duration_hours?: number
          p_reason: string
        }
        Returns: Json
      }
      monitor_onboarding_flow: { Args: never; Returns: Json }
      normalize_bucket_name: { Args: { bucket_name: string }; Returns: string }
      process_event_reminders: { Args: never; Returns: Json }
      process_excel_data_and_create_masters: { Args: never; Returns: Json }
      process_referral: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json
      }
      process_tool_recommendations: {
        Args: never
        Returns: {
          recommendations_count: number
          user_id: string
        }[]
      }
      quick_check_permission: {
        Args: { permission_code: string; user_id: string }
        Returns: boolean
      }
      reactivate_all_expired_invites_secure: {
        Args: { p_days_extension?: number }
        Returns: Json
      }
      reactivate_invite_secure: {
        Args: { p_days_extension?: number; p_invite_id: string }
        Returns: Json
      }
      recommend_tools_for_user: {
        Args: { p_user_id: string }
        Returns: {
          category: string
          relevance_score: number
          tool_id: string
          tool_name: string
        }[]
      }
      regenerate_recurring_event_dates: { Args: never; Returns: Json }
      register_with_invite: {
        Args: { p_name: string; p_password: string; p_token: string }
        Returns: Json
      }
      request_networking_contact: {
        Args: { requester_message?: string; target_user_id: string }
        Returns: Json
      }
      resend_invite_manual: { Args: { p_invite_id: string }; Returns: Json }
      reset_all_onboarding_data: { Args: never; Returns: Json }
      reset_analytics_data_enhanced: { Args: never; Returns: Json }
      reset_onboarding_step: {
        Args: { p_step: number; p_user_id: string }
        Returns: Json
      }
      reset_user_complete: { Args: { target_user_id: string }; Returns: Json }
      reset_user_onboarding: { Args: { target_user_id: string }; Returns: Json }
      search_users: {
        Args: {
          limit_count?: number
          offset_count?: number
          role_filter?: string
          search_term?: string
        }
        Returns: {
          avatar_url: string
          company_name: string
          created_at: string
          email: string
          id: string
          industry: string
          name: string
          role: string
          role_id: string
        }[]
      }
      secure_assign_role: {
        Args: { new_role_id: string; target_user_id: string }
        Returns: Json
      }
      secure_change_user_role: {
        Args: { new_role_id: string; target_user_id: string }
        Returns: Json
      }
      secure_change_user_role_v2: {
        Args: { new_role_id: string; target_user_id: string }
        Returns: Json
      }
      secure_create_role: {
        Args: {
          p_description?: string
          p_is_system?: boolean
          p_name: string
          p_user_id?: string
        }
        Returns: Json
      }
      secure_create_role_safe: {
        Args: { p_description?: string; p_is_system?: boolean; p_name: string }
        Returns: Json
      }
      secure_credential_validation: {
        Args: { p_validation_code: string }
        Returns: Json
      }
      security_health_check: {
        Args: never
        Returns: {
          check_name: string
          critical_issues: number
          recommendations: string
          status: string
          warning_issues: number
        }[]
      }
      security_improvement_report: { Args: never; Returns: Json }
      send_direct_message: {
        Args: { p_content: string; p_metadata?: Json; p_recipient_id: string }
        Returns: Json
      }
      send_invite_email: { Args: { p_invite_id: string }; Returns: Json }
      send_invite_whatsapp: { Args: { p_invite_id: string }; Returns: Json }
      setup_learning_storage_buckets: { Args: never; Returns: Json }
      simple_health_check: { Args: never; Returns: boolean }
      soft_delete_invite_fast: { Args: { p_invite_id: string }; Returns: Json }
      sync_profile_roles: { Args: never; Returns: Json }
      sync_role_fields: { Args: never; Returns: Json }
      sync_role_permissions_to_jsonb: { Args: never; Returns: Json }
      test_learning_access_debug: { Args: never; Returns: Json }
      test_profile_upload_access: { Args: never; Returns: Json }
      test_reset_onboarding: { Args: { target_email: string }; Returns: Json }
      test_whatsapp_delivery: { Args: never; Returns: Json }
      toggle_topic_solved:
        | { Args: { p_topic_id: string; p_user_id?: string }; Returns: Json }
        | { Args: { topic_id: string }; Returns: Json }
      track_onboarding_step: {
        Args: { p_step_data?: Json; p_step_name: string; p_user_id: string }
        Returns: Json
      }
      track_tool_usage: {
        Args: { p_action?: string; p_metadata?: Json; p_tool_id: string }
        Returns: Json
      }
      track_user_event: {
        Args: { p_event_data?: Json; p_event_type: string }
        Returns: Json
      }
      truncate_text: {
        Args: { input_text: string; max_length: number }
        Returns: string
      }
      update_invite_send_attempt: {
        Args: { invite_id: string }
        Returns: undefined
      }
      update_networking_metrics: {
        Args: { target_user_id: string }
        Returns: Json
      }
      update_onboarding_step: {
        Args: { p_data?: Json; p_step: number; p_user_id: string }
        Returns: Json
      }
      update_user_preferences: {
        Args: { p_preferences: Json; p_user_id: string }
        Returns: Json
      }
      update_user_progress: {
        Args: { p_lesson_id: string; p_progress_data?: Json; p_user_id: string }
        Returns: Json
      }
      use_invite: {
        Args: { invite_token: string; user_id: string }
        Returns: Json
      }
      use_invite_enhanced: {
        Args: { invite_token: string; user_id: string }
        Returns: Json
      }
      use_invite_with_onboarding: {
        Args: { invite_token: string; user_id: string }
        Returns: Json
      }
      user_can_access_feature: {
        Args: { p_feature: string; p_user_id: string }
        Returns: Json
      }
      user_has_permission: {
        Args: { permission_code: string; user_id: string }
        Returns: boolean
      }
      user_has_solutions_access: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      validate_admin_access: { Args: { user_id: string }; Returns: Json }
      validate_all_functions_security: { Args: never; Returns: Json }
      validate_auth_integrity: { Args: never; Returns: Json }
      validate_auth_security_status: { Args: never; Returns: Json }
      validate_bucket_name: { Args: { bucket_name: string }; Returns: boolean }
      validate_certificate: {
        Args: { p_validation_code: string }
        Returns: Json
      }
      validate_certificate_code: {
        Args: { p_validation_code: string }
        Returns: Json
      }
      validate_cnpj: { Args: { cnpj: string }; Returns: boolean }
      validate_complete_rls_security: {
        Args: never
        Returns: {
          policy_count: number
          risk_level: string
          rls_enabled: boolean
          security_status: string
          table_name: string
        }[]
      }
      validate_cpf: { Args: { cpf: string }; Returns: boolean }
      validate_email: { Args: { email: string }; Returns: boolean }
      validate_file_upload: {
        Args: {
          bucket_name: string
          file_name: string
          file_size: number
          file_type: string
        }
        Returns: Json
      }
      validate_input_security: {
        Args: { p_input: string; p_type?: string }
        Returns: boolean
      }
      validate_invite_token: {
        Args: { p_token: string }
        Returns: {
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          notes: string
          role_id: string
          used_at: string
        }[]
      }
      validate_invite_token_enhanced: {
        Args: { p_token: string }
        Returns: Json
      }
      validate_invite_token_safe: { Args: { p_token: string }; Returns: Json }
      validate_invite_token_secure: {
        Args: { p_token: string }
        Returns: {
          email: string
          expires_at: string
          id: string
          is_valid: boolean
          role_id: string
        }[]
      }
      validate_onboarding_state: { Args: { p_user_id?: string }; Returns: Json }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
      validate_password_strength_enhanced: {
        Args: { password: string }
        Returns: Json
      }
      validate_password_strength_server: {
        Args: { password: string }
        Returns: Json
      }
      validate_policy_consolidation: { Args: never; Returns: Json }
      validate_profile_roles: {
        Args: never
        Returns: {
          email: string
          expected_role_id: string
          expected_role_name: string
          issue_type: string
          user_id: string
          user_role: string
          user_role_id: string
        }[]
      }
      validate_role_change:
        | {
            Args: {
              current_user_id?: string
              new_role_id: string
              target_user_id: string
            }
            Returns: boolean
          }
        | {
            Args: { new_role_id: string; target_user_id: string }
            Returns: boolean
          }
      validate_role_consistency: { Args: never; Returns: Json }
      validate_security_fixes: { Args: never; Returns: Json }
      validate_solution_certificate: {
        Args: { p_validation_code: string }
        Returns: Json
      }
      validate_user_invite_match: {
        Args: { p_token: string; p_user_id?: string }
        Returns: Json
      }
      validate_user_password: { Args: { password: string }; Returns: Json }
      validate_user_role: { Args: { p_user_id: string }; Returns: Json }
      verify_permissions_integrity: {
        Args: never
        Returns: {
          affected_resource: string
          description: string
          issue_type: string
          severity: string
        }[]
      }
    }
    Enums: {
      connection_status: "pending" | "accepted" | "rejected"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      difficulty_level_new: "easy" | "medium" | "advanced"
      notification_type:
        | "status_change"
        | "new_comment"
        | "new_vote"
        | "comment_reply"
        | "admin_response"
      referral_status: "pending" | "registered" | "completed"
      solution_category: "Receita" | "Operacional" | "Estratégia"
      solution_category_bkp: "revenue" | "operational" | "strategy"
      suggestion_status:
        | "new"
        | "under_review"
        | "approved"
        | "in_development"
        | "implemented"
        | "rejected"
      vote_type: "upvote" | "downvote"
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
    Enums: {
      connection_status: ["pending", "accepted", "rejected"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      difficulty_level_new: ["easy", "medium", "advanced"],
      notification_type: [
        "status_change",
        "new_comment",
        "new_vote",
        "comment_reply",
        "admin_response",
      ],
      referral_status: ["pending", "registered", "completed"],
      solution_category: ["Receita", "Operacional", "Estratégia"],
      solution_category_bkp: ["revenue", "operational", "strategy"],
      suggestion_status: [
        "new",
        "under_review",
        "approved",
        "in_development",
        "implemented",
        "rejected",
      ],
      vote_type: ["upvote", "downvote"],
    },
  },
} as const
