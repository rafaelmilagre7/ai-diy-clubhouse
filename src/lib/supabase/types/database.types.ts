
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
          id: string
          title: string
          content: string
          content_type: string | null
          template_type: string | null
          priority: string | null
          status: string | null
          target_roles: string[]
          delivery_channels: string[]
          scheduled_for: string | null
          sent_at: string | null
          created_at: string | null
          created_by: string
          updated_at: string | null
          email_subject: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          content_type?: string | null
          template_type?: string | null
          priority?: string | null
          status?: string | null
          target_roles: string[]
          delivery_channels?: string[]
          scheduled_for?: string | null
          sent_at?: string | null
          created_at?: string | null
          created_by: string
          updated_at?: string | null
          email_subject?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          content_type?: string | null
          template_type?: string | null
          priority?: string | null
          status?: string | null
          target_roles?: string[]
          delivery_channels?: string[]
          scheduled_for?: string | null
          sent_at?: string | null
          created_at?: string | null
          created_by?: string
          updated_at?: string | null
          email_subject?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          event_type: string
          solution_id: string | null
          module_id: string | null
          event_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          solution_id?: string | null
          module_id?: string | null
          event_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          solution_id?: string | null
          module_id?: string | null
          event_data?: Json | null
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
          slug: string
          description: string | null
          icon: string | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
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
          content: string
          parent_id: string | null
          is_solution: boolean
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          user_id: string
          content: string
          parent_id?: string | null
          is_solution?: boolean
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
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
          reaction_type: Database['public']['Enums']['reaction_type']
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          reaction_type: Database['public']['Enums']['reaction_type']
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          reaction_type?: Database['public']['Enums']['reaction_type']
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
          expires_at: string
          used_at: string | null
          created_by: string
          created_at: string
          notes: string | null
          whatsapp_number: string | null
          preferred_channel: string | null
          send_attempts: number | null
          last_sent_at: string | null
        }
        Insert: {
          id?: string
          email: string
          role_id: string
          token: string
          expires_at: string
          used_at?: string | null
          created_by: string
          created_at?: string
          notes?: string | null
          whatsapp_number?: string | null
          preferred_channel?: string | null
          send_attempts?: number | null
          last_sent_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          role_id?: string
          token?: string
          expires_at?: string
          used_at?: string | null
          created_by?: string
          created_at?: string
          notes?: string | null
          whatsapp_number?: string | null
          preferred_channel?: string | null
          send_attempts?: number | null
          last_sent_at?: string | null
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
          created_at: string
          updated_at: string
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          opened_count: number | null
          clicked_count: number | null
          conversion_value: number | null
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
          created_at?: string
          updated_at?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          opened_count?: number | null
          clicked_count?: number | null
          conversion_value?: number | null
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
          created_at?: string
          updated_at?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          opened_count?: number | null
          clicked_count?: number | null
          conversion_value?: number | null
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
          content: string
          parent_id: string | null
          likes_count: number
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          user_id: string
          content: string
          parent_id?: string | null
          likes_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
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
          slug: string
          description: string | null
          cover_image_url: string | null
          published: boolean | null
          created_by: string | null
          order_index: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          published?: boolean | null
          created_by?: string | null
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          cover_image_url?: string | null
          published?: boolean | null
          created_by?: string | null
          order_index?: number | null
          created_at?: string
          updated_at?: string
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
          order_index: number
          published: boolean | null
          cover_image_url: string | null
          estimated_time_minutes: number | null
          difficulty_level: string | null
          ai_assistant_enabled: boolean | null
          ai_assistant_id: string | null
          ai_assistant_prompt: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description?: string | null
          content?: Json | null
          order_index?: number
          published?: boolean | null
          cover_image_url?: string | null
          estimated_time_minutes?: number | null
          difficulty_level?: string | null
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
          order_index?: number
          published?: boolean | null
          cover_image_url?: string | null
          estimated_time_minutes?: number | null
          difficulty_level?: string | null
          ai_assistant_enabled?: boolean | null
          ai_assistant_id?: string | null
          ai_assistant_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_lesson_videos: {
        Row: {
          id: string
          lesson_id: string
          title: string
          description: string | null
          url: string
          video_type: string | null
          video_id: string | null
          thumbnail_url: string | null
          duration_seconds: number | null
          order_index: number
          video_file_path: string | null
          video_file_name: string | null
          file_size_bytes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description?: string | null
          url: string
          video_type?: string | null
          video_id?: string | null
          thumbnail_url?: string | null
          duration_seconds?: number | null
          order_index?: number
          video_file_path?: string | null
          video_file_name?: string | null
          file_size_bytes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string | null
          url?: string
          video_type?: string | null
          video_id?: string | null
          thumbnail_url?: string | null
          duration_seconds?: number | null
          order_index?: number
          video_file_path?: string | null
          video_file_name?: string | null
          file_size_bytes?: number | null
          created_at?: string
        }
        Relationships: []
      }
      learning_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          published: boolean | null
          cover_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index?: number
          published?: boolean | null
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          published?: boolean | null
          cover_image_url?: string | null
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
          type: string
          content: Json
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
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          whatsapp_enabled: boolean
          admin_communications_inapp: boolean | null
          admin_communications_email: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          admin_communications_inapp?: boolean | null
          admin_communications_email?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          admin_communications_inapp?: boolean | null
          admin_communications_email?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_sync: {
        Row: {
          id: string
          user_id: string
          data: Json
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: Json
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      permission_definitions: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          category?: string | null
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string
          company_name: string
          industry: string
          role_id: string
          role?: string
          created_at: string
          onboarding_completed: boolean
          onboarding_completed_at: string
          referrals_count: number
          successful_referrals_count: number
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string
          company_name?: string
          industry?: string
          role_id: string
          role?: string
          created_at?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string
          referrals_count?: number
          successful_referrals_count?: number
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string
          company_name?: string
          industry?: string
          role_id?: string
          role?: string
          created_at?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string
          referrals_count?: number
          successful_referrals_count?: number
        }
        Relationships: []
      }
      progress: {
        Row: {
          id: string
          user_id: string
          solution_id: string
          completed_modules: number[]
          is_completed: boolean
          completion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          completed_modules?: number[]
          is_completed?: boolean
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          completed_modules?: number[]
          is_completed?: boolean
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
          created_at?: string
        }
        Relationships: []
      }
      solution_resources: {
        Row: {
          id: string
          solution_id: string
          title: string
          type: string
          url: string | null
          file_path: string | null
          description: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          type: string
          url?: string | null
          file_path?: string | null
          description?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          type?: string
          url?: string | null
          file_path?: string | null
          description?: string | null
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      solutions: {
        Row: {
          id: string
          title: string
          description: string | null
          category: Database['public']['Enums']['solution_category']
          difficulty_level: string
          estimated_time_hours: number | null
          cover_image_url: string | null
          published: boolean
          featured: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: Database['public']['Enums']['solution_category']
          difficulty_level: string
          estimated_time_hours?: number | null
          cover_image_url?: string | null
          published?: boolean
          featured?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: Database['public']['Enums']['solution_category']
          difficulty_level?: string
          estimated_time_hours?: number | null
          cover_image_url?: string | null
          published?: boolean
          featured?: boolean
          created_by?: string | null
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
          is_required: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          tool_id: string
          is_required?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          tool_id?: string
          is_required?: boolean
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      tool_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          id: string
          name: string
          description: string | null
          category_id: string | null
          official_url: string | null
          logo_url: string | null
          is_active: boolean
          tags: string[] | null
          pricing_model: string | null
          member_benefit: Json | null
          video_tutorials: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category_id?: string | null
          official_url?: string | null
          logo_url?: string | null
          is_active?: boolean
          tags?: string[] | null
          pricing_model?: string | null
          member_benefit?: Json | null
          video_tutorials?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category_id?: string | null
          official_url?: string | null
          logo_url?: string | null
          is_active?: boolean
          tags?: string[] | null
          pricing_model?: string | null
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
          checked_items: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          checked_items: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          checked_items?: Json
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
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: Json | null
          is_system?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: Json | null
          is_system?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_permissions: {
        Args: {
          user_id: string
        }
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
      audit_role_assignments: {
        Args: {
          user_id: string
          action: string
          details?: Json
        }
        Returns: string
      }
      create_storage_public_policy: {
        Args: {
          bucket_name: string
        }
        Returns: boolean
      }
      increment_topic_replies: {
        Args: {
          topic_id: string
        }
        Returns: void
      }
      increment_topic_views: {
        Args: {
          topic_id: string
        }
        Returns: void
      }
      delete_forum_topic: {
        Args: {
          topic_id: string
        }
        Returns: Json
      }
      delete_forum_post: {
        Args: {
          post_id: string
        }
        Returns: Json
      }
      call_supabase_rpc: {
        Args: {
          function_name: string
          params?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      reaction_type: 'like' | 'heart' | 'thumbs_up' | 'thumbs_down' | 'laugh' | 'angry'
      solution_category: 'Receita' | 'Operacional' | 'Estratégia'
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
