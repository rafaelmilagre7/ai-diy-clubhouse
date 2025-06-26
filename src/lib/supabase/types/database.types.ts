
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
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
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
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
          updated_at?: string
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
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          name: string
          description?: string
          permissions?: Json
          is_system?: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          permissions?: Json
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          permissions?: Json
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
          description?: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string
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
      events: {
        Row: {
          id: string
          title: string
          description?: string
          start_time: string
          end_time: string
          location_link?: string
          physical_location?: string
          cover_image_url?: string
          is_recurring: boolean
          recurrence_pattern?: string
          recurrence_interval?: number
          recurrence_day?: number
          recurrence_count?: number
          recurrence_end_date?: string
          parent_event_id?: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          start_time: string
          end_time: string
          location_link?: string
          physical_location?: string
          cover_image_url?: string
          is_recurring?: boolean
          recurrence_pattern?: string
          recurrence_interval?: number
          recurrence_day?: number
          recurrence_count?: number
          recurrence_end_date?: string
          parent_event_id?: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          location_link?: string
          physical_location?: string
          cover_image_url?: string
          is_recurring?: boolean
          recurrence_pattern?: string
          recurrence_interval?: number
          recurrence_day?: number
          recurrence_count?: number
          recurrence_end_date?: string
          parent_event_id?: string
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      course_access_control: {
        Row: {
          id: string
          course_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          role_id?: string
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id?: string
          event_type: string
          action: string
          resource_id?: string
          timestamp: string
          session_id?: string
          ip_address?: string
          user_agent?: string
          details?: Json
          severity?: string
        }
        Insert: {
          id?: string
          user_id?: string
          event_type: string
          action: string
          resource_id?: string
          timestamp?: string
          session_id?: string
          ip_address?: string
          user_agent?: string
          details?: Json
          severity?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          action?: string
          resource_id?: string
          timestamp?: string
          session_id?: string
          ip_address?: string
          user_agent?: string
          details?: Json
          severity?: string
        }
        Relationships: []
      }
      learning_courses: {
        Row: {
          id: string
          title: string
          description?: string
          slug: string
          cover_image_url?: string
          published: boolean
          order_index: number
          created_by?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          slug: string
          cover_image_url?: string
          published?: boolean
          order_index?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          slug?: string
          cover_image_url?: string
          published?: boolean
          order_index?: number
          created_by?: string
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
          description?: string
          order_index: number
          published: boolean
          cover_image_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string
          order_index?: number
          published?: boolean
          cover_image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string
          order_index?: number
          published?: boolean
          cover_image_url?: string
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
          description?: string
          content?: Json
          order_index: number
          published: boolean
          cover_image_url?: string
          estimated_time_minutes: number
          difficulty_level: string
          ai_assistant_enabled: boolean
          ai_assistant_id?: string
          ai_assistant_prompt?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description?: string
          content?: Json
          order_index?: number
          published?: boolean
          cover_image_url?: string
          estimated_time_minutes?: number
          difficulty_level?: string
          ai_assistant_enabled?: boolean
          ai_assistant_id?: string
          ai_assistant_prompt?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          description?: string
          content?: Json
          order_index?: number
          published?: boolean
          cover_image_url?: string
          estimated_time_minutes?: number
          difficulty_level?: string
          ai_assistant_enabled?: boolean
          ai_assistant_id?: string
          ai_assistant_prompt?: string
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
          description?: string
          url: string
          video_type: string
          video_id?: string
          thumbnail_url?: string
          duration_seconds?: number
          order_index: number
          video_file_path?: string
          video_file_name?: string
          file_size_bytes?: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description?: string
          url: string
          video_type?: string
          video_id?: string
          thumbnail_url?: string
          duration_seconds?: number
          order_index?: number
          video_file_path?: string
          video_file_name?: string
          file_size_bytes?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string
          url?: string
          video_type?: string
          video_id?: string
          thumbnail_url?: string
          duration_seconds?: number
          order_index?: number
          video_file_path?: string
          video_file_name?: string
          file_size_bytes?: number
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
          completed_at?: string
          last_position_seconds: number
          notes?: string
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
          completed_at?: string
          last_position_seconds?: number
          notes?: string
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
          completed_at?: string
          last_position_seconds?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          id: string
          lesson_id?: string
          name: string
          description?: string
          file_url: string
          file_type?: string
          file_size_bytes?: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id?: string
          name: string
          description?: string
          file_url: string
          file_type?: string
          file_size_bytes?: number
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          name?: string
          description?: string
          file_url?: string
          file_type?: string
          file_size_bytes?: number
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      learning_certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          issued_at: string
          certificate_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          issued_at?: string
          certificate_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          issued_at?: string
          certificate_url?: string
          created_at?: string
        }
        Relationships: []
      }
      learning_comments: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          content: string
          parent_id?: string
          likes_count: number
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          content: string
          parent_id?: string
          likes_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          content?: string
          parent_id?: string
          likes_count?: number
          is_hidden?: boolean
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
          is_completed: boolean
          completed_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          is_completed?: boolean
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          is_completed?: boolean
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      solutions: {
        Row: {
          id: string
          title: string
          description?: string
          category: string
          difficulty: string
          estimated_time_hours: number
          published: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          category: string
          difficulty: string
          estimated_time_hours?: number
          published?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          difficulty?: string
          estimated_time_hours?: number
          published?: boolean
          created_by?: string
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
          metrics?: Json
          certificate_template?: Json
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
          metrics?: Json
          certificate_template?: Json
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
          metrics?: Json
          certificate_template?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          id: string
          name: string
          description?: string
          category: string
          official_url?: string
          logo_url?: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          category: string
          official_url?: string
          logo_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          official_url?: string
          logo_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      implementation_checkpoints: {
        Row: {
          id: string
          solution_id?: string
          description: string
          checkpoint_order: number
          created_at: string
        }
        Insert: {
          id?: string
          solution_id?: string
          description: string
          checkpoint_order: number
          created_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
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
          name: string
          description?: string
          file_url: string
          file_type?: string
          file_size_bytes?: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          name: string
          description?: string
          file_url: string
          file_type?: string
          file_size_bytes?: number
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          name?: string
          description?: string
          file_url?: string
          file_type?: string
          file_size_bytes?: number
          order_index?: number
          created_at?: string
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
      forum_categories: {
        Row: {
          id: string
          name: string
          description?: string
          slug: string
          icon?: string
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          slug: string
          icon?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          slug?: string
          icon?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
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
          view_count: number
          reply_count: number
          is_pinned: boolean
          is_locked: boolean
          is_solved?: boolean
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
          view_count?: number
          reply_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean
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
          view_count?: number
          reply_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean
          last_activity_at?: string
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
          parent_id?: string
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
          parent_id?: string
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
          parent_id?: string
          is_solution?: boolean
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: {
          user_id?: string
        }
        Returns: boolean
      }
      can_access_course: {
        Args: {
          user_id: string
          course_id: string
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
      create_storage_public_policy: {
        Args: {
          bucket_name: string
        }
        Returns: boolean
      }
      setup_learning_storage_buckets: {
        Args: Record<PropertyKey, never>
        Returns: Json
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
