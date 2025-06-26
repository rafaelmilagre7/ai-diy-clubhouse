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
          avatar_url: string
          company_name: string
          industry: string
          role_id: string
          role?: string
          created_at: string
          updated_at: string
          onboarding_completed: boolean
          onboarding_completed_at: string
          referrals_count: number
          successful_referrals_count: number
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string
          company_name?: string
          industry?: string
          role_id: string
          role?: string
          created_at?: string
          updated_at?: string
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
          updated_at?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string
          referrals_count?: number
          successful_referrals_count?: number
        }
        Relationships: []
      }
      learning_courses: {
        Row: {
          id: string
          title: string
          description: string
          slug: string
          cover_image_url: string
          published: boolean
          order_index: number
          created_by: string
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
          description: string
          order_index: number
          published: boolean
          cover_image_url: string
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
          description: string
          content: Json
          order_index: number
          published: boolean
          cover_image_url: string
          estimated_time_minutes: number
          difficulty_level: string
          ai_assistant_enabled: boolean
          ai_assistant_prompt: string
          ai_assistant_id: string
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
          ai_assistant_prompt?: string
          ai_assistant_id?: string
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
          ai_assistant_prompt?: string
          ai_assistant_id?: string
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
          description: string
          url: string
          video_type: string
          video_id: string
          thumbnail_url: string
          duration_seconds: number
          video_file_path: string
          video_file_name: string
          file_size_bytes: number
          order_index: number
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
          video_file_path?: string
          video_file_name?: string
          file_size_bytes?: number
          order_index?: number
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
          video_file_path?: string
          video_file_name?: string
          file_size_bytes?: number
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
          completed_at: string
          last_position_seconds: number
          notes: string
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
          lesson_id: string
          name: string
          description: string
          file_url: string
          file_type: string
          file_size_bytes: number
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
          certificate_url: string
          issued_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          certificate_url?: string
          issued_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          certificate_url?: string
          issued_at?: string
          created_at?: string
        }
        Relationships: []
      }
      learning_comments: {
        Row: {
          id: string
          lesson_id: string
          user_id: string
          parent_id: string
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
          parent_id?: string
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
          parent_id?: string
          content?: string
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
          current_module: number
          is_completed: boolean
          completed_at: string
          last_activity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          current_module?: number
          is_completed?: boolean
          completed_at?: string
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          current_module?: number
          is_completed?: boolean
          completed_at?: string
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      solutions: {
        Row: {
          id: string
          title: string
          category: string
          difficulty: string
          description: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          difficulty: string
          description?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          difficulty?: string
          description?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          name: string
          description: string
          permissions: Json
          is_system: boolean
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
      admin_communications: {
        Row: {
          id: string
          title: string
          content: string
          content_type: string
          template_type: string
          priority: string
          status: string
          target_roles: string[]
          delivery_channels: string[]
          scheduled_for: string | null
          sent_at: string | null
          created_by: string
          created_at: string
          updated_at: string
          email_subject: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          title: string
          content: string
          content_type?: string
          template_type?: string
          priority?: string
          status?: string
          target_roles: string[]
          delivery_channels?: string[]
          scheduled_for?: string | null
          sent_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          email_subject?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          title?: string
          content?: string
          content_type?: string
          template_type?: string
          priority?: string
          status?: string
          target_roles?: string[]
          delivery_channels?: string[]
          scheduled_for?: string | null
          sent_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          email_subject?: string | null
          metadata?: Json
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
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          severity: string | null
          timestamp: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          action: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          severity?: string | null
          timestamp?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          action?: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          severity?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      benefit_access_control: {
        Row: {
          id: string
          role_id: string
          tool_id: string
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          tool_id: string
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          tool_id?: string
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
          description: string
          slug: string
          icon: string
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
          is_solved: boolean | null
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
          is_solved?: boolean | null
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
          is_solved?: boolean | null
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
          parent_id: string
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
          parent_id?: string
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
          parent_id?: string
          content?: string
          is_solution?: boolean
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      get_user_permissions: {
        Args: { user_id: string }
        Returns: string[]
      }
      get_users_with_roles: {
        Args: { limit_count?: number; offset_count?: number; search_query?: string }
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
        Args: { user_id: string; action: string; details?: Json }
        Returns: void
      }
      create_storage_public_policy: {
        Args: { bucket_name: string }
        Returns: boolean
      }
      increment_topic_replies: {
        Args: { topic_id: string }
        Returns: void
      }
      increment_topic_views: {
        Args: { topic_id: string }
        Returns: void
      }
      delete_forum_topic: {
        Args: { topic_id: string }
        Returns: void
      }
      delete_forum_post: {
        Args: { post_id: string }
        Returns: void
      }
      call_supabase_rpc: {
        Args: { function_name: string; params?: Json }
        Returns: Json
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
