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
        Relationships: [
          {
            foreignKeyName: "analytics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
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
      community_reports: {
        Row: {
          created_at: string
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
          updated_at: string
        }
        Insert: {
          created_at?: string
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
          updated_at?: string
        }
        Update: {
          created_at?: string
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
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
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
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_recommendations: {
        Row: {
          created_at: string
          id: string
          is_dismissed: boolean | null
          reason: string | null
          recommended_user_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          reason?: string | null
          recommended_user_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          reason?: string | null
          recommended_user_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_recommendations_recommended_user_id_fkey"
            columns: ["recommended_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_recommendations_recommended_user_id_fkey"
            columns: ["recommended_user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_recommendations_user_id_fkey"
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
            referencedRelation: "users_with_roles"
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
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          order_index: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_mentions: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          mentioned_by_user_id: string
          mentioned_user_id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          mentioned_by_user_id: string
          mentioned_user_id: string
          post_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          mentioned_by_user_id?: string
          mentioned_user_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_mentions_mentioned_by_user_id_fkey"
            columns: ["mentioned_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_mentions_mentioned_by_user_id_fkey"
            columns: ["mentioned_by_user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_mentions_mentioned_user_id_fkey"
            columns: ["mentioned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_mentions_mentioned_user_id_fkey"
            columns: ["mentioned_user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_mentions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          post_id: string | null
          topic_id: string | null
          triggered_by_user_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          post_id?: string | null
          topic_id?: string | null
          triggered_by_user_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          post_id?: string | null
          topic_id?: string | null
          triggered_by_user_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_notifications_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_notifications_triggered_by_user_id_fkey"
            columns: ["triggered_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_notifications_triggered_by_user_id_fkey"
            columns: ["triggered_by_user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          is_solution: boolean
          parent_id: string | null
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          is_solution?: boolean
          parent_id?: string | null
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          is_solution?: boolean
          parent_id?: string | null
          topic_id?: string
          updated_at?: string
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
        ]
      }
      forum_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: Database["public"]["Enums"]["forum_reaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: Database["public"]["Enums"]["forum_reaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: Database["public"]["Enums"]["forum_reaction_type"]
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
          category_id: string
          content: string
          created_at: string
          id: string
          is_locked: boolean
          is_pinned: boolean
          is_solved: boolean | null
          last_activity_at: string
          reply_count: number
          title: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          is_solved?: boolean | null
          last_activity_at?: string
          reply_count?: number
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          is_solved?: boolean | null
          last_activity_at?: string
          reply_count?: number
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_checkpoints: {
        Row: {
          checkpoint_order: number
          created_at: string | null
          description: string
          id: string
          solution_id: string | null
        }
        Insert: {
          checkpoint_order: number
          created_at?: string | null
          description: string
          id?: string
          solution_id?: string | null
        }
        Update: {
          checkpoint_order?: number
          created_at?: string | null
          description?: string
          id?: string
          solution_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "implementation_checkpoints_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_profiles: {
        Row: {
          ai_knowledge_level: number | null
          annual_revenue: string | null
          business_challenges: string[] | null
          city: string | null
          company_name: string | null
          company_sector: string | null
          company_size: string | null
          company_website: string | null
          country: string | null
          created_at: string | null
          current_position: string | null
          email: string | null
          id: string
          instagram: string | null
          is_completed: boolean | null
          linkedin: string | null
          name: string | null
          networking_interests: string[] | null
          nps_score: number | null
          phone: string | null
          phone_country_code: string | null
          primary_goal: string | null
          state: string | null
          updated_at: string | null
          user_id: string | null
          weekly_availability: string | null
        }
        Insert: {
          ai_knowledge_level?: number | null
          annual_revenue?: string | null
          business_challenges?: string[] | null
          city?: string | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          country?: string | null
          created_at?: string | null
          current_position?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_completed?: boolean | null
          linkedin?: string | null
          name?: string | null
          networking_interests?: string[] | null
          nps_score?: number | null
          phone?: string | null
          phone_country_code?: string | null
          primary_goal?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_availability?: string | null
        }
        Update: {
          ai_knowledge_level?: number | null
          annual_revenue?: string | null
          business_challenges?: string[] | null
          city?: string | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          country?: string | null
          created_at?: string | null
          current_position?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_completed?: boolean | null
          linkedin?: string | null
          name?: string | null
          networking_interests?: string[] | null
          nps_score?: number | null
          phone?: string | null
          phone_country_code?: string | null
          primary_goal?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_availability?: string | null
        }
        Relationships: []
      }
      implementation_trails: {
        Row: {
          created_at: string
          error_message: string | null
          generation_attempts: number
          id: string
          status: string
          trail_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          generation_attempts?: number
          id?: string
          status?: string
          trail_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          generation_attempts?: number
          id?: string
          status?: string
          trail_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      implementation_trails_backup_complete_2025: {
        Row: {
          backup_timestamp: string | null
          created_at: string | null
          error_message: string | null
          generation_attempts: number | null
          id: string | null
          status: string | null
          trail_data: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          backup_timestamp?: string | null
          created_at?: string | null
          error_message?: string | null
          generation_attempts?: number | null
          id?: string | null
          status?: string | null
          trail_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          backup_timestamp?: string | null
          created_at?: string | null
          error_message?: string | null
          generation_attempts?: number | null
          id?: string | null
          status?: string | null
          trail_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          channel_preference: string | null
          created_at: string
          created_by: string
          email: string
          email_id: string | null
          email_provider: string | null
          expires_at: string
          id: string
          last_sent_at: string | null
          notes: string | null
          phone: string | null
          role_id: string
          send_attempts: number | null
          token: string
          used_at: string | null
        }
        Insert: {
          channel_preference?: string | null
          created_at?: string
          created_by: string
          email: string
          email_id?: string | null
          email_provider?: string | null
          expires_at: string
          id?: string
          last_sent_at?: string | null
          notes?: string | null
          phone?: string | null
          role_id: string
          send_attempts?: number | null
          token: string
          used_at?: string | null
        }
        Update: {
          channel_preference?: string | null
          created_at?: string
          created_by?: string
          email?: string
          email_id?: string | null
          email_provider?: string | null
          expires_at?: string
          id?: string
          last_sent_at?: string | null
          notes?: string | null
          phone?: string | null
          role_id?: string
          send_attempts?: number | null
          token?: string
          used_at?: string | null
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
        }
        Insert: {
          certificate_url?: string | null
          course_id: string
          created_at?: string
          id?: string
          issued_at?: string
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          course_id?: string
          created_at?: string
          id?: string
          issued_at?: string
          user_id?: string
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
          lesson_id: string
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
          lesson_id: string
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
          lesson_id?: string
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
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
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
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
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
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          certificate_template: Json | null
          content: Json
          created_at: string
          estimated_time_minutes: number | null
          id: string
          metrics: Json | null
          module_order: number
          solution_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          certificate_template?: Json | null
          content: Json
          created_at?: string
          estimated_time_minutes?: number | null
          id?: string
          metrics?: Json | null
          module_order: number
          solution_id: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          certificate_template?: Json | null
          content?: Json
          created_at?: string
          estimated_time_minutes?: number | null
          id?: string
          metrics?: Json | null
          module_order?: number
          solution_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
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
          compatibility_score: number
          created_at: string
          id: string
          is_viewed: boolean
          match_reason: string | null
          match_strengths: Json | null
          match_type: string
          matched_user_id: string
          month_year: string
          status: string
          suggested_topics: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          compatibility_score: number
          created_at?: string
          id?: string
          is_viewed?: boolean
          match_reason?: string | null
          match_strengths?: Json | null
          match_type?: string
          matched_user_id: string
          month_year?: string
          status?: string
          suggested_topics?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          compatibility_score?: number
          created_at?: string
          id?: string
          is_viewed?: boolean
          match_reason?: string | null
          match_strengths?: Json | null
          match_type?: string
          matched_user_id?: string
          month_year?: string
          status?: string
          suggested_topics?: Json | null
          updated_at?: string
          user_id?: string
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
      onboarding_backup_complete_2025: {
        Row: {
          ai_knowledge_level: string | null
          annual_revenue_range: string | null
          backup_timestamp: string | null
          birth_date: string | null
          company_name: string | null
          company_segment: string | null
          company_size: string | null
          company_website: string | null
          completed_at: string | null
          country_code: string | null
          created_at: string | null
          current_step: number | null
          email: string | null
          how_found_us: string | null
          id: string | null
          instagram_url: string | null
          is_completed: boolean | null
          linkedin_url: string | null
          main_challenge: string | null
          main_goal: string | null
          name: string | null
          referred_by: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
          uses_ai: string | null
          whatsapp: string | null
        }
        Insert: {
          ai_knowledge_level?: string | null
          annual_revenue_range?: string | null
          backup_timestamp?: string | null
          birth_date?: string | null
          company_name?: string | null
          company_segment?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          email?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          referred_by?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
          uses_ai?: string | null
          whatsapp?: string | null
        }
        Update: {
          ai_knowledge_level?: string | null
          annual_revenue_range?: string | null
          backup_timestamp?: string | null
          birth_date?: string | null
          company_name?: string | null
          company_segment?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          email?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          referred_by?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
          uses_ai?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      onboarding_backup_legacy_2025_06_07_01_34_11: {
        Row: {
          additional_context: string | null
          annual_revenue: string | null
          authorize_case_usage: boolean | null
          available_days: string[] | null
          business_challenges: string[] | null
          business_model: string | null
          city: string | null
          company_name: string | null
          company_sector: string | null
          company_size: string | null
          company_website: string | null
          completed_formation: boolean | null
          completed_steps: string[] | null
          content_formats: string[] | null
          country: string | null
          created_at: string | null
          current_position: string | null
          current_step: string | null
          ddi: string | null
          desired_ai_areas: string[] | null
          email: string | null
          expected_outcome_30days: string | null
          expected_outcomes: string[] | null
          has_implemented: string | null
          how_found_us: string | null
          how_implement: string | null
          id: string | null
          important_kpis: string[] | null
          improvement_suggestions: string | null
          instagram: string | null
          interested_in_interview: boolean | null
          interests: string[] | null
          is_completed: boolean | null
          is_member_for_month: boolean | null
          knowledge_level: string | null
          linkedin: string | null
          live_interest: number | null
          medium_term_goals: string[] | null
          mentorship_topics: string[] | null
          name: string | null
          networking_availability: number | null
          nps_score: number | null
          phone: string | null
          previous_tools: string[] | null
          primary_goal: string | null
          priority_solution_type: string | null
          priority_topics: string[] | null
          referred_by: string | null
          short_term_goals: string[] | null
          skills_to_share: string[] | null
          state: string | null
          time_preference: string[] | null
          timeline: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          week_availability: string | null
        }
        Insert: {
          additional_context?: string | null
          annual_revenue?: string | null
          authorize_case_usage?: boolean | null
          available_days?: string[] | null
          business_challenges?: string[] | null
          business_model?: string | null
          city?: string | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_formation?: boolean | null
          completed_steps?: string[] | null
          content_formats?: string[] | null
          country?: string | null
          created_at?: string | null
          current_position?: string | null
          current_step?: string | null
          ddi?: string | null
          desired_ai_areas?: string[] | null
          email?: string | null
          expected_outcome_30days?: string | null
          expected_outcomes?: string[] | null
          has_implemented?: string | null
          how_found_us?: string | null
          how_implement?: string | null
          id?: string | null
          important_kpis?: string[] | null
          improvement_suggestions?: string | null
          instagram?: string | null
          interested_in_interview?: boolean | null
          interests?: string[] | null
          is_completed?: boolean | null
          is_member_for_month?: boolean | null
          knowledge_level?: string | null
          linkedin?: string | null
          live_interest?: number | null
          medium_term_goals?: string[] | null
          mentorship_topics?: string[] | null
          name?: string | null
          networking_availability?: number | null
          nps_score?: number | null
          phone?: string | null
          previous_tools?: string[] | null
          primary_goal?: string | null
          priority_solution_type?: string | null
          priority_topics?: string[] | null
          referred_by?: string | null
          short_term_goals?: string[] | null
          skills_to_share?: string[] | null
          state?: string | null
          time_preference?: string[] | null
          timeline?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          week_availability?: string | null
        }
        Update: {
          additional_context?: string | null
          annual_revenue?: string | null
          authorize_case_usage?: boolean | null
          available_days?: string[] | null
          business_challenges?: string[] | null
          business_model?: string | null
          city?: string | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_formation?: boolean | null
          completed_steps?: string[] | null
          content_formats?: string[] | null
          country?: string | null
          created_at?: string | null
          current_position?: string | null
          current_step?: string | null
          ddi?: string | null
          desired_ai_areas?: string[] | null
          email?: string | null
          expected_outcome_30days?: string | null
          expected_outcomes?: string[] | null
          has_implemented?: string | null
          how_found_us?: string | null
          how_implement?: string | null
          id?: string | null
          important_kpis?: string[] | null
          improvement_suggestions?: string | null
          instagram?: string | null
          interested_in_interview?: boolean | null
          interests?: string[] | null
          is_completed?: boolean | null
          is_member_for_month?: boolean | null
          knowledge_level?: string | null
          linkedin?: string | null
          live_interest?: number | null
          medium_term_goals?: string[] | null
          mentorship_topics?: string[] | null
          name?: string | null
          networking_availability?: number | null
          nps_score?: number | null
          phone?: string | null
          previous_tools?: string[] | null
          primary_goal?: string | null
          priority_solution_type?: string | null
          priority_topics?: string[] | null
          referred_by?: string | null
          short_term_goals?: string[] | null
          skills_to_share?: string[] | null
          state?: string | null
          time_preference?: string[] | null
          timeline?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          week_availability?: string | null
        }
        Relationships: []
      }
      onboarding_backup_progress_2025_06_07_01_34_11: {
        Row: {
          ai_experience: Json | null
          ai_knowledge_level: string | null
          annual_revenue: string | null
          budget_range: string | null
          business_context: Json | null
          business_data: Json | null
          business_goals: Json | null
          company_data: Json | null
          company_name: string | null
          company_sector: string | null
          company_size: string | null
          company_website: string | null
          complementary_info: Json | null
          completed_steps: string[] | null
          created_at: string | null
          current_position: string | null
          current_step: string | null
          debug_logs: Json | null
          decision_makers: string[] | null
          experience_personalization: Json | null
          formation_data: Json | null
          goals: string[] | null
          id: string | null
          implementation_preferences: Json | null
          implementation_speed: string | null
          industry_focus: Json | null
          is_completed: boolean | null
          last_error: string | null
          last_sync_at: string | null
          metadata: Json | null
          onboarding_type: string | null
          personal_info: Json | null
          priority_areas: string[] | null
          professional_data: Json | null
          professional_info: Json | null
          resources_needs: Json | null
          support_level: string | null
          sync_status: string | null
          target_market: string | null
          team_info: Json | null
          team_size: string | null
          tech_stack: string[] | null
          technical_expertise: string | null
          trail_generated_at: string | null
          trail_solutions: Json | null
          training_needs: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          budget_range?: string | null
          business_context?: Json | null
          business_data?: Json | null
          business_goals?: Json | null
          company_data?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          complementary_info?: Json | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_position?: string | null
          current_step?: string | null
          debug_logs?: Json | null
          decision_makers?: string[] | null
          experience_personalization?: Json | null
          formation_data?: Json | null
          goals?: string[] | null
          id?: string | null
          implementation_preferences?: Json | null
          implementation_speed?: string | null
          industry_focus?: Json | null
          is_completed?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          onboarding_type?: string | null
          personal_info?: Json | null
          priority_areas?: string[] | null
          professional_data?: Json | null
          professional_info?: Json | null
          resources_needs?: Json | null
          support_level?: string | null
          sync_status?: string | null
          target_market?: string | null
          team_info?: Json | null
          team_size?: string | null
          tech_stack?: string[] | null
          technical_expertise?: string | null
          trail_generated_at?: string | null
          trail_solutions?: Json | null
          training_needs?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          budget_range?: string | null
          business_context?: Json | null
          business_data?: Json | null
          business_goals?: Json | null
          company_data?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          complementary_info?: Json | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_position?: string | null
          current_step?: string | null
          debug_logs?: Json | null
          decision_makers?: string[] | null
          experience_personalization?: Json | null
          formation_data?: Json | null
          goals?: string[] | null
          id?: string | null
          implementation_preferences?: Json | null
          implementation_speed?: string | null
          industry_focus?: Json | null
          is_completed?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          onboarding_type?: string | null
          personal_info?: Json | null
          priority_areas?: string[] | null
          professional_data?: Json | null
          professional_info?: Json | null
          resources_needs?: Json | null
          support_level?: string | null
          sync_status?: string | null
          target_market?: string | null
          team_info?: Json | null
          team_size?: string | null
          tech_stack?: string[] | null
          technical_expertise?: string | null
          trail_generated_at?: string | null
          trail_solutions?: Json | null
          training_needs?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_backup_quick_2025_06_07_01_34_11: {
        Row: {
          additional_context: string | null
          ai_knowledge_level: string | null
          annual_revenue_range: string | null
          birth_date: string | null
          business_challenges: Json | null
          business_model: string | null
          city: string | null
          company_name: string | null
          company_segment: string | null
          company_size: string | null
          company_website: string | null
          completed_at: string | null
          country: string | null
          country_code: string | null
          created_at: string | null
          current_step: number | null
          desired_ai_areas: Json | null
          email: string | null
          expected_outcome_30days: string | null
          has_implemented: string | null
          how_found_us: string | null
          id: string | null
          instagram_url: string | null
          interests: Json | null
          is_completed: boolean | null
          linkedin_url: string | null
          main_challenge: string | null
          main_goal: string | null
          name: string | null
          networking_availability: number | null
          previous_tools: Json | null
          primary_goal: string | null
          referred_by: string | null
          role: string | null
          skills_to_share: Json | null
          state: string | null
          time_preference: Json | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          uses_ai: string | null
          week_availability: string | null
          whatsapp: string | null
        }
        Insert: {
          additional_context?: string | null
          ai_knowledge_level?: string | null
          annual_revenue_range?: string | null
          birth_date?: string | null
          business_challenges?: Json | null
          business_model?: string | null
          city?: string | null
          company_name?: string | null
          company_segment?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          desired_ai_areas?: Json | null
          email?: string | null
          expected_outcome_30days?: string | null
          has_implemented?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          interests?: Json | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          networking_availability?: number | null
          previous_tools?: Json | null
          primary_goal?: string | null
          referred_by?: string | null
          role?: string | null
          skills_to_share?: Json | null
          state?: string | null
          time_preference?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          uses_ai?: string | null
          week_availability?: string | null
          whatsapp?: string | null
        }
        Update: {
          additional_context?: string | null
          ai_knowledge_level?: string | null
          annual_revenue_range?: string | null
          birth_date?: string | null
          business_challenges?: Json | null
          business_model?: string | null
          city?: string | null
          company_name?: string | null
          company_segment?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          desired_ai_areas?: Json | null
          email?: string | null
          expected_outcome_30days?: string | null
          has_implemented?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          interests?: Json | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          networking_availability?: number | null
          previous_tools?: Json | null
          primary_goal?: string | null
          referred_by?: string | null
          role?: string | null
          skills_to_share?: Json | null
          state?: string | null
          time_preference?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          uses_ai?: string | null
          week_availability?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      onboarding_backup_trails_2025_06_07_01_34_11: {
        Row: {
          created_at: string | null
          error_message: string | null
          generation_attempts: number | null
          id: string | null
          status: string | null
          trail_data: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          generation_attempts?: number | null
          id?: string | null
          status?: string | null
          trail_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          generation_attempts?: number | null
          id?: string | null
          status?: string | null
          trail_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_backups: {
        Row: {
          backup_type: string
          created_at: string
          id: string
          onboarding_data: Json
          profiles_data: Json | null
          user_id: string
        }
        Insert: {
          backup_type?: string
          created_at?: string
          id?: string
          onboarding_data: Json
          profiles_data?: Json | null
          user_id: string
        }
        Update: {
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
          created_at: string
          current_step: number
          discovery_info: Json
          experience_personalization: Json | null
          goals_info: Json
          id: string
          is_completed: boolean
          location_info: Json
          main_goal: string | null
          message_generated: boolean | null
          personal_info: Json
          personalization: Json
          professional_info: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
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
          created_at?: string
          current_step?: number
          discovery_info?: Json
          experience_personalization?: Json | null
          goals_info?: Json
          id?: string
          is_completed?: boolean
          location_info?: Json
          main_goal?: string | null
          message_generated?: boolean | null
          personal_info?: Json
          personalization?: Json
          professional_info?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
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
          created_at?: string
          current_step?: number
          discovery_info?: Json
          experience_personalization?: Json | null
          goals_info?: Json
          id?: string
          is_completed?: boolean
          location_info?: Json
          main_goal?: string | null
          message_generated?: boolean | null
          personal_info?: Json
          personalization?: Json
          professional_info?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_final_backup_2025_06_01_13_56_48: {
        Row: {
          ai_experience: Json | null
          ai_knowledge_level: string | null
          annual_revenue: string | null
          business_context: Json | null
          business_goals: Json | null
          business_info: Json | null
          company_name: string | null
          company_sector: string | null
          company_size: string | null
          complementary_info: Json | null
          completed_at: string | null
          completed_steps: number[] | null
          completion_message: string | null
          created_at: string | null
          current_step: number | null
          discovery_info: Json | null
          experience_personalization: Json | null
          goals_info: Json | null
          id: string | null
          is_completed: boolean | null
          location_info: Json | null
          main_goal: string | null
          message_generated: boolean | null
          personal_info: Json | null
          personalization: Json | null
          professional_info: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          business_context?: Json | null
          business_goals?: Json | null
          business_info?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          complementary_info?: Json | null
          completed_at?: string | null
          completed_steps?: number[] | null
          completion_message?: string | null
          created_at?: string | null
          current_step?: number | null
          discovery_info?: Json | null
          experience_personalization?: Json | null
          goals_info?: Json | null
          id?: string | null
          is_completed?: boolean | null
          location_info?: Json | null
          main_goal?: string | null
          message_generated?: boolean | null
          personal_info?: Json | null
          personalization?: Json | null
          professional_info?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          business_context?: Json | null
          business_goals?: Json | null
          business_info?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          complementary_info?: Json | null
          completed_at?: string | null
          completed_steps?: number[] | null
          completion_message?: string | null
          created_at?: string | null
          current_step?: number | null
          discovery_info?: Json | null
          experience_personalization?: Json | null
          goals_info?: Json | null
          id?: string | null
          is_completed?: boolean | null
          location_info?: Json | null
          main_goal?: string | null
          message_generated?: boolean | null
          personal_info?: Json | null
          personalization?: Json | null
          professional_info?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_final_backup_complete_2025: {
        Row: {
          ai_experience: Json | null
          ai_knowledge_level: string | null
          annual_revenue: string | null
          backup_timestamp: string | null
          business_context: Json | null
          business_goals: Json | null
          business_info: Json | null
          company_name: string | null
          company_sector: string | null
          company_size: string | null
          complementary_info: Json | null
          completed_at: string | null
          completed_steps: number[] | null
          completion_message: string | null
          created_at: string | null
          current_step: number | null
          discovery_info: Json | null
          experience_personalization: Json | null
          goals_info: Json | null
          id: string | null
          is_completed: boolean | null
          location_info: Json | null
          main_goal: string | null
          message_generated: boolean | null
          personal_info: Json | null
          personalization: Json | null
          professional_info: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          backup_timestamp?: string | null
          business_context?: Json | null
          business_goals?: Json | null
          business_info?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          complementary_info?: Json | null
          completed_at?: string | null
          completed_steps?: number[] | null
          completion_message?: string | null
          created_at?: string | null
          current_step?: number | null
          discovery_info?: Json | null
          experience_personalization?: Json | null
          goals_info?: Json | null
          id?: string | null
          is_completed?: boolean | null
          location_info?: Json | null
          main_goal?: string | null
          message_generated?: boolean | null
          personal_info?: Json | null
          personalization?: Json | null
          professional_info?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          backup_timestamp?: string | null
          business_context?: Json | null
          business_goals?: Json | null
          business_info?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          complementary_info?: Json | null
          completed_at?: string | null
          completed_steps?: number[] | null
          completion_message?: string | null
          created_at?: string | null
          current_step?: number | null
          discovery_info?: Json | null
          experience_personalization?: Json | null
          goals_info?: Json | null
          id?: string | null
          is_completed?: boolean | null
          location_info?: Json | null
          main_goal?: string | null
          message_generated?: boolean | null
          personal_info?: Json | null
          personalization?: Json | null
          professional_info?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_final_backup_complete_2025_06_01_14_03_14: {
        Row: {
          ai_experience: Json | null
          ai_knowledge_level: string | null
          annual_revenue: string | null
          business_context: Json | null
          business_goals: Json | null
          business_info: Json | null
          company_name: string | null
          company_sector: string | null
          company_size: string | null
          complementary_info: Json | null
          completed_at: string | null
          completed_steps: number[] | null
          completion_message: string | null
          created_at: string | null
          current_step: number | null
          discovery_info: Json | null
          experience_personalization: Json | null
          goals_info: Json | null
          id: string | null
          is_completed: boolean | null
          location_info: Json | null
          main_goal: string | null
          message_generated: boolean | null
          personal_info: Json | null
          personalization: Json | null
          professional_info: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          business_context?: Json | null
          business_goals?: Json | null
          business_info?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          complementary_info?: Json | null
          completed_at?: string | null
          completed_steps?: number[] | null
          completion_message?: string | null
          created_at?: string | null
          current_step?: number | null
          discovery_info?: Json | null
          experience_personalization?: Json | null
          goals_info?: Json | null
          id?: string | null
          is_completed?: boolean | null
          location_info?: Json | null
          main_goal?: string | null
          message_generated?: boolean | null
          personal_info?: Json | null
          personalization?: Json | null
          professional_info?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          business_context?: Json | null
          business_goals?: Json | null
          business_info?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          complementary_info?: Json | null
          completed_at?: string | null
          completed_steps?: number[] | null
          completion_message?: string | null
          created_at?: string | null
          current_step?: number | null
          discovery_info?: Json | null
          experience_personalization?: Json | null
          goals_info?: Json | null
          id?: string | null
          is_completed?: boolean | null
          location_info?: Json | null
          main_goal?: string | null
          message_generated?: boolean | null
          personal_info?: Json | null
          personalization?: Json | null
          professional_info?: Json | null
          updated_at?: string | null
          user_id?: string | null
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
      onboarding_progress_backup_complete_2025: {
        Row: {
          ai_experience: Json | null
          ai_knowledge_level: string | null
          annual_revenue: string | null
          backup_timestamp: string | null
          budget_range: string | null
          business_context: Json | null
          business_data: Json | null
          business_goals: Json | null
          company_data: Json | null
          company_name: string | null
          company_sector: string | null
          company_size: string | null
          company_website: string | null
          complementary_info: Json | null
          completed_steps: string[] | null
          created_at: string | null
          current_position: string | null
          current_step: string | null
          debug_logs: Json | null
          decision_makers: string[] | null
          experience_personalization: Json | null
          formation_data: Json | null
          goals: string[] | null
          id: string | null
          implementation_preferences: Json | null
          implementation_speed: string | null
          industry_focus: Json | null
          is_completed: boolean | null
          last_error: string | null
          last_sync_at: string | null
          metadata: Json | null
          onboarding_type: string | null
          personal_info: Json | null
          priority_areas: string[] | null
          professional_data: Json | null
          professional_info: Json | null
          resources_needs: Json | null
          support_level: string | null
          sync_status: string | null
          target_market: string | null
          team_info: Json | null
          team_size: string | null
          tech_stack: string[] | null
          technical_expertise: string | null
          trail_generated_at: string | null
          trail_solutions: Json | null
          training_needs: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          backup_timestamp?: string | null
          budget_range?: string | null
          business_context?: Json | null
          business_data?: Json | null
          business_goals?: Json | null
          company_data?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          complementary_info?: Json | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_position?: string | null
          current_step?: string | null
          debug_logs?: Json | null
          decision_makers?: string[] | null
          experience_personalization?: Json | null
          formation_data?: Json | null
          goals?: string[] | null
          id?: string | null
          implementation_preferences?: Json | null
          implementation_speed?: string | null
          industry_focus?: Json | null
          is_completed?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          onboarding_type?: string | null
          personal_info?: Json | null
          priority_areas?: string[] | null
          professional_data?: Json | null
          professional_info?: Json | null
          resources_needs?: Json | null
          support_level?: string | null
          sync_status?: string | null
          target_market?: string | null
          team_info?: Json | null
          team_size?: string | null
          tech_stack?: string[] | null
          technical_expertise?: string | null
          trail_generated_at?: string | null
          trail_solutions?: Json | null
          training_needs?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_experience?: Json | null
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          backup_timestamp?: string | null
          budget_range?: string | null
          business_context?: Json | null
          business_data?: Json | null
          business_goals?: Json | null
          company_data?: Json | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          complementary_info?: Json | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_position?: string | null
          current_step?: string | null
          debug_logs?: Json | null
          decision_makers?: string[] | null
          experience_personalization?: Json | null
          formation_data?: Json | null
          goals?: string[] | null
          id?: string | null
          implementation_preferences?: Json | null
          implementation_speed?: string | null
          industry_focus?: Json | null
          is_completed?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          onboarding_type?: string | null
          personal_info?: Json | null
          priority_areas?: string[] | null
          professional_data?: Json | null
          professional_info?: Json | null
          resources_needs?: Json | null
          support_level?: string | null
          sync_status?: string | null
          target_market?: string | null
          team_info?: Json | null
          team_size?: string | null
          tech_stack?: string[] | null
          technical_expertise?: string | null
          trail_generated_at?: string | null
          trail_solutions?: Json | null
          training_needs?: string[] | null
          updated_at?: string | null
          user_id?: string | null
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
          successful_referrals_count: number
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
          successful_referrals_count?: number
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
          successful_referrals_count?: number
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
          created_at: string
          current_module: number
          id: string
          implementation_status: string | null
          is_completed: boolean
          last_activity: string
          solution_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_modules?: number[] | null
          completion_data?: Json | null
          created_at?: string
          current_module?: number
          id?: string
          implementation_status?: string | null
          is_completed?: boolean
          last_activity?: string
          solution_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_modules?: number[] | null
          completion_data?: Json | null
          created_at?: string
          current_module?: number
          id?: string
          implementation_status?: string | null
          is_completed?: boolean
          last_activity?: string
          solution_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_onboarding_backup_2024: {
        Row: {
          ai_knowledge_level: string | null
          annual_revenue_range: string | null
          birth_date: string | null
          company_name: string | null
          company_segment: string | null
          company_size: string | null
          company_website: string | null
          completed_at: string | null
          country_code: string | null
          created_at: string | null
          current_step: number | null
          email: string | null
          how_found_us: string | null
          id: string | null
          instagram_url: string | null
          is_completed: boolean | null
          linkedin_url: string | null
          main_challenge: string | null
          main_goal: string | null
          name: string | null
          referred_by: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
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
          completed_at?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          email?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          referred_by?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          completed_at?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          email?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          referred_by?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
          uses_ai?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      quick_onboarding_backup_2025_06_01_13_56_48: {
        Row: {
          additional_context: string | null
          ai_knowledge_level: string | null
          annual_revenue_range: string | null
          birth_date: string | null
          business_challenges: Json | null
          business_model: string | null
          city: string | null
          company_name: string | null
          company_segment: string | null
          company_size: string | null
          company_website: string | null
          completed_at: string | null
          country: string | null
          country_code: string | null
          created_at: string | null
          current_step: number | null
          desired_ai_areas: Json | null
          email: string | null
          expected_outcome_30days: string | null
          has_implemented: string | null
          how_found_us: string | null
          id: string | null
          instagram_url: string | null
          interests: Json | null
          is_completed: boolean | null
          linkedin_url: string | null
          main_challenge: string | null
          main_goal: string | null
          name: string | null
          networking_availability: number | null
          previous_tools: Json | null
          primary_goal: string | null
          referred_by: string | null
          role: string | null
          skills_to_share: Json | null
          state: string | null
          time_preference: Json | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          uses_ai: string | null
          week_availability: string | null
          whatsapp: string | null
        }
        Insert: {
          additional_context?: string | null
          ai_knowledge_level?: string | null
          annual_revenue_range?: string | null
          birth_date?: string | null
          business_challenges?: Json | null
          business_model?: string | null
          city?: string | null
          company_name?: string | null
          company_segment?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          desired_ai_areas?: Json | null
          email?: string | null
          expected_outcome_30days?: string | null
          has_implemented?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          interests?: Json | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          networking_availability?: number | null
          previous_tools?: Json | null
          primary_goal?: string | null
          referred_by?: string | null
          role?: string | null
          skills_to_share?: Json | null
          state?: string | null
          time_preference?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          uses_ai?: string | null
          week_availability?: string | null
          whatsapp?: string | null
        }
        Update: {
          additional_context?: string | null
          ai_knowledge_level?: string | null
          annual_revenue_range?: string | null
          birth_date?: string | null
          business_challenges?: Json | null
          business_model?: string | null
          city?: string | null
          company_name?: string | null
          company_segment?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          desired_ai_areas?: Json | null
          email?: string | null
          expected_outcome_30days?: string | null
          has_implemented?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          interests?: Json | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          networking_availability?: number | null
          previous_tools?: Json | null
          primary_goal?: string | null
          referred_by?: string | null
          role?: string | null
          skills_to_share?: Json | null
          state?: string | null
          time_preference?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          uses_ai?: string | null
          week_availability?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      quick_onboarding_backup_20250130: {
        Row: {
          ai_knowledge_level: string | null
          annual_revenue_range: string | null
          birth_date: string | null
          company_name: string | null
          company_segment: string | null
          company_size: string | null
          company_website: string | null
          completed_at: string | null
          country_code: string | null
          created_at: string | null
          current_step: number | null
          email: string | null
          how_found_us: string | null
          id: string | null
          instagram_url: string | null
          is_completed: boolean | null
          linkedin_url: string | null
          main_challenge: string | null
          main_goal: string | null
          name: string | null
          referred_by: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
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
          completed_at?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          email?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          referred_by?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          completed_at?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          email?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          referred_by?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
          uses_ai?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      quick_onboarding_backup_complete_2025: {
        Row: {
          additional_context: string | null
          ai_knowledge_level: string | null
          annual_revenue_range: string | null
          backup_timestamp: string | null
          birth_date: string | null
          business_challenges: Json | null
          business_model: string | null
          city: string | null
          company_name: string | null
          company_segment: string | null
          company_size: string | null
          company_website: string | null
          completed_at: string | null
          country: string | null
          country_code: string | null
          created_at: string | null
          current_step: number | null
          desired_ai_areas: Json | null
          email: string | null
          expected_outcome_30days: string | null
          has_implemented: string | null
          how_found_us: string | null
          id: string | null
          instagram_url: string | null
          interests: Json | null
          is_completed: boolean | null
          linkedin_url: string | null
          main_challenge: string | null
          main_goal: string | null
          name: string | null
          networking_availability: number | null
          previous_tools: Json | null
          primary_goal: string | null
          referred_by: string | null
          role: string | null
          skills_to_share: Json | null
          state: string | null
          time_preference: Json | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          uses_ai: string | null
          week_availability: string | null
          whatsapp: string | null
        }
        Insert: {
          additional_context?: string | null
          ai_knowledge_level?: string | null
          annual_revenue_range?: string | null
          backup_timestamp?: string | null
          birth_date?: string | null
          business_challenges?: Json | null
          business_model?: string | null
          city?: string | null
          company_name?: string | null
          company_segment?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          desired_ai_areas?: Json | null
          email?: string | null
          expected_outcome_30days?: string | null
          has_implemented?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          interests?: Json | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          networking_availability?: number | null
          previous_tools?: Json | null
          primary_goal?: string | null
          referred_by?: string | null
          role?: string | null
          skills_to_share?: Json | null
          state?: string | null
          time_preference?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          uses_ai?: string | null
          week_availability?: string | null
          whatsapp?: string | null
        }
        Update: {
          additional_context?: string | null
          ai_knowledge_level?: string | null
          annual_revenue_range?: string | null
          backup_timestamp?: string | null
          birth_date?: string | null
          business_challenges?: Json | null
          business_model?: string | null
          city?: string | null
          company_name?: string | null
          company_segment?: string | null
          company_size?: string | null
          company_website?: string | null
          completed_at?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: number | null
          desired_ai_areas?: Json | null
          email?: string | null
          expected_outcome_30days?: string | null
          has_implemented?: string | null
          how_found_us?: string | null
          id?: string | null
          instagram_url?: string | null
          interests?: Json | null
          is_completed?: boolean | null
          linkedin_url?: string | null
          main_challenge?: string | null
          main_goal?: string | null
          name?: string | null
          networking_availability?: number | null
          previous_tools?: Json | null
          primary_goal?: string | null
          referred_by?: string | null
          role?: string | null
          skills_to_share?: Json | null
          state?: string | null
          time_preference?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          uses_ai?: string | null
          week_availability?: string | null
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
            foreignKeyName: "referral_benefits_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          benefits_claimed: boolean
          completed_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          last_sent_at: string | null
          metadata: Json | null
          notes: string | null
          referrer_id: string
          role_id: string | null
          send_attempts: number | null
          status: Database["public"]["Enums"]["referral_status"]
          token: string
          type: Database["public"]["Enums"]["referral_type"]
        }
        Insert: {
          benefits_claimed?: boolean
          completed_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          last_sent_at?: string | null
          metadata?: Json | null
          notes?: string | null
          referrer_id: string
          role_id?: string | null
          send_attempts?: number | null
          status?: Database["public"]["Enums"]["referral_status"]
          token: string
          type: Database["public"]["Enums"]["referral_type"]
        }
        Update: {
          benefits_claimed?: boolean
          completed_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          last_sent_at?: string | null
          metadata?: Json | null
          notes?: string | null
          referrer_id?: string
          role_id?: string | null
          send_attempts?: number | null
          status?: Database["public"]["Enums"]["referral_status"]
          token?: string
          type?: Database["public"]["Enums"]["referral_type"]
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
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
          certificate_data: Json | null
          certificate_filename: string | null
          certificate_url: string | null
          created_at: string | null
          id: string
          implementation_date: string
          issued_at: string | null
          solution_id: string | null
          template_id: string | null
          updated_at: string
          user_id: string | null
          validation_code: string | null
        }
        Insert: {
          certificate_data?: Json | null
          certificate_filename?: string | null
          certificate_url?: string | null
          created_at?: string | null
          id?: string
          implementation_date?: string
          issued_at?: string | null
          solution_id?: string | null
          template_id?: string | null
          updated_at?: string
          user_id?: string | null
          validation_code?: string | null
        }
        Update: {
          certificate_data?: Json | null
          certificate_filename?: string | null
          certificate_url?: string | null
          created_at?: string | null
          id?: string
          implementation_date?: string
          issued_at?: string | null
          solution_id?: string | null
          template_id?: string | null
          updated_at?: string
          user_id?: string | null
          validation_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_certificates_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
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
        Relationships: [
          {
            foreignKeyName: "solution_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "solution_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number
          module_id: string | null
          parent_id: string | null
          solution_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number
          module_id?: string | null
          parent_id?: string | null
          solution_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number
          module_id?: string | null
          parent_id?: string | null
          solution_id?: string
          updated_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "solution_metrics_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "solution_resources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_resources_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "solution_tools_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_tools_reference: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          order_index: number
          solution_id: string | null
          tool_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          order_index?: number
          solution_id?: string | null
          tool_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          order_index?: number
          solution_id?: string | null
          tool_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_tools_reference_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_tools_reference_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          category: Database["public"]["Enums"]["solution_category"]
          checklist_items: Json | null
          completion_requirements: Json | null
          created_at: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level_new"]
          id: string
          implementation_steps: Json | null
          published: boolean
          related_solutions: string[] | null
          slug: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["solution_category"]
          checklist_items?: Json | null
          completion_requirements?: Json | null
          created_at?: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level_new"]
          id?: string
          implementation_steps?: Json | null
          published?: boolean
          related_solutions?: string[] | null
          slug: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["solution_category"]
          checklist_items?: Json | null
          completion_requirements?: Json | null
          created_at?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level_new"]
          id?: string
          implementation_steps?: Json | null
          published?: boolean
          related_solutions?: string[] | null
          slug?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
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
          {
            foreignKeyName: "suggestion_comments_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_comments_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions_with_profiles"
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
          {
            foreignKeyName: "suggestion_notifications_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_notifications_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions_with_profiles"
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
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          suggestion_id: string
          updated_at?: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          created_at?: string
          id?: string
          suggestion_id?: string
          updated_at?: string
          user_id?: string
          vote_type?: Database["public"]["Enums"]["vote_type"]
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
          comment_count: number
          created_at: string
          description: string
          downvotes: number
          id: string
          image_url: string | null
          is_hidden: boolean
          is_pinned: boolean
          profiles: Json | null
          status: Database["public"]["Enums"]["suggestion_status"]
          title: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          category_id?: string | null
          comment_count?: number
          created_at?: string
          description: string
          downvotes?: number
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          is_pinned?: boolean
          profiles?: Json | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          category_id?: string | null
          comment_count?: number
          created_at?: string
          description?: string
          downvotes?: number
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          is_pinned?: boolean
          profiles?: Json | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          title?: string
          updated_at?: string
          upvotes?: number
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
      trusted_domains: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          domain: string
          id: string
          is_active: boolean
          role_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean
          role_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trusted_domains_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_checklists_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
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
      suggestions_with_profiles: {
        Row: {
          category_id: string | null
          comment_count: number | null
          created_at: string | null
          description: string | null
          downvotes: number | null
          id: string | null
          image_url: string | null
          is_hidden: boolean | null
          is_pinned: boolean | null
          profiles: Json | null
          status: Database["public"]["Enums"]["suggestion_status"] | null
          title: string | null
          updated_at: string | null
          upvotes: number | null
          user_avatar: string | null
          user_id: string | null
          user_name: string | null
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
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      users_with_roles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string | null
          industry: string | null
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
    }
    Functions: {
      admin_reset_user: {
        Args: { user_email: string }
        Returns: Json
      }
      audit_role_assignments: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_count_by_role: Json
          inconsistencies_count: number
          total_users: number
          roles_without_users: string[]
          users_without_roles: number
        }[]
      }
      backup_all_onboarding_data: {
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
      check_and_fix_onboarding_data: {
        Args: { user_id_param: string }
        Returns: Json
      }
      check_invite_token: {
        Args: { invite_token: string }
        Returns: Json
      }
      check_onboarding_integrity: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          action_type: string
          max_attempts?: number
          window_minutes?: number
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
      check_solution_certificate_eligibility: {
        Args: { p_user_id: string; p_solution_id: string }
        Returns: boolean
      }
      check_trusted_domain: {
        Args: { p_email: string }
        Returns: Json
      }
      clean_user_onboarding_data: {
        Args: { p_user_id: string }
        Returns: Json
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_all_networking_data: {
        Args: Record<PropertyKey, never>
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
      create_onboarding_backup: {
        Args: { p_user_id: string; p_backup_type?: string }
        Returns: string
      }
      create_referral: {
        Args: {
          p_referrer_id: string
          p_email: string
          p_type: Database["public"]["Enums"]["referral_type"]
          p_role_id?: string
          p_notes?: string
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
        Returns: boolean
      }
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
      deleteforumpost: {
        Args: { post_id: string }
        Returns: Json
      }
      detect_login_anomaly: {
        Args: { p_user_id: string; p_ip_address: string }
        Returns: boolean
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
      generate_referral_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_security_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_profile_safe: {
        Args: { p_user_id?: string }
        Returns: Json
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
      increment_suggestion_downvote: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
      increment_suggestion_upvote: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
      increment_topic_replies: {
        Args: { topic_id: string }
        Returns: undefined
      }
      increment_topic_views: {
        Args: { topic_id: string }
        Returns: undefined
      }
      initialize_onboarding_for_all_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { check_user_id?: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_invite_validation_attempt: {
        Args: { p_token: string; p_success: boolean; p_error_message?: string }
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
        Returns: undefined
      }
      log_security_violation: {
        Args: {
          violation_type: string
          resource_type: string
          resource_id?: string
          details?: Json
        }
        Returns: undefined
      }
      mark_topic_as_solved: {
        Args: { topic_id: string; post_id: string }
        Returns: Json
      }
      mark_topic_solved: {
        Args: { p_topic_id: string; p_post_id: string }
        Returns: Json
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
      normalize_solution_category: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_referral: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json
      }
      quick_check_permission: {
        Args: { user_id: string; permission_code: string }
        Returns: boolean
      }
      reset_all_onboarding_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      reset_user_complete: {
        Args: { target_user_id: string }
        Returns: Json
      }
      setup_learning_storage_buckets: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      sync_profile_roles: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      unmark_topic_as_solved: {
        Args: { topic_id: string }
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
      user_can_access_feature: {
        Args: { p_user_id: string; p_feature: string }
        Returns: Json
      }
      user_has_permission: {
        Args: { user_id: string; permission_code: string }
        Returns: boolean
      }
      validate_invite_token_enhanced: {
        Args: { p_token: string }
        Returns: {
          channel_preference: string | null
          created_at: string
          created_by: string
          email: string
          email_id: string | null
          email_provider: string | null
          expires_at: string
          id: string
          last_sent_at: string | null
          notes: string | null
          phone: string | null
          role_id: string
          send_attempts: number | null
          token: string
          used_at: string | null
        }[]
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
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
      validate_solution_certificate: {
        Args: { p_validation_code: string }
        Returns: Json
      }
    }
    Enums: {
      connection_status: "pending" | "accepted" | "rejected"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      difficulty_level_new: "easy" | "medium" | "advanced"
      forum_reaction_type: "like" | "helpful" | "insightful" | "celebrate"
      notification_type:
        | "status_change"
        | "new_comment"
        | "new_vote"
        | "comment_reply"
        | "admin_response"
      referral_status: "pending" | "registered" | "completed"
      referral_type: "club" | "formacao"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      connection_status: ["pending", "accepted", "rejected"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      difficulty_level_new: ["easy", "medium", "advanced"],
      forum_reaction_type: ["like", "helpful", "insightful", "celebrate"],
      notification_type: [
        "status_change",
        "new_comment",
        "new_vote",
        "comment_reply",
        "admin_response",
      ],
      referral_status: ["pending", "registered", "completed"],
      referral_type: ["club", "formacao"],
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
