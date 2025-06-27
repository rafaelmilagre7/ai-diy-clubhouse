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
          onboarding_completed_at: string | null
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
          role_id?: string
          role?: string
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
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
          onboarding_completed_at?: string | null
          referrals_count?: number
          successful_referrals_count?: number
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
      progress: {
        Row: {
          id: string
          user_id: string
          solution_id: string
          is_completed: boolean
          current_module: number
          completed_modules: number[]
          created_at: string
          updated_at: string
          last_activity: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          is_completed?: boolean
          current_module?: number
          completed_modules?: number[]
          created_at?: string
          updated_at?: string
          last_activity?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          is_completed?: boolean
          current_module?: number
          completed_modules?: number[]
          created_at?: string
          updated_at?: string
          last_activity?: string
          completed_at?: string | null
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
          published: boolean
          thumbnail_url: string | null
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          difficulty: string
          published?: boolean
          thumbnail_url?: string | null
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          difficulty?: string
          published?: boolean
          thumbnail_url?: string | null
          slug?: string
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
          created_at: string
          updated_at: string
          estimated_time_minutes: number
          metrics: Json | null
          certificate_template: Json | null
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          type: string
          content: Json
          module_order: number
          created_at?: string
          updated_at?: string
          estimated_time_minutes?: number
          metrics?: Json | null
          certificate_template?: Json | null
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          type?: string
          content?: Json
          module_order?: number
          created_at?: string
          updated_at?: string
          estimated_time_minutes?: number
          metrics?: Json | null
          certificate_template?: Json | null
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
          has_member_benefit: boolean
          benefit_link: string | null
          tags: string[] | null
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
          has_member_benefit?: boolean
          benefit_link?: string | null
          tags?: string[] | null
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
          has_member_benefit?: boolean
          benefit_link?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
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
          timestamp: string
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
          timestamp?: string
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
          timestamp?: string
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
          order_index: number
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
          order_index: number
          cover_image_url?: string | null
          published?: boolean
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
          cover_image_url?: string | null
          published?: boolean
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
          order_index: number
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
          updated_at: string
          created_at: string
          notes: string | null
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
          updated_at?: string
          created_at?: string
          notes?: string | null
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
          updated_at?: string
          created_at?: string
          notes?: string | null
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
          order_index: number
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
          user_id: string
          lesson_id: string
          content: string
          parent_id: string | null
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
          parent_id?: string | null
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
          parent_id?: string | null
          likes_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_lesson_nps: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          score: number
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          score: number
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          score?: number
          feedback?: string | null
          created_at?: string
          updated_at?: string
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
          timestamp: string
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
          timestamp?: string
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
          timestamp?: string
        }
        Relationships: []
      }
      onboarding_analytics: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: Json | null
          created_at: string
          solution_id: string | null
          module_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_data?: Json | null
          created_at?: string
          solution_id?: string | null
          module_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_data?: Json | null
          created_at?: string
          solution_id?: string | null
          module_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          whatsapp_enabled: boolean
          admin_communications_inapp: boolean
          admin_communications_email: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          admin_communications_inapp?: boolean
          admin_communications_email?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          admin_communications_inapp?: boolean
          admin_communications_email?: boolean
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
          last_sync_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sync_data: Json
          last_sync_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sync_data?: Json
          last_sync_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quick_onboarding: {
        Row: {
          id: string
          user_id: string
          data: Json
          step: number
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: Json
          step?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: Json
          step?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
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
          notes: string | null
          whatsapp_number: string | null
          preferred_channel: string
          send_attempts: number
          last_sent_at: string | null
          created_at: string
          expires_at: string
          used_at: string | null
        }
        Insert: {
          id?: string
          email: string
          role_id: string
          token: string
          created_by: string
          notes?: string | null
          whatsapp_number?: string | null
          preferred_channel?: string
          send_attempts?: number
          last_sent_at?: string | null
          created_at?: string
          expires_at: string
          used_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          role_id?: string
          token?: string
          created_by?: string
          notes?: string | null
          whatsapp_number?: string | null
          preferred_channel?: string
          send_attempts?: number
          last_sent_at?: string | null
          created_at?: string
          expires_at?: string
          used_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
        Returns: undefined
      }
      complete_invite_registration: {
        Args: {
          invite_token: string
          user_data: Json
        }
        Returns: Json
      }
      audit_role_assignments: {
        Args: {
          user_id: string
          action: string
          details?: Json
        }
        Returns: {
          id: string
          user_id: string
          old_role: string
          new_role: string
          changed_by: string
          changed_at: string
          reason: string
        }[]
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
