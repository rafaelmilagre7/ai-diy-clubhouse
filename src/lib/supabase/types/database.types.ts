
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
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          referrals_count: number
          successful_referrals_count: number
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
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          referrals_count?: number
          successful_referrals_count?: number
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
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          referrals_count?: number
          successful_referrals_count?: number
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
          published: boolean
          order_index: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          slug: string
          cover_image_url?: string | null
          published?: boolean
          order_index?: number
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
          published?: boolean
          order_index?: number
          created_by?: string | null
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
          order_index: number
          published: boolean
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
          published?: boolean
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
          published?: boolean
          cover_image_url?: string | null
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
          published: boolean
          cover_image_url: string | null
          estimated_time_minutes: number
          difficulty_level: string
          ai_assistant_enabled: boolean
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
          published?: boolean
          cover_image_url?: string | null
          estimated_time_minutes?: number
          difficulty_level?: string
          ai_assistant_enabled?: boolean
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
          published?: boolean
          cover_image_url?: string | null
          estimated_time_minutes?: number
          difficulty_level?: string
          ai_assistant_enabled?: boolean
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
          video_type: string
          video_id: string | null
          video_file_path: string | null
          video_file_name: string | null
          file_size_bytes: number | null
          duration_seconds: number | null
          thumbnail_url: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description?: string | null
          url: string
          video_type?: string
          video_id?: string | null
          video_file_path?: string | null
          video_file_name?: string | null
          file_size_bytes?: number | null
          duration_seconds?: number | null
          thumbnail_url?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string | null
          url?: string
          video_type?: string
          video_id?: string | null
          video_file_path?: string | null
          video_file_name?: string | null
          file_size_bytes?: number | null
          duration_seconds?: number | null
          thumbnail_url?: string | null
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          progress_percentage: number
          video_progress: Json
          started_at: string
          completed_at: string | null
          last_position_seconds: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          progress_percentage?: number
          video_progress?: Json
          started_at?: string
          completed_at?: string | null
          last_position_seconds?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          progress_percentage?: number
          video_progress?: Json
          started_at?: string
          completed_at?: string | null
          last_position_seconds?: number
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
      solutions: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          cover_image_url: string | null
          published: boolean
          order_index: number
          estimated_time_hours: number
          difficulty_level: string
          tags: string[] | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          cover_image_url?: string | null
          published?: boolean
          order_index?: number
          estimated_time_hours?: number
          difficulty_level?: string
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          cover_image_url?: string | null
          published?: boolean
          order_index?: number
          estimated_time_hours?: number
          difficulty_level?: string
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
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
          estimated_time_minutes: number
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
          estimated_time_minutes?: number
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
          estimated_time_minutes?: number
          metrics?: Json | null
          certificate_template?: Json | null
          created_at?: string
          updated_at?: string
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
          completion_percentage: number
          started_at: string
          completed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          module_id?: string | null
          is_completed?: boolean
          completion_percentage?: number
          started_at?: string
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          module_id?: string | null
          is_completed?: boolean
          completion_percentage?: number
          started_at?: string
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_access_control: {
        Row: {
          id: string
          course_id: string | null
          role_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id?: string | null
          role_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string | null
          role_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: Json | null
          is_system: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: Json | null
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: Json | null
          is_system?: boolean
          created_at?: string
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
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          category?: string
          created_at?: string
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
      implementation_checkpoints: {
        Row: {
          id: string
          solution_id: string | null
          description: string
          checkpoint_order: number
          created_at: string
        }
        Insert: {
          id?: string
          solution_id?: string | null
          description: string
          checkpoint_order: number
          created_at?: string
        }
        Update: {
          id?: string
          solution_id?: string | null
          description?: string
          checkpoint_order?: number
          created_at?: string
        }
        Relationships: []
      }
      solution_resources: {
        Row: {
          id: string
          solution_id: string
          title: string
          description: string | null
          file_url: string
          file_type: string
          file_size_bytes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          description?: string | null
          file_url: string
          file_type: string
          file_size_bytes: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          description?: string | null
          file_url?: string
          file_type?: string
          file_size_bytes?: number
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
        }
        Insert: {
          id?: string
          solution_id: string
          tool_id: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          tool_id?: string
          order_index?: number
          created_at?: string
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
      tools: {
        Row: {
          id: string
          name: string
          description: string
          logo_url: string | null
          website_url: string | null
          category: string
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          logo_url?: string | null
          website_url?: string | null
          category: string
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          logo_url?: string | null
          website_url?: string | null
          category?: string
          is_featured?: boolean
          created_at?: string
          updated_at?: string
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
      forum_topics: {
        Row: {
          id: string
          user_id: string
          category_id: string
          title: string
          content: string
          is_pinned: boolean
          is_locked: boolean
          is_solved: boolean | null
          view_count: number
          reply_count: number
          created_at: string
          updated_at: string
          last_activity_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          title: string
          content: string
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean | null
          view_count?: number
          reply_count?: number
          created_at?: string
          updated_at?: string
          last_activity_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          title?: string
          content?: string
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean | null
          view_count?: number
          reply_count?: number
          created_at?: string
          updated_at?: string
          last_activity_at?: string
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
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          action: string
          resource_id: string | null
          details: Json | null
          severity: string | null
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          action: string
          resource_id?: string | null
          details?: Json | null
          severity?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          action?: string
          resource_id?: string | null
          details?: Json | null
          severity?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          timestamp?: string
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
          is_recurring: boolean
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
          is_recurring?: boolean
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
          is_recurring?: boolean
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
    }
    Views: {}
    Functions: {
      create_storage_public_policy: {
        Args: {
          bucket_name: string
        }
        Returns: boolean
      }
      increment_topic_views: {
        Args: {
          topic_id: string
        }
        Returns: undefined
      }
      increment_topic_replies: {
        Args: {
          topic_id: string
        }
        Returns: undefined
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
      audit_role_assignments: {
        Args: {
          user_id: string
          action: string
          details?: Json
        }
        Returns: undefined
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}
