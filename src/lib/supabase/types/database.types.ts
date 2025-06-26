
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
          onboarding_completed: boolean
          onboarding_completed_at: string
          referrals_count: number
          successful_referrals_count: number
          updated_at: string
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
          description: string | null
          permissions: Json
          is_system: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: Json
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
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
          description: string | null
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          category?: string
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
          created_at: string
          created_by: string
          is_recurring: boolean
          recurrence_pattern: string | null
          recurrence_interval: number | null
          recurrence_day: number | null
          recurrence_count: number | null
          recurrence_end_date: string | null
          parent_event_id: string | null
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
          created_at?: string
          created_by: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          recurrence_interval?: number | null
          recurrence_day?: number | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          parent_event_id?: string | null
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
          created_at?: string
          created_by?: string
          is_recurring?: boolean
          recurrence_pattern?: string | null
          recurrence_interval?: number | null
          recurrence_day?: number | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          parent_event_id?: string | null
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
          cover_image_url: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index?: number
          cover_image_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          cover_image_url?: string | null
          published?: boolean
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
          cover_image_url: string | null
          published: boolean
          estimated_time_minutes: number
          difficulty_level: string
          ai_assistant_enabled: boolean
          ai_assistant_prompt: string | null
          ai_assistant_id: string | null
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
          cover_image_url?: string | null
          published?: boolean
          estimated_time_minutes?: number
          difficulty_level?: string
          ai_assistant_enabled?: boolean
          ai_assistant_prompt?: string | null
          ai_assistant_id?: string | null
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
          cover_image_url?: string | null
          published?: boolean
          estimated_time_minutes?: number
          difficulty_level?: string
          ai_assistant_enabled?: boolean
          ai_assistant_prompt?: string | null
          ai_assistant_id?: string | null
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
          video_type?: string
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
          video_type?: string
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
      learning_certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          certificate_url: string | null
          issued_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          certificate_url?: string | null
          issued_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          certificate_url?: string | null
          issued_at?: string
          created_at?: string
        }
        Relationships: []
      }
      learning_comments: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          parent_id: string | null
          content: string
          likes_count: number
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          parent_id?: string | null
          content: string
          likes_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          parent_id?: string | null
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
          module_id: string | null
          is_completed: boolean
          completed_at: string | null
          progress_data: Json
          last_activity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          module_id?: string | null
          is_completed?: boolean
          completed_at?: string | null
          progress_data?: Json
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          module_id?: string | null
          is_completed?: boolean
          completed_at?: string | null
          progress_data?: Json
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
          description: string
          category: string
          difficulty: string
          estimated_time_minutes: number
          cover_image_url: string | null
          is_published: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          difficulty: string
          estimated_time_minutes?: number
          cover_image_url?: string | null
          is_published?: boolean
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
          estimated_time_minutes?: number
          cover_image_url?: string | null
          is_published?: boolean
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
          metrics: Json
          certificate_template: Json
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
          description: string
          category: string
          logo_url: string | null
          official_url: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          logo_url?: string | null
          official_url: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          logo_url?: string | null
          official_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
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
          name: string
          description: string | null
          file_url: string
          file_type: string
          file_size_bytes: number | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          name: string
          description?: string | null
          file_url: string
          file_type: string
          file_size_bytes?: number | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          name?: string
          description?: string | null
          file_url?: string
          file_type?: string
          file_size_bytes?: number | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
