
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
      analytics: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: Json | null
          solution_id: string | null
          module_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_data?: Json | null
          solution_id?: string | null
          module_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_data?: Json | null
          solution_id?: string | null
          module_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      analytics_backups: {
        Row: {
          id: string
          table_name: string
          backup_reason: string
          backup_data: Json
          record_count: number
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          backup_reason: string
          backup_data: Json
          record_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          backup_reason?: string
          backup_data?: Json
          record_count?: number
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          action: string
          resource_id: string | null
          details: Json | null
          timestamp: string | null
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          severity: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          action: string
          resource_id?: string | null
          details?: Json | null
          timestamp?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          severity?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          action?: string
          resource_id?: string | null
          details?: Json | null
          timestamp?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          severity?: string | null
        }
        Relationships: []
      }
      benefit_access_control: {
        Row: {
          id: string
          tool_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          tool_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          tool_id?: string
          role_id?: string
          created_at?: string
        }
        Relationships: []
      }
      course_access_control: {
        Row: {
          id: string
          course_id: string | null
          role_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          course_id?: string | null
          role_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          course_id?: string | null
          role_id?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      event_access_control: {
        Row: {
          id: string
          event_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          role_id?: string
          created_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          location_link: string | null
          physical_location: string | null
          cover_image_url: string | null
          is_recurring: boolean | null
          recurrence_pattern: string | null
          recurrence_interval: number | null
          recurrence_day: number | null
          recurrence_count: number | null
          recurrence_end_date: string | null
          parent_event_id: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          location_link?: string | null
          physical_location?: string | null
          cover_image_url?: string | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          recurrence_interval?: number | null
          recurrence_day?: number | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          parent_event_id?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          location_link?: string | null
          physical_location?: string | null
          cover_image_url?: string | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          recurrence_interval?: number | null
          recurrence_day?: number | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          parent_event_id?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          icon: string | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          icon?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          icon?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          id: string
          topic_id: string
          user_id: string
          parent_id: string | null
          content: string
          is_solution: boolean
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          user_id: string
          parent_id?: string | null
          content: string
          is_solution?: boolean
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          is_solution?: boolean
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          reaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          reaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          reaction_type?: string
          created_at?: string
        }
        Relationships: []
      }
      forum_topics: {
        Row: {
          id: string
          category_id: string
          user_id: string
          title: string
          content: string
          is_pinned: boolean
          is_locked: boolean
          is_solved: boolean | null
          view_count: number
          reply_count: number
          last_activity_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          user_id: string
          title: string
          content: string
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean | null
          view_count?: number
          reply_count?: number
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          user_id?: string
          title?: string
          content?: string
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean | null
          view_count?: number
          reply_count?: number
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      implementation_checkpoints: {
        Row: {
          id: string
          solution_id: string | null
          checkpoint_order: number
          description: string
          created_at: string | null
        }
        Insert: {
          id?: string
          solution_id?: string | null
          checkpoint_order: number
          description: string
          created_at?: string | null
        }
        Update: {
          id?: string
          solution_id?: string | null
          checkpoint_order?: number
          description?: string
          created_at?: string | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          id: string
          email: string
          role_id: string
          token: string
          created_by: string
          expires_at: string
          used_at: string | null
          notes: string | null
          send_attempts: number | null
          last_sent_at: string | null
          whatsapp_number: string | null
          preferred_channel: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role_id: string
          token: string
          created_by: string
          expires_at: string
          used_at?: string | null
          notes?: string | null
          send_attempts?: number | null
          last_sent_at?: string | null
          whatsapp_number?: string | null
          preferred_channel?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role_id?: string
          token?: string
          created_by?: string
          expires_at?: string
          used_at?: string | null
          notes?: string | null
          send_attempts?: number | null
          last_sent_at?: string | null
          whatsapp_number?: string | null
          preferred_channel?: string | null
          created_at?: string
        }
        Relationships: []
      }
      invite_campaigns: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          channels: string[]
          email_template: string
          whatsapp_template: string | null
          target_role_id: string | null
          created_by: string
          scheduled_for: string | null
          segmentation: Json | null
          follow_up_rules: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          channels?: string[]
          email_template: string
          whatsapp_template?: string | null
          target_role_id?: string | null
          created_by: string
          scheduled_for?: string | null
          segmentation?: Json | null
          follow_up_rules?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          channels?: string[]
          email_template?: string
          whatsapp_template?: string | null
          target_role_id?: string | null
          created_by?: string
          scheduled_for?: string | null
          segmentation?: Json | null
          follow_up_rules?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invite_deliveries: {
        Row: {
          id: string
          invite_id: string
          channel: string
          status: string
          provider_id: string | null
          error_message: string | null
          metadata: Json | null
          sent_at: string | null
          delivered_at: string | null
          opened_at: string | null
          clicked_at: string | null
          failed_at: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          opened_count: number | null
          clicked_count: number | null
          conversion_value: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invite_id: string
          channel: string
          status?: string
          provider_id?: string | null
          error_message?: string | null
          metadata?: Json | null
          sent_at?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          clicked_at?: string | null
          failed_at?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          opened_count?: number | null
          clicked_count?: number | null
          conversion_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invite_id?: string
          channel?: string
          status?: string
          provider_id?: string | null
          error_message?: string | null
          metadata?: Json | null
          sent_at?: string | null
          delivered_at?: string | null
          opened_at?: string | null
          clicked_at?: string | null
          failed_at?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          opened_count?: number | null
          clicked_count?: number | null
          conversion_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invite_analytics_events: {
        Row: {
          id: string
          invite_id: string
          event_type: string
          channel: string
          timestamp: string
          ip_address: string | null
          user_agent: string | null
          provider_id: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          invite_id: string
          event_type: string
          channel: string
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
          provider_id?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          invite_id?: string
          event_type?: string
          channel?: string
          timestamp?: string
          ip_address?: string | null
          user_agent?: string | null
          provider_id?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      learning_certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          issued_at: string
          certificate_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          issued_at?: string
          certificate_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          issued_at?: string
          certificate_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      learning_comments: {
        Row: {
          id: string
          lesson_id: string
          user_id: string
          parent_id: string | null
          content: string
          likes_count: number
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          user_id: string
          parent_id?: string | null
          content: string
          likes_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          likes_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_courses: {
        Row: {
          id: string
          title: string
          description: string | null
          slug: string
          cover_image_url: string | null
          published: boolean | null
          order_index: number | null
          created_by: string | null
          created_at: string
          updated_at: string
          is_restricted?: boolean
          module_count?: number
          lesson_count?: number
          all_lessons?: any[]
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          slug: string
          cover_image_url?: string | null
          published?: boolean | null
          order_index?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          slug?: string
          cover_image_url?: string | null
          published?: boolean | null
          order_index?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_lesson_nps: {
        Row: {
          id: string
          lesson_id: string
          user_id: string
          score: number
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          user_id: string
          score: number
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          user_id?: string
          score?: number
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_lesson_videos: {
        Row: {
          id: string
          lesson_id: string
          order_index: number
          title: string
          description: string | null
          url: string
          video_type: string | null
          video_file_path: string | null
          video_file_name: string | null
          file_size_bytes: number | null
          duration_seconds: number | null
          thumbnail_url: string | null
          video_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          order_index?: number
          title: string
          description?: string | null
          url: string
          video_type?: string | null
          video_file_path?: string | null
          video_file_name?: string | null
          file_size_bytes?: number | null
          duration_seconds?: number | null
          thumbnail_url?: string | null
          video_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          order_index?: number
          title?: string
          description?: string | null
          url?: string
          video_type?: string | null
          video_file_path?: string | null
          video_file_name?: string | null
          file_size_bytes?: number | null
          duration_seconds?: number | null
          thumbnail_url?: string | null
          video_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      learning_lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string | null
          content: Json | null
          cover_image_url: string | null
          order_index: number
          estimated_time_minutes: number | null
          difficulty_level: string | null
          published: boolean | null
          ai_assistant_enabled: boolean | null
          ai_assistant_id: string | null
          ai_assistant_prompt: string | null
          created_at: string
          updated_at: string
          module?: {
            id: string
            title: string
            course?: {
              id: string
              title: string
            }
          }
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description?: string | null
          content?: Json | null
          cover_image_url?: string | null
          order_index?: number
          estimated_time_minutes?: number | null
          difficulty_level?: string | null
          published?: boolean | null
          ai_assistant_enabled?: boolean | null
          ai_assistant_id?: string | null
          ai_assistant_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          description?: string | null
          content?: Json | null
          cover_image_url?: string | null
          order_index?: number
          estimated_time_minutes?: number | null
          difficulty_level?: string | null
          published?: boolean | null
          ai_assistant_enabled?: boolean | null
          ai_assistant_id?: string | null
          ai_assistant_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          cover_image_url: string | null
          order_index: number
          published: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          cover_image_url?: string | null
          order_index?: number
          published?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          cover_image_url?: string | null
          order_index?: number
          published?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          progress_percentage: number | null
          video_progress: Json | null
          started_at: string
          completed_at: string | null
          last_position_seconds: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          progress_percentage?: number | null
          video_progress?: Json | null
          started_at?: string
          completed_at?: string | null
          last_position_seconds?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          progress_percentage?: number | null
          video_progress?: Json | null
          started_at?: string
          completed_at?: string | null
          last_position_seconds?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          id: string
          lesson_id: string | null
          name: string
          description: string | null
          file_url: string
          file_type: string | null
          file_size_bytes: number | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          name: string
          description?: string | null
          file_url: string
          file_type?: string | null
          file_size_bytes?: number | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string | null
          name?: string
          description?: string | null
          file_url?: string
          file_type?: string | null
          file_size_bytes?: number | null
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          id: string
          solution_id: string
          title: string
          description?: string | null
          type: string
          content: Json
          module_order: number
          estimated_time_minutes: number | null
          metrics: Json | null
          certificate_template: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          description?: string | null
          type: string
          content?: Json
          module_order: number
          estimated_time_minutes?: number | null
          metrics?: Json | null
          certificate_template?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          description?: string | null
          type?: string
          content?: Json
          module_order?: number
          estimated_time_minutes?: number | null
          metrics?: Json | null
          certificate_template?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_sync: {
        Row: {
          id: string
          user_id: string
          sync_data: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sync_data?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sync_data?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          company_name: string | null
          industry: string | null
          role_id: string
          role: string
          created_at: string
          updated_at: string
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          referrals_count: number
          successful_referrals_count: number
          whatsapp_number: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          role_id: string
          role?: string
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          referrals_count?: number
          successful_referrals_count?: number
          whatsapp_number?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          role_id?: string
          role?: string
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          referrals_count?: number
          successful_referrals_count?: number
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          id: string
          user_id: string
          solution_id: string
          module_id: string | null
          is_completed: boolean
          progress_percentage: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          module_id?: string | null
          is_completed?: boolean
          progress_percentage?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          module_id?: string | null
          is_completed?: boolean
          progress_percentage?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      solution_metrics: {
        Row: {
          id: string
          solution_id: string
          total_users: number
          completed_users: number
          average_completion_time: number | null
          difficulty_rating: number | null
          success_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          total_users?: number
          completed_users?: number
          average_completion_time?: number | null
          difficulty_rating?: number | null
          success_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          total_users?: number
          completed_users?: number
          average_completion_time?: number | null
          difficulty_rating?: number | null
          success_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      solution_resources: {
        Row: {
          id: string
          solution_id: string
          title: string
          description: string | null
          url: string | null
          file_type: string | null
          file_size: number | null
          resource_type: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          description?: string | null
          url?: string | null
          file_type?: string | null
          file_size?: number | null
          resource_type: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          description?: string | null
          url?: string | null
          file_type?: string | null
          file_size?: number | null
          resource_type?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      solution_tools: {
        Row: {
          id: string
          solution_id: string
          tool_id: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          tool_id: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          tool_id?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      solutions: {
        Row: {
          id: string
          title: string
          description: string
          slug?: string
          category: string
          difficulty: string
          difficulty_level: string
          estimated_time_hours: number
          cover_image_url: string | null
          thumbnail_url: string | null
          tags: string[] | null
          published: boolean
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          slug?: string
          category: string
          difficulty: string
          difficulty_level: string
          estimated_time_hours?: number
          cover_image_url?: string | null
          thumbnail_url?: string | null
          tags?: string[] | null
          published?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          slug?: string
          category?: string
          difficulty?: string
          difficulty_level?: string
          estimated_time_hours?: number
          cover_image_url?: string | null
          thumbnail_url?: string | null
          tags?: string[] | null
          published?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          id: string
          name: string
          description: string
          logo_url: string | null
          official_url: string | null
          category: string
          tags: string[] | null
          is_active: boolean
          member_benefit: Json | null
          video_tutorials: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          logo_url?: string | null
          official_url?: string | null
          category: string
          tags?: string[] | null
          is_active?: boolean
          member_benefit?: Json | null
          video_tutorials?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          logo_url?: string | null
          official_url?: string | null
          category?: string
          tags?: string[] | null
          is_active?: boolean
          member_benefit?: Json | null
          video_tutorials?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_checklists: {
        Row: {
          id: string
          user_id: string
          solution_id: string
          checkpoint_id: string | null
          checked_items: Json | null
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          checkpoint_id?: string | null
          checked_items?: Json | null
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          checkpoint_id?: string | null
          checked_items?: Json | null
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: Json | null
          is_system: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: Json | null
          is_system?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: Json | null
          is_system?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      increment_topic_replies: {
        Args: {
          topic_id: string
        }
        Returns: undefined
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

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
