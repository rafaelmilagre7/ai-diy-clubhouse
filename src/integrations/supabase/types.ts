export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
        Relationships: []
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
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          name?: string
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
            referencedRelation: "benefits"
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
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_community_reports_reported_user_id"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_community_reports_reporter_id"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_community_reports_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "connection_notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "connection_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "course_performance_metrics"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_access_control_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_analytics_data"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_access_control_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_access_control_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses_with_stats"
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
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id?: string
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
          id: string
          invite_id: string | null
          last_attempt_at: string | null
          last_error: string | null
          priority: number | null
          retry_after: string | null
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email: string
          external_id?: string | null
          failed_at?: string | null
          html_content: string
          id?: string
          invite_id?: string | null
          last_attempt_at?: string | null
          last_error?: string | null
          priority?: number | null
          retry_after?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email?: string
          external_id?: string | null
          failed_at?: string | null
          html_content?: string
          id?: string
          invite_id?: string | null
          last_attempt_at?: string | null
          last_error?: string | null
          priority?: number | null
          retry_after?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
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
      forum_categories: {
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
      forum_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_hidden: boolean | null
          is_solution: boolean | null
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
          parent_id?: string | null
          topic_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_reactions: {
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
            foreignKeyName: "forum_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
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
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "forum_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
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
      invites: {
        Row: {
          created_at: string
          created_by: string
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
      learning_certificates: {
        Row: {
          certificate_url: string | null
          course_id: string
          created_at: string
          id: string
          issued_at: string
          user_id: string
          validation_code: string
        }
        Insert: {
          certificate_url?: string | null
          course_id: string
          created_at?: string
          id?: string
          issued_at?: string
          user_id: string
          validation_code?: string
        }
        Update: {
          certificate_url?: string | null
          course_id?: string
          created_at?: string
          id?: string
          issued_at?: string
          user_id?: string
          validation_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_performance_metrics"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "learning_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_analytics_data"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "learning_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses_with_stats"
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
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          lesson_id: string
          score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          lesson_id?: string
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
          {
            foreignKeyName: "learning_lesson_nps_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons_with_relations"
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
            foreignKeyName: "learning_lesson_tags_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons_with_relations"
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
            foreignKeyName: "learning_lesson_tools_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons_with_relations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_lesson_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "benefits"
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
          {
            foreignKeyName: "learning_lesson_videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons_with_relations"
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
            referencedRelation: "course_performance_metrics"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "learning_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_analytics_data"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "learning_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses_with_stats"
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
          {
            foreignKeyName: "learning_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons_with_relations"
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
          {
            foreignKeyName: "learning_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons_with_relations"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "member_connections_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "member_connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "moderation_actions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "moderation_actions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "moderation_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "network_matches_matched_user_id_fkey"
            columns: ["matched_user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "network_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
      notification_preferences: {
        Row: {
          admin_communications_email: boolean | null
          admin_communications_inapp: boolean | null
          created_at: string
          email_enabled: boolean
          id: string
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean
        }
        Insert: {
          admin_communications_email?: boolean | null
          admin_communications_inapp?: boolean | null
          created_at?: string
          email_enabled?: boolean
          id?: string
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean
        }
        Update: {
          admin_communications_email?: boolean | null
          admin_communications_inapp?: boolean | null
          created_at?: string
          email_enabled?: boolean
          id?: string
          updated_at?: string
          user_id?: string
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
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding: {
        Row: {
          ai_implementation_budget: string | null
          ai_implementation_objective: string | null
          ai_implementation_urgency: string | null
          ai_knowledge_level: string | null
          ai_main_challenge: string | null
          ai_tools_used: string[] | null
          annual_revenue: string | null
          area_to_impact: string | null
          best_days: string[] | null
          best_periods: string[] | null
          birth_date: string | null
          business_sector: string | null
          city: string | null
          community_interaction_style: string | null
          company_name: string | null
          company_size: string | null
          company_website: string | null
          completed_at: string | null
          completed_steps: number[] | null
          content_frequency: string | null
          content_preference: string[] | null
          country: string | null
          created_at: string | null
          curiosity: string | null
          current_step: number | null
          email: string | null
          expected_result_90_days: string | null
          follow_up_type: string | null
          has_implemented_ai: string | null
          id: string
          instagram: string | null
          is_completed: boolean | null
          linkedin: string | null
          main_objective: string | null
          main_obstacle: string | null
          motivation_sharing: string | null
          name: string | null
          phone: string | null
          position: string | null
          preferred_communication_channel: string | null
          preferred_support: string | null
          profile_picture: string | null
          state: string | null
          success_metric: string | null
          timezone: string | null
          updated_at: string | null
          urgency_level: string | null
          user_id: string
          wants_networking: string | null
          weekly_learning_time: string | null
          who_will_implement: string | null
        }
        Insert: {
          ai_implementation_budget?: string | null
          ai_implementation_objective?: string | null
          ai_implementation_urgency?: string | null
          ai_knowledge_level?: string | null
          ai_main_challenge?: string | null
          ai_tools_used?: string[] | null
          annual_revenue?: string | null
          area_to_impact?: string | null
          best_days?: string[] | null
          best_periods?: string[] | null
          birth_date?: string | null
          business_sector?: string | null
          city?: string | null
          community_interaction_style?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          completed_steps?: number[] | null
          content_frequency?: string | null
          content_preference?: string[] | null
          country?: string | null
          created_at?: string | null
          curiosity?: string | null
          current_step?: number | null
          email?: string | null
          expected_result_90_days?: string | null
          follow_up_type?: string | null
          has_implemented_ai?: string | null
          id?: string
          instagram?: string | null
          is_completed?: boolean | null
          linkedin?: string | null
          main_objective?: string | null
          main_obstacle?: string | null
          motivation_sharing?: string | null
          name?: string | null
          phone?: string | null
          position?: string | null
          preferred_communication_channel?: string | null
          preferred_support?: string | null
          profile_picture?: string | null
          state?: string | null
          success_metric?: string | null
          timezone?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          user_id: string
          wants_networking?: string | null
          weekly_learning_time?: string | null
          who_will_implement?: string | null
        }
        Update: {
          ai_implementation_budget?: string | null
          ai_implementation_objective?: string | null
          ai_implementation_urgency?: string | null
          ai_knowledge_level?: string | null
          ai_main_challenge?: string | null
          ai_tools_used?: string[] | null
          annual_revenue?: string | null
          area_to_impact?: string | null
          best_days?: string[] | null
          best_periods?: string[] | null
          birth_date?: string | null
          business_sector?: string | null
          city?: string | null
          community_interaction_style?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          completed_steps?: number[] | null
          content_frequency?: string | null
          content_preference?: string[] | null
          country?: string | null
          created_at?: string | null
          curiosity?: string | null
          current_step?: number | null
          email?: string | null
          expected_result_90_days?: string | null
          follow_up_type?: string | null
          has_implemented_ai?: string | null
          id?: string
          instagram?: string | null
          is_completed?: boolean | null
          linkedin?: string | null
          main_objective?: string | null
          main_obstacle?: string | null
          motivation_sharing?: string | null
          name?: string | null
          phone?: string | null
          position?: string | null
          preferred_communication_channel?: string | null
          preferred_support?: string | null
          profile_picture?: string | null
          state?: string | null
          success_metric?: string | null
          timezone?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          user_id?: string
          wants_networking?: string | null
          weekly_learning_time?: string | null
          who_will_implement?: string | null
        }
        Relationships: []
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
          ai_knowledge_level: string | null
          annual_revenue: string | null
          business_context: Json
          business_goals: Json | null
          business_info: Json
          company_name: string | null
          company_sector: string | null
          company_size: string | null
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
          personal_info: Json
          personalization: Json
          professional_info: Json | null
          status: string | null
          time_per_step: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abandonment_points?: Json | null
          ai_experience?: Json
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          business_context?: Json
          business_goals?: Json | null
          business_info?: Json
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
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
          personal_info?: Json
          personalization?: Json
          professional_info?: Json | null
          status?: string | null
          time_per_step?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abandonment_points?: Json | null
          ai_experience?: Json
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          business_context?: Json
          business_goals?: Json | null
          business_info?: Json
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
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
          personal_info?: Json
          personalization?: Json
          professional_info?: Json | null
          status?: string | null
          time_per_step?: Json | null
          updated_at?: string
          user_id?: string
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
      onboarding_users: {
        Row: {
          areas_interesse: string[] | null
          cidade: string
          como_conheceu: string | null
          created_at: string | null
          email: string
          estado: string
          experiencia_anterior: string | null
          id: string
          interesse_entrevista: boolean | null
          interesse_networking: boolean | null
          nivel_conhecimento: string | null
          nome_completo: string
          nome_empresa: string | null
          objetivos: string[] | null
          observacoes: string | null
          perfil_usuario: string
          permite_case: boolean | null
          preferencia_horario: string[] | null
          quem_indicou: string | null
          segmento_empresa: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          areas_interesse?: string[] | null
          cidade: string
          como_conheceu?: string | null
          created_at?: string | null
          email: string
          estado: string
          experiencia_anterior?: string | null
          id?: string
          interesse_entrevista?: boolean | null
          interesse_networking?: boolean | null
          nivel_conhecimento?: string | null
          nome_completo: string
          nome_empresa?: string | null
          objetivos?: string[] | null
          observacoes?: string | null
          perfil_usuario: string
          permite_case?: boolean | null
          preferencia_horario?: string[] | null
          quem_indicou?: string | null
          segmento_empresa?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          areas_interesse?: string[] | null
          cidade?: string
          como_conheceu?: string | null
          created_at?: string | null
          email?: string
          estado?: string
          experiencia_anterior?: string | null
          id?: string
          interesse_entrevista?: boolean | null
          interesse_networking?: boolean | null
          nivel_conhecimento?: string | null
          nome_completo?: string
          nome_empresa?: string | null
          objetivos?: string[] | null
          observacoes?: string | null
          perfil_usuario?: string
          permite_case?: boolean | null
          preferencia_horario?: string[] | null
          quem_indicou?: string | null
          segmento_empresa?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
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
      profiles: {
        Row: {
          available_for_networking: boolean | null
          avatar_url: string | null
          company_name: string | null
          created_at: string
          current_position: string | null
          email: string
          id: string
          industry: string | null
          last_active: string | null
          linkedin_url: string | null
          name: string | null
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          professional_bio: string | null
          referrals_count: number
          role: string
          role_id: string | null
          skills: string[] | null
          status: string | null
          successful_referrals_count: number
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          available_for_networking?: boolean | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          current_position?: string | null
          email: string
          id: string
          industry?: string | null
          last_active?: string | null
          linkedin_url?: string | null
          name?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          professional_bio?: string | null
          referrals_count?: number
          role?: string
          role_id?: string | null
          skills?: string[] | null
          status?: string | null
          successful_referrals_count?: number
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          available_for_networking?: boolean | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          current_position?: string | null
          email?: string
          id?: string
          industry?: string | null
          last_active?: string | null
          linkedin_url?: string | null
          name?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          professional_bio?: string | null
          referrals_count?: number
          role?: string
          role_id?: string | null
          skills?: string[] | null
          status?: string | null
          successful_referrals_count?: number
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referral_benefits_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          certificate_filename: string | null
          certificate_url: string | null
          created_at: string
          id: string
          implementation_date: string
          issued_at: string
          solution_id: string
          template_id: string | null
          updated_at: string
          user_id: string
          validation_code: string
        }
        Insert: {
          certificate_filename?: string | null
          certificate_url?: string | null
          created_at?: string
          id?: string
          implementation_date: string
          issued_at?: string
          solution_id: string
          template_id?: string | null
          updated_at?: string
          user_id: string
          validation_code?: string
        }
        Update: {
          certificate_filename?: string | null
          certificate_url?: string | null
          created_at?: string
          id?: string
          implementation_date?: string
          issued_at?: string
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
          {
            foreignKeyName: "suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions_with_profiles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_moderation_status_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_moderation_status_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_moderation_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding: {
        Row: {
          accepts_case_study: string | null
          ai_challenges: Json | null
          ai_experience: string | null
          ai_implementation_budget: string | null
          ai_knowledge_level: string | null
          ai_tools_used: Json | null
          annual_revenue: string | null
          area_to_impact: string | null
          best_days: string[] | null
          best_periods: string[] | null
          birth_date: string | null
          business_area: string | null
          business_sector: string | null
          business_stage: string | null
          city: string | null
          communication_style: string | null
          company_name: string | null
          company_size: string | null
          company_website: string | null
          completed_at: string | null
          content_preference: string | null
          content_types: Json | null
          created_at: string | null
          curiosity: string | null
          current_tools: Json | null
          daily_tools: string[] | null
          education_level: string | null
          email: string | null
          expected_result_90_days: string | null
          has_implemented_ai: string | null
          id: string
          instagram: string | null
          institution: string | null
          learning_preference: string | null
          linkedin: string | null
          main_challenges: Json | null
          main_objective: string | null
          member_type: string | null
          name: string | null
          nickname: string | null
          phone: string | null
          position: string | null
          primary_goals: Json | null
          started_at: string | null
          state: string | null
          study_area: string | null
          success_metrics: Json | null
          target_market: string | null
          team_size: string | null
          timeframe: string | null
          updated_at: string | null
          user_id: string
          wants_networking: string | null
          weekly_learning_time: string | null
          who_will_implement: string | null
        }
        Insert: {
          accepts_case_study?: string | null
          ai_challenges?: Json | null
          ai_experience?: string | null
          ai_implementation_budget?: string | null
          ai_knowledge_level?: string | null
          ai_tools_used?: Json | null
          annual_revenue?: string | null
          area_to_impact?: string | null
          best_days?: string[] | null
          best_periods?: string[] | null
          birth_date?: string | null
          business_area?: string | null
          business_sector?: string | null
          business_stage?: string | null
          city?: string | null
          communication_style?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          content_preference?: string | null
          content_types?: Json | null
          created_at?: string | null
          curiosity?: string | null
          current_tools?: Json | null
          daily_tools?: string[] | null
          education_level?: string | null
          email?: string | null
          expected_result_90_days?: string | null
          has_implemented_ai?: string | null
          id?: string
          instagram?: string | null
          institution?: string | null
          learning_preference?: string | null
          linkedin?: string | null
          main_challenges?: Json | null
          main_objective?: string | null
          member_type?: string | null
          name?: string | null
          nickname?: string | null
          phone?: string | null
          position?: string | null
          primary_goals?: Json | null
          started_at?: string | null
          state?: string | null
          study_area?: string | null
          success_metrics?: Json | null
          target_market?: string | null
          team_size?: string | null
          timeframe?: string | null
          updated_at?: string | null
          user_id: string
          wants_networking?: string | null
          weekly_learning_time?: string | null
          who_will_implement?: string | null
        }
        Update: {
          accepts_case_study?: string | null
          ai_challenges?: Json | null
          ai_experience?: string | null
          ai_implementation_budget?: string | null
          ai_knowledge_level?: string | null
          ai_tools_used?: Json | null
          annual_revenue?: string | null
          area_to_impact?: string | null
          best_days?: string[] | null
          best_periods?: string[] | null
          birth_date?: string | null
          business_area?: string | null
          business_sector?: string | null
          business_stage?: string | null
          city?: string | null
          communication_style?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          content_preference?: string | null
          content_types?: Json | null
          created_at?: string | null
          curiosity?: string | null
          current_tools?: Json | null
          daily_tools?: string[] | null
          education_level?: string | null
          email?: string | null
          expected_result_90_days?: string | null
          has_implemented_ai?: string | null
          id?: string
          instagram?: string | null
          institution?: string | null
          learning_preference?: string | null
          linkedin?: string | null
          main_challenges?: Json | null
          main_objective?: string | null
          member_type?: string | null
          name?: string | null
          nickname?: string | null
          phone?: string | null
          position?: string | null
          primary_goals?: Json | null
          started_at?: string | null
          state?: string | null
          study_area?: string | null
          success_metrics?: Json | null
          target_market?: string | null
          team_size?: string | null
          timeframe?: string | null
          updated_at?: string | null
          user_id?: string
          wants_networking?: string | null
          weekly_learning_time?: string | null
          who_will_implement?: string | null
        }
        Relationships: []
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
      admin_analytics_overview: {
        Row: {
          active_implementations: number | null
          active_learners_7d: number | null
          active_users_7d: number | null
          avg_implementation_time_days: number | null
          completed_implementations: number | null
          completed_lessons: number | null
          forum_topics: number | null
          new_implementations_30d: number | null
          new_users_30d: number | null
          overall_completion_rate: number | null
          total_benefit_clicks: number | null
          total_courses: number | null
          total_solutions: number | null
          total_users: number | null
        }
        Relationships: []
      }
      admin_stats_overview: {
        Row: {
          active_implementations: number | null
          active_learners_7d: number | null
          active_users_7d: number | null
          avg_implementation_time_days: number | null
          completed_implementations: number | null
          completed_lessons: number | null
          forum_topics: number | null
          new_implementations_30d: number | null
          new_users_30d: number | null
          overall_completion_rate: number | null
          total_benefit_clicks: number | null
          total_courses: number | null
          total_solutions: number | null
          total_users: number | null
        }
        Relationships: []
      }
      benefits: {
        Row: {
          benefit_badge_url: string | null
          benefit_clicks: number | null
          benefit_description: string | null
          benefit_link: string | null
          benefit_title: string | null
          benefit_type: string | null
          category: string | null
          created_at: string | null
          description: string | null
          has_member_benefit: boolean | null
          id: string | null
          logo_url: string | null
          name: string | null
          official_url: string | null
          status: boolean | null
          tags: string[] | null
          updated_at: string | null
          video_tutorials: Json | null
          video_type: string | null
          video_url: string | null
        }
        Relationships: []
      }
      course_performance_metrics: {
        Row: {
          avg_progress_percentage: number | null
          completed_lessons_count: number | null
          course_id: string | null
          course_title: string | null
          created_at: string | null
          enrolled_users: number | null
          total_lessons: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      forum_engagement_metrics: {
        Row: {
          date: string | null
          topics_ratio: number | null
          total_posts: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      implementation_growth_by_date: {
        Row: {
          cumulative_implementations: number | null
          daily_implementations: number | null
          date: string | null
        }
        Relationships: []
      }
      learning_analytics_data: {
        Row: {
          avg_progress_percentage: number | null
          completed_lessons: number | null
          course_id: string | null
          enrolled_users: number | null
          title: string | null
          total_lessons: number | null
        }
        Relationships: []
      }
      learning_courses_with_stats: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          is_restricted: boolean | null
          lesson_count: number | null
          module_count: number | null
          order_index: number | null
          published: boolean | null
          slug: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      learning_lessons_with_relations: {
        Row: {
          ai_assistant_enabled: boolean | null
          ai_assistant_id: string | null
          ai_assistant_prompt: string | null
          content: Json | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          estimated_time_minutes: number | null
          id: string | null
          module: Json | null
          module_id: string | null
          order_index: number | null
          published: boolean | null
          resources: Json | null
          title: string | null
          updated_at: string | null
          videos: Json | null
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
      networking_metrics: {
        Row: {
          date: string | null
          metric_name: string | null
          metric_value: number | null
        }
        Relationships: []
      }
      retention_cohort_analysis: {
        Row: {
          active_users: number | null
          activity_month: string | null
          cohort_month: string | null
          cohort_size: number | null
          retention_rate: number | null
        }
        Relationships: []
      }
      suggestions_with_profiles: {
        Row: {
          author_avatar: string | null
          author_company: string | null
          author_name: string | null
          category_id: string | null
          comment_count: number | null
          created_at: string | null
          description: string | null
          downvotes: number | null
          id: string | null
          image_url: string | null
          is_hidden: boolean | null
          is_pinned: boolean | null
          status: string | null
          title: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
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
            referencedRelation: "user_engagement_score"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      top_performing_content: {
        Row: {
          content_type: string | null
          created_at: string | null
          id: string | null
          score: number | null
          title: string | null
        }
        Relationships: []
      }
      user_engagement_metrics: {
        Row: {
          date: string | null
          formatted_date: string | null
          new_users: number | null
        }
        Relationships: []
      }
      user_engagement_score: {
        Row: {
          email: string | null
          engagement_score: number | null
          forum_posts: number | null
          lessons_completed: number | null
          name: string | null
          suggestions_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_growth_by_date: {
        Row: {
          cumulative_users: number | null
          date: string | null
          new_users: number | null
        }
        Relationships: []
      }
      user_role_distribution: {
        Row: {
          percentage: number | null
          role_name: string | null
          user_count: number | null
        }
        Relationships: []
      }
      users_with_roles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          name: string | null
          role: string | null
          role_description: string | null
          role_id: string | null
          role_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_activity_pattern: {
        Row: {
          activity_count: number | null
          day_name: string | null
          day_of_week: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invite: {
        Args: { p_token: string }
        Returns: Json
      }
      activate_invited_user: {
        Args: {
          p_user_id: string
          p_email: string
          p_name: string
          p_invite_token?: string
        }
        Returns: Json
      }
      admin_complete_user_cleanup: {
        Args: { user_email: string }
        Returns: Json
      }
      admin_force_delete_auth_user: {
        Args: { user_email: string }
        Returns: Json
      }
      admin_reset_user: {
        Args: { user_email: string }
        Returns: Json
      }
      audit_role_assignments: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      can_access_benefit: {
        Args: { user_id: string; tool_id: string }
        Returns: boolean
      }
      can_access_course: {
        Args: { user_id: string; course_id: string }
        Returns: boolean
      }
      can_assign_role: {
        Args: { admin_user_id: string; target_role_id: string }
        Returns: boolean
      }
      can_manage_role: {
        Args: { user_id: string; target_role_name: string }
        Returns: boolean
      }
      can_use_invite: {
        Args: { invite_token: string; user_email: string }
        Returns: Json
      }
      change_user_role: {
        Args: { target_user_id: string; new_role_id: string }
        Returns: Json
      }
      check_and_fix_onboarding_data: {
        Args: { user_id_param: string }
        Returns: Json
      }
      check_onboarding_integrity: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_rate_limit: {
        Args:
          | {
              action_type: string
              max_attempts?: number
              window_minutes?: number
            }
          | {
              p_identifier: string
              p_action_type: string
              p_max_attempts?: number
              p_window_minutes?: number
            }
        Returns: boolean
      }
      check_referral: {
        Args: { p_token: string }
        Returns: Json
      }
      check_rls_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          rls_enabled: boolean
          has_policies: boolean
          policy_count: number
          security_status: string
        }[]
      }
      check_role_system_integrity: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_solution_certificate_eligibility: {
        Args: { p_user_id: string; p_solution_id: string }
        Returns: boolean
      }
      check_system_health: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_whatsapp_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      clean_user_onboarding_data: {
        Args: { p_user_id: string }
        Returns: Json
      }
      cleanup_expired_invites_enhanced: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_sessions_enhanced: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_orphaned_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_orphaned_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_user_auth_state: {
        Args: { target_user_id?: string }
        Returns: boolean
      }
      clear_all_networking_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      complete_invite_registration: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json
      }
      complete_onboarding: {
        Args: { p_user_id: string }
        Returns: Json
      }
      complete_onboarding_and_unlock_features: {
        Args: { p_user_id: string; p_onboarding_data: Json }
        Returns: Json
      }
      complete_onboarding_secure: {
        Args: {
          p_user_id: string
          p_onboarding_data: Json
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: Json
      }
      create_invite: {
        Args: {
          p_email: string
          p_role_id: string
          p_expires_in?: unknown
          p_notes?: string
        }
        Returns: Json
      }
      create_invite_hybrid: {
        Args: {
          p_email: string
          p_role_id: string
          p_phone?: string
          p_expires_in?: unknown
          p_notes?: string
          p_channel_preference?: string
        }
        Returns: Json
      }
      create_learning_certificate_if_eligible: {
        Args: { p_user_id: string; p_course_id: string }
        Returns: string
      }
      create_onboarding_backup: {
        Args: { p_user_id: string; p_backup_type?: string }
        Returns: string
      }
      create_referral: {
        Args: {
          p_type: string
          p_referrer_id: string
          p_role_id?: string
          p_expires_in?: unknown
        }
        Returns: Json
      }
      create_solution_certificate_if_eligible: {
        Args: { p_user_id: string; p_solution_id: string }
        Returns: string
      }
      create_storage_public_policy: {
        Args: { bucket_name: string }
        Returns: Json
      }
      create_user_badge: {
        Args: { user_id: string; badge_id: string }
        Returns: string
      }
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      debug_tool_permissions: {
        Args: { user_id?: string }
        Returns: Json
      }
      decrement: {
        Args: { row_id: string; table_name: string; column_name: string }
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
      delete_user_complete: {
        Args: { target_user_id: string }
        Returns: Json
      }
      detect_at_risk_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_login_anomaly: {
        Args: { p_user_id: string; p_ip_address: string }
        Returns: boolean
      }
      diagnose_auth_state: {
        Args: { target_user_id?: string }
        Returns: Json
      }
      diagnose_stuck_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          current_step: number
          completed_steps: number[]
          hours_stuck: number
          suggested_action: string
        }[]
      }
      ensure_audit_log: {
        Args: {
          p_event_type: string
          p_action: string
          p_resource_id?: string
          p_details?: Json
          p_retry_count?: number
        }
        Returns: boolean
      }
      fix_existing_users_onboarding: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      fix_orphaned_invites: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      fix_stuck_onboarding_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      generate_certificate_validation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invite_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_networking_matches_for_user: {
        Args: { target_user_id: string }
        Returns: Json
      }
      generate_personalized_completion_message: {
        Args: { onboarding_data: Json }
        Returns: Json
      }
      generate_recurring_event_instances: {
        Args: { p_event_id: string; p_max_instances?: number }
        Returns: Json
      }
      generate_referral_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_retroactive_certificates: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      generate_security_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_courses_with_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          description: string
          cover_image_url: string
          slug: string
          published: boolean
          created_at: string
          updated_at: string
          created_by: string
          order_index: number
          module_count: number
          lesson_count: number
          is_restricted: boolean
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_lessons_with_relations: {
        Args: { p_course_id?: string }
        Returns: {
          id: string
          title: string
          description: string
          cover_image_url: string
          module_id: string
          content: Json
          order_index: number
          ai_assistant_enabled: boolean
          ai_assistant_prompt: string
          ai_assistant_id: string
          published: boolean
          difficulty_level: string
          created_at: string
          updated_at: string
          estimated_time_minutes: number
          module: Json
          videos: Json
          resources: Json
        }[]
      }
      get_onboarding_next_step: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_security_metrics: {
        Args: { p_user_id?: string; p_days?: number }
        Returns: Json
      }
      get_user_permissions: {
        Args: { user_id: string }
        Returns: Json
      }
      get_user_profile_safe: {
        Args: { target_user_id: string }
        Returns: {
          id: string
          email: string
          name: string
          company_name: string
          role_id: string
          onboarding_completed: boolean
          onboarding_completed_at: string
          created_at: string
          updated_at: string
          user_roles: Json
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role_safe: {
        Args: { user_id?: string }
        Returns: string
      }
      get_user_security_permissions: {
        Args: { user_id: string }
        Returns: string[]
      }
      get_users_with_roles: {
        Args: {
          limit_count?: number
          offset_count?: number
          search_query?: string
        }
        Returns: {
          id: string
          email: string
          name: string
          avatar_url: string
          role: string
          role_id: string
          user_roles: Json
          company_name: string
          industry: string
          created_at: string
        }[]
      }
      get_visible_events_for_user: {
        Args: { user_id: string }
        Returns: {
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
        }[]
      }
      has_role: {
        Args: { role_name: string }
        Returns: boolean
      }
      has_role_name: {
        Args: { role_name: string; check_user_id?: string }
        Returns: boolean
      }
      increment: {
        Args: { row_id: string; table_name: string; column_name: string }
        Returns: undefined
      }
      increment_benefit_clicks: {
        Args: { tool_id: string }
        Returns: undefined
      }
      increment_suggestion_downvote: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
      increment_suggestion_upvote: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
      initialize_onboarding_for_all_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      initialize_onboarding_for_user: {
        Args:
          | { p_user_id: string; p_invite_data?: Json }
          | { p_user_id: string; p_invite_token?: string }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_user_admin_enhanced: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_invite_delivery: {
        Args: {
          p_invite_id: string
          p_channel: string
          p_status: string
          p_provider_id?: string
          p_error_message?: string
          p_metadata?: Json
        }
        Returns: string
      }
      log_invite_validation_attempt: {
        Args: { p_token: string; p_success: boolean; p_details: string }
        Returns: undefined
      }
      log_onboarding_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_step: number
          p_event_data?: Json
        }
        Returns: undefined
      }
      log_permission_change: {
        Args: {
          user_id: string
          action_type: string
          target_user_id?: string
          role_id?: string
          role_name?: string
          permission_id?: string
          permission_code?: string
          old_value?: string
          new_value?: string
          ip_address?: string
        }
        Returns: string
      }
      log_rls_violation_attempt: {
        Args: { p_table_name: string; p_operation: string; p_user_id?: string }
        Returns: undefined
      }
      log_security_access: {
        Args: {
          p_table_name: string
          p_operation: string
          p_resource_id?: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args:
          | {
              p_action_type: string
              p_resource_type: string
              p_resource_id?: string
              p_old_values?: Json
              p_new_values?: Json
            }
          | {
              p_action_type: string
              p_resource_type: string
              p_resource_id?: string
              p_old_values?: string
              p_new_values?: string
            }
          | {
              p_event_type: string
              p_severity?: string
              p_user_id?: string
              p_event_data?: Json
              p_ip_address?: unknown
              p_user_agent?: string
            }
        Returns: string
      }
      log_security_violation: {
        Args:
          | {
              p_user_id?: string
              p_violation_type?: string
              p_severity?: string
              p_description?: string
              p_ip_address?: string
              p_user_agent?: string
              p_resource_accessed?: string
              p_additional_data?: Json
              p_auto_block?: boolean
            }
          | {
              violation_type: string
              resource_type: string
              resource_id?: string
              details?: Json
            }
        Returns: string
      }
      log_unauthorized_access: {
        Args: { attempted_action: string; resource_details?: Json }
        Returns: undefined
      }
      log_user_action: {
        Args: { user_id: string; action_type: string; details?: Json }
        Returns: undefined
      }
      manage_user_session: {
        Args: {
          p_user_id: string
          p_session_token: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
      merge_json_data: {
        Args: { target: Json; source: Json }
        Returns: Json
      }
      migrate_existing_onboarding_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      migrate_onboarding_data_to_quick: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      process_referral: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json
      }
      quick_check_permission: {
        Args: { user_id: string; permission_code: string }
        Returns: boolean
      }
      register_with_invite: {
        Args: { p_token: string; p_name: string; p_password: string }
        Returns: Json
      }
      reset_all_onboarding_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      reset_analytics_data_enhanced: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      reset_user_complete: {
        Args: { target_user_id: string }
        Returns: Json
      }
      search_users: {
        Args: {
          search_term?: string
          role_filter?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          email: string
          name: string
          avatar_url: string
          company_name: string
          industry: string
          role: string
          role_id: string
          created_at: string
        }[]
      }
      secure_assign_role: {
        Args: { target_user_id: string; new_role_id: string }
        Returns: Json
      }
      setup_learning_storage_buckets: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      simple_health_check: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      sync_profile_roles: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_invite_send_attempt: {
        Args: { invite_id: string }
        Returns: undefined
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
        Args: { p_user_id: string; p_feature: string }
        Returns: Json
      }
      user_has_permission: {
        Args: { user_id: string; permission_code: string }
        Returns: boolean
      }
      validate_admin_access: {
        Args: { user_id: string }
        Returns: Json
      }
      validate_complete_rls_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          rls_enabled: boolean
          policy_count: number
          security_status: string
          risk_level: string
        }[]
      }
      validate_input_security: {
        Args: { p_input: string; p_type?: string }
        Returns: boolean
      }
      validate_invite_token: {
        Args: { p_token: string }
        Returns: {
          id: string
          email: string
          role_id: string
          expires_at: string
          used_at: string
          created_at: string
          created_by: string
          notes: string
        }[]
      }
      validate_invite_token_enhanced: {
        Args: { p_token: string }
        Returns: {
          id: string
          email: string
          role_id: string
          token: string
          expires_at: string
          used_at: string
          created_at: string
        }[]
      }
      validate_invite_token_safe: {
        Args: { p_token: string }
        Returns: Json
      }
      validate_invite_token_secure: {
        Args: { p_token: string }
        Returns: {
          id: string
          email: string
          role_id: string
          expires_at: string
          is_valid: boolean
        }[]
      }
      validate_onboarding_state: {
        Args: { p_user_id?: string }
        Returns: Json
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
      validate_password_strength_server: {
        Args: { password: string }
        Returns: Json
      }
      validate_profile_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          user_role: string
          user_role_id: string
          expected_role_name: string
          expected_role_id: string
          issue_type: string
        }[]
      }
      validate_role_change: {
        Args:
          | { target_user_id: string; new_role_id: string }
          | {
              target_user_id: string
              new_role_id: string
              current_user_id?: string
            }
        Returns: boolean
      }
      validate_solution_certificate: {
        Args: { p_validation_code: string }
        Returns: Json
      }
      validate_user_invite_match: {
        Args: { p_token: string; p_user_id?: string }
        Returns: Json
      }
      validate_user_password: {
        Args: { password: string }
        Returns: Json
      }
      verify_permissions_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          issue_type: string
          description: string
          affected_resource: string
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
