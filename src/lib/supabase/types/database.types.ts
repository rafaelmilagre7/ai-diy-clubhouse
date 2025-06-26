
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
        }
        Insert: {
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
          is_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          category?: string
          is_system?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          category?: string
          is_system?: boolean
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
          estimated_time_minutes: number
          difficulty_level: string
          published: boolean
          cover_image_url: string | null
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
          estimated_time_minutes?: number
          difficulty_level?: string
          published?: boolean
          cover_image_url?: string | null
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
          estimated_time_minutes?: number
          difficulty_level?: string
          published?: boolean
          cover_image_url?: string | null
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
      learning_lesson_tools: {
        Row: {
          id: string
          lesson_id: string
          tool_id: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          tool_id: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          tool_id?: string
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
      learning_comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          created_at?: string
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
      solutions: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          difficulty_level: string
          estimated_time_hours: number
          cover_image_url: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          difficulty_level?: string
          estimated_time_hours?: number
          cover_image_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          difficulty_level?: string
          estimated_time_hours?: number
          cover_image_url?: string | null
          is_featured?: boolean
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
          current_module_id: string | null
          progress_percentage: number
          is_completed: boolean
          completed_at: string | null
          started_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          current_module_id?: string | null
          progress_percentage?: number
          is_completed?: boolean
          completed_at?: string | null
          started_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          current_module_id?: string | null
          progress_percentage?: number
          is_completed?: boolean
          completed_at?: string | null
          started_at?: string
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
          file_size_bytes: number | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          description?: string | null
          file_url: string
          file_type: string
          file_size_bytes?: number | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          description?: string | null
          file_url?: string
          file_type?: string
          file_size_bytes?: number | null
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
      user_checklists: {
        Row: {
          id: string
          user_id: string
          checkpoint_id: string
          is_completed: boolean
          completed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          checkpoint_id: string
          is_completed?: boolean
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          checkpoint_id?: string
          is_completed?: boolean
          completed_at?: string | null
          notes?: string | null
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
          category: string
          subcategory: string | null
          link: string
          pricing_model: string | null
          logo_url: string | null
          screenshots: string[] | null
          tags: string[] | null
          rating: number | null
          reviews_count: number
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          subcategory?: string | null
          link: string
          pricing_model?: string | null
          logo_url?: string | null
          screenshots?: string[] | null
          tags?: string[] | null
          rating?: number | null
          reviews_count?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          subcategory?: string | null
          link?: string
          pricing_model?: string | null
          logo_url?: string | null
          screenshots?: string[] | null
          tags?: string[] | null
          rating?: number | null
          reviews_count?: number
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
      forum_mentions: {
        Row: {
          id: string
          post_id: string
          mentioned_user_id: string
          mentioned_by_user_id: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          mentioned_user_id: string
          mentioned_by_user_id: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          mentioned_user_id?: string
          mentioned_by_user_id?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      forum_notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          topic_id: string | null
          post_id: string | null
          triggered_by_user_id: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          topic_id?: string | null
          post_id?: string | null
          triggered_by_user_id: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          topic_id?: string | null
          post_id?: string | null
          triggered_by_user_id?: string
          is_read?: boolean
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
          last_sent_at: string | null
          send_attempts: number
          notes: string | null
          preferred_channel: string
          whatsapp_number: string | null
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
          last_sent_at?: string | null
          send_attempts?: number
          notes?: string | null
          preferred_channel?: string
          whatsapp_number?: string | null
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
          last_sent_at?: string | null
          send_attempts?: number
          notes?: string | null
          preferred_channel?: string
          whatsapp_number?: string | null
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
          opened_count: number
          clicked_count: number
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
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
          opened_count?: number
          clicked_count?: number
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
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
          opened_count?: number
          clicked_count?: number
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          conversion_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invite_campaigns: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          target_role_id: string | null
          email_template: string
          whatsapp_template: string | null
          channels: string[]
          follow_up_rules: Json | null
          segmentation: Json | null
          scheduled_for: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          target_role_id?: string | null
          email_template: string
          whatsapp_template?: string | null
          channels?: string[]
          follow_up_rules?: Json | null
          segmentation?: Json | null
          scheduled_for?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          target_role_id?: string | null
          email_template?: string
          whatsapp_template?: string | null
          channels?: string[]
          follow_up_rules?: Json | null
          segmentation?: Json | null
          scheduled_for?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invite_backups: {
        Row: {
          id: string
          original_invite_id: string | null
          email: string
          backup_data: Json
          backup_reason: string
          created_at: string
        }
        Insert: {
          id?: string
          original_invite_id?: string | null
          email: string
          backup_data: Json
          backup_reason: string
          created_at?: string
        }
        Update: {
          id?: string
          original_invite_id?: string | null
          email?: string
          backup_data?: Json
          backup_reason?: string
          created_at?: string
        }
        Relationships: []
      }
      invite_analytics_events: {
        Row: {
          id: string
          invite_id: string
          event_type: string
          channel: string
          provider_id: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          invite_id: string
          event_type: string
          channel: string
          provider_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          invite_id?: string
          event_type?: string
          channel?: string
          provider_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      community_reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          topic_id: string | null
          post_id: string | null
          report_type: string
          reason: string
          description: string | null
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
          resolution_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id?: string | null
          topic_id?: string | null
          post_id?: string | null
          report_type: string
          reason: string
          description?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string | null
          topic_id?: string | null
          post_id?: string | null
          report_type?: string
          reason?: string
          description?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          content: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          participant_1_id: string
          participant_2_id: string
          last_message_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_1_id: string
          participant_2_id: string
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_1_id?: string
          participant_2_id?: string
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      member_connections: {
        Row: {
          id: string
          requester_id: string
          recipient_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          recipient_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          recipient_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      network_connections: {
        Row: {
          id: string
          requester_id: string
          recipient_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          recipient_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          recipient_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      network_matches: {
        Row: {
          id: string
          user_id: string
          matched_user_id: string
          compatibility_score: number
          match_type: string
          match_reason: string | null
          match_strengths: Json | null
          suggested_topics: Json | null
          ai_analysis: Json | null
          status: string
          is_viewed: boolean
          month_year: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          matched_user_id: string
          compatibility_score: number
          match_type?: string
          match_reason?: string | null
          match_strengths?: Json | null
          suggested_topics?: Json | null
          ai_analysis?: Json | null
          status?: string
          is_viewed?: boolean
          month_year?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          matched_user_id?: string
          compatibility_score?: number
          match_type?: string
          match_reason?: string | null
          match_strengths?: Json | null
          suggested_topics?: Json | null
          ai_analysis?: Json | null
          status?: string
          is_viewed?: boolean
          month_year?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      networking_preferences: {
        Row: {
          user_id: string
          is_active: boolean
          preferred_connections_per_week: number
          min_compatibility: number
          looking_for: Json | null
          exclude_sectors: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          is_active?: boolean
          preferred_connections_per_week?: number
          min_compatibility?: number
          looking_for?: Json | null
          exclude_sectors?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          is_active?: boolean
          preferred_connections_per_week?: number
          min_compatibility?: number
          looking_for?: Json | null
          exclude_sectors?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      connection_notifications: {
        Row: {
          id: string
          user_id: string
          sender_id: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sender_id: string
          type: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sender_id?: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      connection_recommendations: {
        Row: {
          id: string
          user_id: string
          recommended_user_id: string
          reason: string | null
          score: number
          is_dismissed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recommended_user_id: string
          reason?: string | null
          score?: number
          is_dismissed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recommended_user_id?: string
          reason?: string | null
          score?: number
          is_dismissed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          id: string
          moderator_id: string
          target_user_id: string | null
          topic_id: string | null
          post_id: string | null
          action_type: string
          reason: string
          duration_hours: number | null
          expires_at: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          moderator_id: string
          target_user_id?: string | null
          topic_id?: string | null
          post_id?: string | null
          action_type: string
          reason: string
          duration_hours?: number | null
          expires_at?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          moderator_id?: string
          target_user_id?: string | null
          topic_id?: string | null
          post_id?: string | null
          action_type?: string
          reason?: string
          duration_hours?: number | null
          expires_at?: string | null
          details?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      moderation_settings: {
        Row: {
          id: string
          auto_moderation_enabled: boolean
          spam_detection_enabled: boolean
          profanity_filter_enabled: boolean
          new_user_moderation: boolean
          max_warnings_before_suspension: number
          default_suspension_hours: number
          settings: Json | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          auto_moderation_enabled?: boolean
          spam_detection_enabled?: boolean
          profanity_filter_enabled?: boolean
          new_user_moderation?: boolean
          max_warnings_before_suspension?: number
          default_suspension_hours?: number
          settings?: Json | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          auto_moderation_enabled?: boolean
          spam_detection_enabled?: boolean
          profanity_filter_enabled?: boolean
          new_user_moderation?: boolean
          max_warnings_before_suspension?: number
          default_suspension_hours?: number
          settings?: Json | null
          updated_by?: string | null
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
          delivery_channels: string[]
          target_roles: string[]
          email_subject: string | null
          scheduled_for: string | null
          sent_at: string | null
          metadata: Json | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          content_type?: string
          template_type?: string
          priority?: string
          status?: string
          delivery_channels?: string[]
          target_roles?: string[]
          email_subject?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          metadata?: Json | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          content_type?: string
          template_type?: string
          priority?: string
          status?: string
          delivery_channels?: string[]
          target_roles?: string[]
          email_subject?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          metadata?: Json | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      communication_deliveries: {
        Row: {
          id: string
          communication_id: string
          user_id: string
          delivery_channel: string
          status: string
          error_message: string | null
          metadata: Json | null
          delivered_at: string
          opened_at: string | null
          clicked_at: string | null
        }
        Insert: {
          id?: string
          communication_id: string
          user_id: string
          delivery_channel: string
          status?: string
          error_message?: string | null
          metadata?: Json | null
          delivered_at?: string
          opened_at?: string | null
          clicked_at?: string | null
        }
        Update: {
          id?: string
          communication_id?: string
          user_id?: string
          delivery_channel?: string
          status?: string
          error_message?: string | null
          metadata?: Json | null
          delivered_at?: string
          opened_at?: string | null
          clicked_at?: string | null
        }
        Relationships: []
      }
      communication_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          whatsapp_enabled: boolean
          whatsapp_number: string | null
          preferred_channel: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          whatsapp_number?: string | null
          preferred_channel?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          whatsapp_number?: string | null
          preferred_channel?: string
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
      notification_queue: {
        Row: {
          id: string
          user_id: string
          status: string
          priority: number
          scheduled_for: string
          sent_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          priority?: number
          scheduled_for?: string
          sent_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          priority?: number
          scheduled_for?: string
          sent_at?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      implementation_profiles: {
        Row: {
          id: string
          user_id: string | null
          name: string | null
          email: string | null
          phone: string | null
          phone_country_code: string
          instagram: string | null
          linkedin: string | null
          country: string | null
          state: string | null
          city: string | null
          company_name: string | null
          company_website: string | null
          current_position: string | null
          company_sector: string | null
          company_size: string | null
          annual_revenue: string | null
          primary_goal: string | null
          business_challenges: string[] | null
          ai_knowledge_level: number | null
          weekly_availability: string | null
          networking_interests: string[] | null
          nps_score: number | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name?: string | null
          email?: string | null
          phone?: string | null
          phone_country_code?: string
          instagram?: string | null
          linkedin?: string | null
          country?: string | null
          state?: string | null
          city?: string | null
          company_name?: string | null
          company_website?: string | null
          current_position?: string | null
          company_sector?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          primary_goal?: string | null
          business_challenges?: string[] | null
          ai_knowledge_level?: number | null
          weekly_availability?: string | null
          networking_interests?: string[] | null
          nps_score?: number | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string | null
          email?: string | null
          phone?: string | null
          phone_country_code?: string
          instagram?: string | null
          linkedin?: string | null
          country?: string | null
          state?: string | null
          city?: string | null
          company_name?: string | null
          company_website?: string | null
          current_position?: string | null
          company_sector?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          primary_goal?: string | null
          business_challenges?: string[] | null
          ai_knowledge_level?: number | null
          weekly_availability?: string | null
          networking_interests?: string[] | null
          nps_score?: number | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      implementation_trails: {
        Row: {
          id: string
          user_id: string
          status: string
          trail_data: Json
          generation_attempts: number
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          trail_data?: Json
          generation_attempts?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          trail_data?: Json
          generation_attempts?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      automated_interventions: {
        Row: {
          id: string
          user_id: string
          intervention_type: string
          trigger_condition: string
          action_taken: string
          status: string
          scheduled_for: string | null
          executed_at: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          intervention_type: string
          trigger_condition: string
          action_taken: string
          status?: string
          scheduled_for?: string | null
          executed_at?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          intervention_type?: string
          trigger_condition?: string
          action_taken?: string
          status?: string
          scheduled_for?: string | null
          executed_at?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          id: string
          name: string
          description: string | null
          rule_type: string
          conditions: Json
          actions: Json
          is_active: boolean
          priority: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          rule_type: string
          conditions: Json
          actions: Json
          is_active?: boolean
          priority?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          rule_type?: string
          conditions?: Json
          actions?: Json
          is_active?: boolean
          priority?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          image_url?: string
          created_at?: string
        }
        Relationships: []
      }
      benefit_clicks: {
        Row: {
          id: string
          user_id: string
          tool_id: string
          benefit_link: string
          clicked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_id: string
          benefit_link: string
          clicked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_id?: string
          benefit_link?: string
          clicked_at?: string
        }
        Relationships: []
      }
      campaign_invites: {
        Row: {
          id: string
          campaign_id: string
          invite_id: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          invite_id: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          invite_id?: string
          created_at?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          id: string
          email: string
          subject: string
          html_content: string
          status: string
          priority: number
          attempts: number
          external_id: string | null
          last_error: string | null
          invite_id: string | null
          created_at: string
          retry_after: string
          last_attempt_at: string | null
          sent_at: string | null
          failed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          subject: string
          html_content: string
          status?: string
          priority?: number
          attempts?: number
          external_id?: string | null
          last_error?: string | null
          invite_id?: string | null
          created_at?: string
          retry_after?: string
          last_attempt_at?: string | null
          sent_at?: string | null
          failed_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          subject?: string
          html_content?: string
          status?: string
          priority?: number
          attempts?: number
          external_id?: string | null
          last_error?: string | null
          invite_id?: string | null
          created_at?: string
          retry_after?: string
          last_attempt_at?: string | null
          sent_at?: string | null
          failed_at?: string | null
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
    }
    Views: {}
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
      increment_topic_views: {
        Args: {
          topic_id: string
        }
        Returns: void
      }
      increment_topic_replies: {
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
    }
    Enums: {}
    CompositeTypes: {}
  }
}
