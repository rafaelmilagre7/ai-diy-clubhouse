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
      invites: {
        Row: {
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          last_sent_at: string | null
          notes: string | null
          role_id: string
          send_attempts: number | null
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          email: string
          expires_at: string
          id?: string
          last_sent_at?: string | null
          notes?: string | null
          role_id: string
          send_attempts?: number | null
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          last_sent_at?: string | null
          notes?: string | null
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
          compatibility_score: number
          created_at: string
          id: string
          is_viewed: boolean
          match_reason: string | null
          match_strengths: Json | null
          matched_user_id: string
          status: string
          suggested_topics: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compatibility_score: number
          created_at?: string
          id?: string
          is_viewed?: boolean
          match_reason?: string | null
          match_strengths?: Json | null
          matched_user_id: string
          status?: string
          suggested_topics?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compatibility_score?: number
          created_at?: string
          id?: string
          is_viewed?: boolean
          match_reason?: string | null
          match_strengths?: Json | null
          matched_user_id?: string
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
      onboarding: {
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
          id: string
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
          user_id: string
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
          id?: string
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
          user_id: string
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
          id?: string
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
          user_id?: string
          week_availability?: string | null
        }
        Relationships: []
      }
      onboarding_ai_experience: {
        Row: {
          completed_formation: boolean | null
          created_at: string | null
          desired_ai_areas: string[] | null
          has_implemented: string | null
          id: string
          improvement_suggestions: string | null
          is_member_for_month: boolean | null
          knowledge_level: string | null
          nps_score: number | null
          previous_tools: string[] | null
          progress_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_formation?: boolean | null
          created_at?: string | null
          desired_ai_areas?: string[] | null
          has_implemented?: string | null
          id?: string
          improvement_suggestions?: string | null
          is_member_for_month?: boolean | null
          knowledge_level?: string | null
          nps_score?: number | null
          previous_tools?: string[] | null
          progress_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_formation?: boolean | null
          created_at?: string | null
          desired_ai_areas?: string[] | null
          has_implemented?: string | null
          id?: string
          improvement_suggestions?: string | null
          is_member_for_month?: boolean | null
          knowledge_level?: string | null
          nps_score?: number | null
          previous_tools?: string[] | null
          progress_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_ai_experience_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_profile_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_ai_experience_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_business_context: {
        Row: {
          additional_context: string | null
          business_challenges: string[] | null
          business_model: string | null
          created_at: string | null
          id: string
          important_kpis: string[] | null
          medium_term_goals: string[] | null
          progress_id: string
          short_term_goals: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_context?: string | null
          business_challenges?: string[] | null
          business_model?: string | null
          created_at?: string | null
          id?: string
          important_kpis?: string[] | null
          medium_term_goals?: string[] | null
          progress_id: string
          short_term_goals?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_context?: string | null
          business_challenges?: string[] | null
          business_model?: string | null
          created_at?: string | null
          id?: string
          important_kpis?: string[] | null
          medium_term_goals?: string[] | null
          progress_id?: string
          short_term_goals?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_business_context_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_profile_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_business_context_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_business_goals: {
        Row: {
          content_formats: string[] | null
          created_at: string | null
          expected_outcome_30days: string | null
          expected_outcomes: string[] | null
          how_implement: string | null
          id: string
          live_interest: number | null
          primary_goal: string | null
          priority_solution_type: string | null
          progress_id: string
          timeline: string | null
          updated_at: string | null
          user_id: string
          week_availability: string | null
        }
        Insert: {
          content_formats?: string[] | null
          created_at?: string | null
          expected_outcome_30days?: string | null
          expected_outcomes?: string[] | null
          how_implement?: string | null
          id?: string
          live_interest?: number | null
          primary_goal?: string | null
          priority_solution_type?: string | null
          progress_id: string
          timeline?: string | null
          updated_at?: string | null
          user_id: string
          week_availability?: string | null
        }
        Update: {
          content_formats?: string[] | null
          created_at?: string | null
          expected_outcome_30days?: string | null
          expected_outcomes?: string[] | null
          how_implement?: string | null
          id?: string
          live_interest?: number | null
          primary_goal?: string | null
          priority_solution_type?: string | null
          progress_id?: string
          timeline?: string | null
          updated_at?: string | null
          user_id?: string
          week_availability?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_business_goals_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_profile_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_business_goals_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_chat_messages: {
        Row: {
          created_at: string | null
          id: string
          is_ai: boolean
          message: string
          step_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_ai?: boolean
          message: string
          step_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_ai?: boolean
          message?: string
          step_id?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_complementary_info: {
        Row: {
          authorize_case_studies: boolean | null
          authorize_testimonials: boolean | null
          created_at: string | null
          how_discovered: string | null
          id: string
          interested_in_interviews: boolean | null
          referral_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          authorize_case_studies?: boolean | null
          authorize_testimonials?: boolean | null
          created_at?: string | null
          how_discovered?: string | null
          id?: string
          interested_in_interviews?: boolean | null
          referral_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          authorize_case_studies?: boolean | null
          authorize_testimonials?: boolean | null
          created_at?: string | null
          how_discovered?: string | null
          id?: string
          interested_in_interviews?: boolean | null
          referral_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_experience_personalization: {
        Row: {
          available_days: string[] | null
          created_at: string | null
          id: string
          interests: string[] | null
          mentorship_topics: string[] | null
          networking_availability: number | null
          progress_id: string
          skills_to_share: string[] | null
          time_preference: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_days?: string[] | null
          created_at?: string | null
          id?: string
          interests?: string[] | null
          mentorship_topics?: string[] | null
          networking_availability?: number | null
          progress_id: string
          skills_to_share?: string[] | null
          time_preference?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_days?: string[] | null
          created_at?: string | null
          id?: string
          interests?: string[] | null
          mentorship_topics?: string[] | null
          networking_availability?: number | null
          progress_id?: string
          skills_to_share?: string[] | null
          time_preference?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_experience_personalization_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_profile_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_experience_personalization_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_history: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          onboarding_id: string | null
          step_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          onboarding_id?: string | null
          step_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          onboarding_id?: string | null
          step_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_history_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "onboarding_profile_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_history_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "onboarding_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_personal_info: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          ddi: string | null
          email: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          name: string | null
          phone: string | null
          progress_id: string
          state: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          ddi?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name?: string | null
          phone?: string | null
          progress_id: string
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          ddi?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name?: string | null
          phone?: string | null
          progress_id?: string
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_personal_info_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_profile_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_personal_info_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_professional_info: {
        Row: {
          annual_revenue: string | null
          company_name: string | null
          company_sector: string | null
          company_size: string | null
          company_website: string | null
          created_at: string | null
          current_position: string | null
          id: string
          progress_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_revenue?: string | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string | null
          current_position?: string | null
          id?: string
          progress_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_revenue?: string | null
          company_name?: string | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string | null
          current_position?: string | null
          id?: string
          progress_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_professional_info_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_profile_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_professional_info_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "onboarding_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
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
          complementary_info: Json
          completed_steps: string[] | null
          created_at: string | null
          current_position: string | null
          current_step: string | null
          debug_logs: Json | null
          decision_makers: string[] | null
          experience_personalization: Json | null
          goals: string[] | null
          id: string
          implementation_preferences: Json | null
          implementation_speed: string | null
          industry_focus: Json | null
          is_completed: boolean | null
          last_error: string | null
          last_sync_at: string | null
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
          training_needs: string[] | null
          updated_at: string | null
          user_id: string
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
          complementary_info?: Json
          completed_steps?: string[] | null
          created_at?: string | null
          current_position?: string | null
          current_step?: string | null
          debug_logs?: Json | null
          decision_makers?: string[] | null
          experience_personalization?: Json | null
          goals?: string[] | null
          id?: string
          implementation_preferences?: Json | null
          implementation_speed?: string | null
          industry_focus?: Json | null
          is_completed?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
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
          training_needs?: string[] | null
          updated_at?: string | null
          user_id: string
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
          complementary_info?: Json
          completed_steps?: string[] | null
          created_at?: string | null
          current_position?: string | null
          current_step?: string | null
          debug_logs?: Json | null
          decision_makers?: string[] | null
          experience_personalization?: Json | null
          goals?: string[] | null
          id?: string
          implementation_preferences?: Json | null
          implementation_speed?: string | null
          industry_focus?: Json | null
          is_completed?: boolean | null
          last_error?: string | null
          last_sync_at?: string | null
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
          training_needs?: string[] | null
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
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          id: string
          industry: string | null
          name: string | null
          role: string
          role_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          id: string
          industry?: string | null
          name?: string | null
          role?: string
          role_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          name?: string | null
          role?: string
          role_id?: string | null
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
      solution_certificates: {
        Row: {
          certificate_data: Json | null
          created_at: string | null
          id: string
          issued_at: string | null
          solution_id: string | null
          user_id: string | null
        }
        Insert: {
          certificate_data?: Json | null
          created_at?: string | null
          id?: string
          issued_at?: string | null
          solution_id?: string | null
          user_id?: string | null
        }
        Update: {
          certificate_data?: Json | null
          created_at?: string | null
          id?: string
          issued_at?: string | null
          solution_id?: string | null
          user_id?: string | null
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
          solution_id: string | null
          tool_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          solution_id?: string | null
          tool_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          solution_id?: string | null
          tool_id?: string | null
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
          estimated_time: number | null
          id: string
          implementation_steps: Json | null
          published: boolean
          related_solutions: string[] | null
          slug: string
          success_rate: number | null
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
          estimated_time?: number | null
          id?: string
          implementation_steps?: Json | null
          published?: boolean
          related_solutions?: string[] | null
          slug: string
          success_rate?: number | null
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
          estimated_time?: number | null
          id?: string
          implementation_steps?: Json | null
          published?: boolean
          related_solutions?: string[] | null
          slug?: string
          success_rate?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      suggestion_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
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
    }
    Views: {
      network_match_view: {
        Row: {
          compatibility_score: number | null
          created_at: string | null
          id: string | null
          interests: string | null
          is_viewed: boolean | null
          match_reason: string | null
          match_strengths: Json | null
          matched_user_avatar: string | null
          matched_user_company: string | null
          matched_user_id: string | null
          matched_user_name: string | null
          matched_user_position: string | null
          skills_to_share: string | null
          status: string | null
          suggested_topics: Json | null
          updated_at: string | null
          user_avatar: string | null
          user_company: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: []
      }
      onboarding_analytics: {
        Row: {
          ai_experience: Json | null
          business_goals: Json | null
          company_name: string | null
          current_step: string | null
          email: string | null
          implementation_preferences: Json | null
          industry_focus: Json | null
          is_completed: boolean | null
          last_activity: string | null
          personal_info: Json | null
          resources_needs: Json | null
          started_at: string | null
          team_info: Json | null
          user_id: string | null
        }
        Relationships: []
      }
      onboarding_profile_view: {
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
          goals: string[] | null
          id: string | null
          implementation_preferences: Json | null
          implementation_speed: string | null
          industry_focus: Json | null
          is_completed: boolean | null
          last_error: string | null
          last_sync_at: string | null
          personal_info: Json | null
          priority_areas: string[] | null
          professional_data: Json | null
          professional_info: Json | null
          profile_avatar: string | null
          profile_company: string | null
          profile_name: string | null
          resources_needs: Json | null
          support_level: string | null
          sync_status: string | null
          target_market: string | null
          team_info: Json | null
          team_size: string | null
          tech_stack: string[] | null
          technical_expertise: string | null
          training_needs: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      onboarding_status: {
        Row: {
          tabela: string | null
          total_registros: number | null
        }
        Relationships: []
      }
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
        ]
      }
    }
    Functions: {
      can_access_benefit: {
        Args: { user_id: string; tool_id: string }
        Returns: boolean
      }
      can_access_course: {
        Args: { user_id: string; course_id: string }
        Returns: boolean
      }
      check_invite_token: {
        Args: { invite_token: string }
        Returns: Json
      }
      check_onboarding_data_consistency: {
        Args: { progress_id: string }
        Returns: Json
      }
      check_trusted_domain: {
        Args: { p_email: string }
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
      create_storage_public_policy: {
        Args: { bucket_name: string }
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
      determinerolefromemail: {
        Args: { email: string }
        Returns: string
      }
      generate_invite_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_permissions: {
        Args: { user_id: string }
        Returns: string[]
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      limpar_dados_onboarding: {
        Args: { user_id_param?: string }
        Returns: string
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
      merge_json_data: {
        Args: { target: Json; source: Json }
        Returns: Json
      }
      normalize_solution_category: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      setup_learning_storage_buckets: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      sync_profile_roles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_invite_send_attempt: {
        Args: { invite_id: string }
        Returns: undefined
      }
      use_invite: {
        Args: { invite_token: string; user_id: string }
        Returns: Json
      }
      user_has_permission: {
        Args: { user_id: string; permission_code: string }
        Returns: boolean
      }
      validateuserrole: {
        Args: { profileid: string; currentrole: string; email: string }
        Returns: string
      }
    }
    Enums: {
      difficulty_level: "beginner" | "intermediate" | "advanced"
      difficulty_level_new: "easy" | "medium" | "advanced"
      notification_type:
        | "status_change"
        | "new_comment"
        | "new_vote"
        | "comment_reply"
        | "admin_response"
      solution_category: "revenue" | "operational" | "strategic"
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
      difficulty_level: ["beginner", "intermediate", "advanced"],
      difficulty_level_new: ["easy", "medium", "advanced"],
      notification_type: [
        "status_change",
        "new_comment",
        "new_vote",
        "comment_reply",
        "admin_response",
      ],
      solution_category: ["revenue", "operational", "strategic"],
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
