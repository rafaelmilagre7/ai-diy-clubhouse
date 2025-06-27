
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string;
          company_name: string;
          industry: string;
          role_id: string;
          role?: string;
          created_at: string;
          updated_at: string;
          onboarding_completed: boolean;
          onboarding_completed_at: string | null;
          referrals_count: number;
          successful_referrals_count: number;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          avatar_url?: string;
          company_name?: string;
          industry?: string;
          role_id?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          referrals_count?: number;
          successful_referrals_count?: number;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          company_name?: string;
          industry?: string;
          role_id?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          referrals_count?: number;
          successful_referrals_count?: number;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          name: string;
          description?: string;
          permissions?: any;
          is_system?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          permissions?: any;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          permissions?: any;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description?: string;
          start_time: string;
          end_time: string;
          location_link?: string;
          physical_location?: string;
          cover_image_url?: string;
          created_at: string;
          created_by: string;
          is_recurring?: boolean;
          recurrence_pattern?: string;
          recurrence_interval?: number;
          recurrence_day?: number;
          recurrence_count?: number;
          recurrence_end_date?: string;
          parent_event_id?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          start_time: string;
          end_time: string;
          location_link?: string;
          physical_location?: string;
          cover_image_url?: string;
          created_at?: string;
          created_by: string;
          is_recurring?: boolean;
          recurrence_pattern?: string;
          recurrence_interval?: number;
          recurrence_day?: number;
          recurrence_count?: number;
          recurrence_end_date?: string;
          parent_event_id?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_time?: string;
          end_time?: string;
          location_link?: string;
          physical_location?: string;
          cover_image_url?: string;
          created_at?: string;
          created_by?: string;
          is_recurring?: boolean;
          recurrence_pattern?: string;
          recurrence_interval?: number;
          recurrence_day?: number;
          recurrence_count?: number;
          recurrence_end_date?: string;
          parent_event_id?: string;
        };
        Relationships: [];
      };
      event_access_control: {
        Row: {
          id: string;
          event_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          role_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      course_access_control: {
        Row: {
          id: string;
          course_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          role_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      benefit_access_control: {
        Row: {
          id: string;
          tool_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tool_id?: string;
          role_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      permission_definitions: {
        Row: {
          id: string;
          code: string;
          name: string;
          description?: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          granted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          permission_id: string;
          granted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          permission_id?: string;
          granted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id?: string;
          event_type: string;
          action: string;
          resource_id?: string;
          timestamp: string;
          ip_address?: string;
          user_agent?: string;
          session_id?: string;
          details?: any;
          severity?: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          event_type: string;
          action: string;
          resource_id?: string;
          timestamp?: string;
          ip_address?: string;
          user_agent?: string;
          session_id?: string;
          details?: any;
          severity?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          action?: string;
          resource_id?: string;
          timestamp?: string;
          ip_address?: string;
          user_agent?: string;
          session_id?: string;
          details?: any;
          severity?: string;
        };
        Relationships: [];
      };
      learning_courses: {
        Row: {
          id: string;
          title: string;
          description?: string;
          slug: string;
          cover_image_url?: string;
          published: boolean;
          order_index: number;
          created_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          slug: string;
          cover_image_url?: string;
          published?: boolean;
          order_index?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          slug?: string;
          cover_image_url?: string;
          published?: boolean;
          order_index?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description?: string;
          order_index: number;
          cover_image_url?: string;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string;
          order_index?: number;
          cover_image_url?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          order_index?: number;
          cover_image_url?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          description?: string;
          content?: any;
          order_index: number;
          cover_image_url?: string;
          published: boolean;
          difficulty_level?: string;
          estimated_time_minutes?: number;
          ai_assistant_enabled?: boolean;
          ai_assistant_prompt?: string;
          ai_assistant_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          description?: string;
          content?: any;
          order_index?: number;
          cover_image_url?: string;
          published?: boolean;
          difficulty_level?: string;
          estimated_time_minutes?: number;
          ai_assistant_enabled?: boolean;
          ai_assistant_prompt?: string;
          ai_assistant_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          description?: string;
          content?: any;
          order_index?: number;
          cover_image_url?: string;
          published?: boolean;
          difficulty_level?: string;
          estimated_time_minutes?: number;
          ai_assistant_enabled?: boolean;
          ai_assistant_prompt?: string;
          ai_assistant_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_lesson_videos: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          description?: string;
          url: string;
          video_type?: string;
          video_id?: string;
          thumbnail_url?: string;
          duration_seconds?: number;
          video_file_path?: string;
          video_file_name?: string;
          file_size_bytes?: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          description?: string;
          url: string;
          video_type?: string;
          video_id?: string;
          thumbnail_url?: string;
          duration_seconds?: number;
          video_file_path?: string;
          video_file_name?: string;
          file_size_bytes?: number;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          title?: string;
          description?: string;
          url?: string;
          video_type?: string;
          video_id?: string;
          thumbnail_url?: string;
          duration_seconds?: number;
          video_file_path?: string;
          video_file_name?: string;
          file_size_bytes?: number;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          progress_percentage: number;
          video_progress?: any;
          started_at: string;
          completed_at?: string;
          last_position_seconds?: number;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          progress_percentage?: number;
          video_progress?: any;
          started_at?: string;
          completed_at?: string;
          last_position_seconds?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          progress_percentage?: number;
          video_progress?: any;
          started_at?: string;
          completed_at?: string;
          last_position_seconds?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_resources: {
        Row: {
          id: string;
          lesson_id?: string;
          name: string;
          description?: string;
          file_url: string;
          file_type?: string;
          file_size_bytes?: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id?: string;
          name: string;
          description?: string;
          file_url: string;
          file_type?: string;
          file_size_bytes?: number;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          name?: string;
          description?: string;
          file_url?: string;
          file_type?: string;
          file_size_bytes?: number;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          certificate_url?: string;
          issued_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          certificate_url?: string;
          issued_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          certificate_url?: string;
          issued_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_comments: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          parent_id?: string;
          content: string;
          likes_count: number;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          parent_id?: string;
          content: string;
          likes_count?: number;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          parent_id?: string;
          content?: string;
          likes_count?: number;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_lesson_nps: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          score: number;
          feedback?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          score: number;
          feedback?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          score?: number;
          feedback?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      onboarding_analytics: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          event_data?: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          event_data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          event_data?: any;
          created_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          email_enabled: boolean;
          whatsapp_enabled: boolean;
          admin_communications_inapp?: boolean;
          admin_communications_email?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_enabled?: boolean;
          whatsapp_enabled?: boolean;
          admin_communications_inapp?: boolean;
          admin_communications_email?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_enabled?: boolean;
          whatsapp_enabled?: boolean;
          admin_communications_inapp?: boolean;
          admin_communications_email?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      onboarding_sync: {
        Row: {
          id: string;
          user_id: string;
          sync_data: any;
          sync_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sync_data?: any;
          sync_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sync_data?: any;
          sync_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quick_onboarding: {
        Row: {
          id: string;
          user_id: string;
          onboarding_data: any;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          onboarding_data?: any;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          onboarding_data?: any;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      create_storage_public_policy: {
        Args: { bucket_name: string };
        Returns: boolean;
      };
      increment_topic_replies: {
        Args: { topic_id: string };
        Returns: void;
      };
      complete_invite_registration: {
        Args: { invite_token: string; user_data: any };
        Returns: any;
      };
      audit_role_assignments: {
        Args: { user_id: string; action: string; details?: any };
        Returns: { id: string; user_id: string; old_role: string; new_role: string; changed_by: string; changed_at: string; reason: string }[];
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}
