
export type Database = {
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
          role: string;
          created_at: string;
          onboarding_completed: boolean;
          onboarding_completed_at: string;
          referrals_count: number;
          successful_referrals_count: number;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string;
          avatar_url?: string;
          company_name?: string;
          industry?: string;
          role_id?: string;
          role?: string;
          created_at?: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string;
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
          onboarding_completed?: boolean;
          onboarding_completed_at?: string;
          referrals_count?: number;
          successful_referrals_count?: number;
        };
        Relationships: [];
      };
      learning_lessons: {
        Row: {
          id: string;
          title: string;
          description: string;
          content: any;
          module_id: string;
          order_index: number;
          published: boolean;
          created_at: string;
          updated_at: string;
          ai_assistant_enabled: boolean;
          ai_assistant_prompt: string;
          ai_assistant_id: string;
          estimated_time_minutes: number;
          difficulty_level: string;
          cover_image_url: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          content?: any;
          module_id: string;
          order_index?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          ai_assistant_enabled?: boolean;
          ai_assistant_prompt?: string;
          ai_assistant_id?: string;
          estimated_time_minutes?: number;
          difficulty_level?: string;
          cover_image_url?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          content?: any;
          module_id?: string;
          order_index?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          ai_assistant_enabled?: boolean;
          ai_assistant_prompt?: string;
          ai_assistant_id?: string;
          estimated_time_minutes?: number;
          difficulty_level?: string;
          cover_image_url?: string;
        };
        Relationships: [];
      };
      learning_lesson_videos: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          description: string;
          url: string;
          video_type: string;
          video_id: string;
          thumbnail_url: string;
          duration_seconds: number;
          order_index: number;
          created_at: string;
          video_file_path: string;
          video_file_name: string;
          file_size_bytes: number;
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
          order_index?: number;
          created_at?: string;
          video_file_path?: string;
          video_file_name?: string;
          file_size_bytes?: number;
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
          order_index?: number;
          created_at?: string;
          video_file_path?: string;
          video_file_name?: string;
          file_size_bytes?: number;
        };
        Relationships: [];
      };
      learning_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          order_index: number;
          published: boolean;
          created_at: string;
          updated_at: string;
          cover_image_url: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string;
          order_index?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          cover_image_url?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          order_index?: number;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          cover_image_url?: string;
        };
        Relationships: [];
      };
      learning_courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          slug: string;
          cover_image_url: string;
          published: boolean;
          order_index: number;
          created_by: string;
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
      learning_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          progress_percentage: number;
          video_progress: any;
          started_at: string;
          completed_at: string;
          last_position_seconds: number;
          updated_at: string;
          created_at: string;
          notes: string;
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
          updated_at?: string;
          created_at?: string;
          notes?: string;
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
          updated_at?: string;
          created_at?: string;
          notes?: string;
        };
        Relationships: [];
      };
      learning_resources: {
        Row: {
          id: string;
          lesson_id: string;
          name: string;
          description: string;
          file_url: string;
          file_type: string;
          file_size_bytes: number;
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
      solutions: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty: string;
          published: boolean;
          created_at: string;
          updated_at: string;
          created_by: string;
          thumbnail_url: string;
          video_url: string;
          estimated_time_minutes: number;
          implementation_guide: any;
          tools_needed: string[];
          success_metrics: any;
          prerequisites: string[];
          tags: string[];
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          category?: string;
          difficulty?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          thumbnail_url?: string;
          video_url?: string;
          estimated_time_minutes?: number;
          implementation_guide?: any;
          tools_needed?: string[];
          success_metrics?: any;
          prerequisites?: string[];
          tags?: string[];
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          difficulty?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          thumbnail_url?: string;
          video_url?: string;
          estimated_time_minutes?: number;
          implementation_guide?: any;
          tools_needed?: string[];
          success_metrics?: any;
          prerequisites?: string[];
          tags?: string[];
        };
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          solution_id: string;
          title: string;
          type: string;
          content: any;
          module_order: number;
          estimated_time_minutes: number;
          metrics: any;
          certificate_template: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          solution_id: string;
          title: string;
          type: string;
          content?: any;
          module_order: number;
          estimated_time_minutes?: number;
          metrics?: any;
          certificate_template?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          solution_id?: string;
          title?: string;
          type?: string;
          content?: any;
          module_order?: number;
          estimated_time_minutes?: number;
          metrics?: any;
          certificate_template?: any;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          solution_id: string;
          module_id: string;
          is_completed: boolean;
          completion_percentage: number;
          started_at: string;
          completed_at: string;
          created_at: string;
          updated_at: string;
          notes: string;
          time_spent_minutes: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          solution_id?: string;
          module_id?: string;
          is_completed?: boolean;
          completion_percentage?: number;
          started_at?: string;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
          notes?: string;
          time_spent_minutes?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          solution_id?: string;
          module_id?: string;
          is_completed?: boolean;
          completion_percentage?: number;
          started_at?: string;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
          notes?: string;
          time_spent_minutes?: number;
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
          course_id?: string;
          role_id?: string;
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
      user_roles: {
        Row: {
          id: string;
          name: string;
          description: string;
          permissions: any;
          is_system: boolean;
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
      permission_definitions: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string;
          category: string;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string;
          category?: string;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string;
          category?: string;
          is_system?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      implementation_checkpoints: {
        Row: {
          id: string;
          solution_id: string;
          description: string;
          checkpoint_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          solution_id?: string;
          description: string;
          checkpoint_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          solution_id?: string;
          description?: string;
          checkpoint_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          action: string;
          resource_id: string;
          details: any;
          timestamp: string;
          ip_address: string;
          user_agent: string;
          session_id: string;
          severity: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          event_type: string;
          action: string;
          resource_id?: string;
          details?: any;
          timestamp?: string;
          ip_address?: string;
          user_agent?: string;
          session_id?: string;
          severity?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          action?: string;
          resource_id?: string;
          details?: any;
          timestamp?: string;
          ip_address?: string;
          user_agent?: string;
          session_id?: string;
          severity?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_time: string;
          end_time: string;
          location_link: string;
          physical_location: string;
          cover_image_url: string;
          created_by: string;
          created_at: string;
          is_recurring: boolean;
          recurrence_pattern: string;
          recurrence_interval: number;
          recurrence_day: number;
          recurrence_count: number;
          recurrence_end_date: string;
          parent_event_id: string;
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
          created_by: string;
          created_at?: string;
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
          created_by?: string;
          created_at?: string;
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
      tools: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          logo_url: string;
          official_url: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          tags: string[];
          video_tutorials: any;
          member_benefits: any;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          category?: string;
          logo_url?: string;
          official_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
          video_tutorials?: any;
          member_benefits?: any;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          logo_url?: string;
          official_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
          video_tutorials?: any;
          member_benefits?: any;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
