
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
          phone?: string
          company?: string
          position?: string
          experience_level?: string
          main_objective?: string
          updated_at: string
        }
        Insert: {
          id?: never
          email: string
          name?: string
          avatar_url?: string
          company_name?: string
          industry?: string
          role_id?: string
          role?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string
          referrals_count?: number
          successful_referrals_count?: number
          phone?: string
          company?: string
          position?: string
          experience_level?: string
          main_objective?: string
          updated_at?: string
        }
        Update: {
          email?: string
          name?: string
          avatar_url?: string
          company_name?: string
          industry?: string
          role_id?: string
          role?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string
          referrals_count?: number
          successful_referrals_count?: number
          phone?: string
          company?: string
          position?: string
          experience_level?: string
          main_objective?: string
          updated_at?: string
        }
        Relationships: []
      }
      // Learning Management System tables
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
          title?: string
          description?: string
          slug?: string
          cover_image_url?: string
          published?: boolean
          order_index?: number
          created_by?: string
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
          cover_image_url: string
          published: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string
          cover_image_url?: string
          published?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          title?: string
          description?: string
          cover_image_url?: string
          published?: boolean
          order_index?: number
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
          cover_image_url: string
          published: boolean
          order_index: number
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
          cover_image_url?: string
          published?: boolean
          order_index?: number
          estimated_time_minutes?: number
          difficulty_level?: string
          ai_assistant_enabled?: boolean
          ai_assistant_prompt?: string
          ai_assistant_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          module_id?: string
          title?: string
          description?: string
          content?: Json
          cover_image_url?: string
          published?: boolean
          order_index?: number
          estimated_time_minutes?: number
          difficulty_level?: string
          ai_assistant_enabled?: boolean
          ai_assistant_prompt?: string
          ai_assistant_id?: string
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
          order_index: number
          video_file_path: string
          video_file_name: string
          file_size_bytes: number
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
          progress_percentage?: number
          video_progress?: Json
          completed_at?: string
          last_position_seconds?: number
          notes?: string
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
          lesson_id?: string
          name?: string
          description?: string
          file_url?: string
          file_type?: string
          file_size_bytes?: number
          order_index?: number
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
          certificate_url?: string
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
          content?: string
          likes_count?: number
          is_hidden?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      // Solution related tables
      solutions: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          difficulty_level: string
          estimated_time: string
          tags: string[]
          featured: boolean
          published: boolean
          created_by: string
          created_at: string
          updated_at: string
          cover_image_url: string
          slug: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          category: string
          difficulty_level?: string
          estimated_time?: string
          tags?: string[]
          featured?: boolean
          published?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
          cover_image_url?: string
          slug?: string
        }
        Update: {
          title?: string
          description?: string
          category?: string
          difficulty_level?: string
          estimated_time?: string
          tags?: string[]
          featured?: boolean
          published?: boolean
          updated_at?: string
          cover_image_url?: string
          slug?: string
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
          content?: Json
          module_order: number
          estimated_time_minutes?: number
          metrics?: Json
          certificate_template?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          type?: string
          content?: Json
          module_order?: number
          estimated_time_minutes?: number
          metrics?: Json
          certificate_template?: Json
          updated_at?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          id: string
          user_id: string
          solution_id: string
          module_id: string
          is_completed: boolean
          completion_percentage: number
          started_at: string
          completed_at: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id?: string
          module_id?: string
          is_completed?: boolean
          completion_percentage?: number
          started_at?: string
          completed_at?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          is_completed?: boolean
          completion_percentage?: number
          completed_at?: string
          notes?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_checklists: {
        Row: {
          id: string
          user_id: string
          solution_id: string
          checklist_data: Json
          completion_status: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          checklist_data?: Json
          completion_status?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          checklist_data?: Json
          completion_status?: Json
          updated_at?: string
        }
        Relationships: []
      }
      solution_resources: {
        Row: {
          id: string
          solution_id: string
          title: string
          description: string
          resource_type: string
          url: string
          file_path: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          description?: string
          resource_type: string
          url?: string
          file_path?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          resource_type?: string
          url?: string
          file_path?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      solution_tools: {
        Row: {
          id: string
          tool_id: string
          solution_id: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          tool_id: string
          solution_id: string
          order_index?: number
          created_at?: string
        }
        Update: {
          order_index?: number
        }
        Relationships: []
      }
      implementation_checkpoints: {
        Row: {
          id: string
          solution_id: string
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
          description?: string
          checkpoint_order?: number
        }
        Relationships: []
      }
      // Tool related tables
      tools: {
        Row: {
          id: string
          name: string
          description: string
          category_id: string
          logo_url: string
          website_url: string
          pricing_info: Json
          features: string[]
          tags: string[]
          rating: number
          review_count: number
          is_featured: boolean
          is_active: boolean
          affiliate_link: string
          tutorial_video_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          category_id?: string
          logo_url?: string
          website_url?: string
          pricing_info?: Json
          features?: string[]
          tags?: string[]
          rating?: number
          review_count?: number
          is_featured?: boolean
          is_active?: boolean
          affiliate_link?: string
          tutorial_video_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          category_id?: string
          logo_url?: string
          website_url?: string
          pricing_info?: Json
          features?: string[]
          tags?: string[]
          rating?: number
          review_count?: number
          is_featured?: boolean
          is_active?: boolean
          affiliate_link?: string
          tutorial_video_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      tool_categories: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          order_index: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          icon?: string
          color?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          icon?: string
          color?: string
          order_index?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      // Forum related tables
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
          name?: string
          description?: string
          slug?: string
          icon?: string
          order_index?: number
          is_active?: boolean
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
          is_pinned: boolean
          is_locked: boolean
          is_solved: boolean
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
          is_solved?: boolean
          view_count?: number
          reply_count?: number
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean
          view_count?: number
          reply_count?: number
          last_activity_at?: string
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
          content?: string
          is_solution?: boolean
          is_hidden?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      // Event related tables
      events: {
        Row: {
          id: string
          title: string
          description: string
          start_time: string
          end_time: string
          location_link: string
          physical_location: string
          cover_image_url: string
          is_recurring: boolean
          recurrence_pattern: string
          recurrence_interval: number
          recurrence_day: number
          recurrence_count: number
          recurrence_end_date: string
          parent_event_id: string
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
          event_id?: string
          role_id?: string
        }
        Relationships: []
      }
      // Role and permission tables
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
          name?: string
          description?: string
          permissions?: Json
          is_system?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      permission_definitions: {
        Row: {
          id: string
          code: string
          name: string
          description: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string
          category?: string
          created_at?: string
        }
        Update: {
          code?: string
          name?: string
          description?: string
          category?: string
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
          role_id?: string
          permission_id?: string
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
          course_id?: string
          role_id?: string
          created_at?: string
        }
        Update: {
          course_id?: string
          role_id?: string
        }
        Relationships: []
      }
      // Analytics and audit tables
      audit_logs: {
        Row: {
          id: string
          user_id: string
          event_type: string
          action: string
          resource_id: string
          details: Json
          severity: string
          ip_address: string
          user_agent: string
          session_id: string
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string
          event_type: string
          action: string
          resource_id?: string
          details?: Json
          severity?: string
          ip_address?: string
          user_agent?: string
          session_id?: string
          timestamp?: string
        }
        Update: {
          details?: Json
          severity?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          event_type: string
          solution_id: string
          module_id: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          solution_id?: string
          module_id?: string
          event_data?: Json
          created_at?: string
        }
        Update: {
          event_data?: Json
        }
        Relationships: []
      }
      // Invite related tables
      invites: {
        Row: {
          id: string
          email: string
          role_id: string
          token: string
          expires_at: string
          used_at: string
          created_by: string
          created_at: string
          last_sent_at: string
          send_attempts: number
          notes: string
          whatsapp_number: string
          preferred_channel: string
          name?: string
        }
        Insert: {
          id?: string
          email: string
          role_id: string
          token?: string
          expires_at: string
          used_at?: string
          created_by: string
          created_at?: string
          last_sent_at?: string
          send_attempts?: number
          notes?: string
          whatsapp_number?: string
          preferred_channel?: string
          name?: string
        }
        Update: {
          expires_at?: string
          used_at?: string
          last_sent_at?: string
          send_attempts?: number
          notes?: string
          whatsapp_number?: string
          preferred_channel?: string
          name?: string
        }
        Relationships: []
      }
      invite_deliveries: {
        Row: {
          id: string
          invite_id: string
          channel: string
          status: string
          provider_id: string
          error_message: string
          metadata: Json
          sent_at: string
          delivered_at: string
          opened_at: string
          clicked_at: string
          failed_at: string
          opened_count: number
          clicked_count: number
          conversion_value: number
          utm_source: string
          utm_medium: string
          utm_campaign: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invite_id: string
          channel: string
          status?: string
          provider_id?: string
          error_message?: string
          metadata?: Json
          sent_at?: string
          delivered_at?: string
          opened_at?: string
          clicked_at?: string
          failed_at?: string
          opened_count?: number
          clicked_count?: number
          conversion_value?: number
          utm_source?: string
          utm_medium?: string
          utm_campaign?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          error_message?: string
          metadata?: Json
          sent_at?: string
          delivered_at?: string
          opened_at?: string
          clicked_at?: string
          failed_at?: string
          opened_count?: number
          clicked_count?: number
          conversion_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      // Communication tables
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
          scheduled_for: string
          sent_at: string
          email_subject: string
          metadata: Json
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
          target_roles?: string[]
          delivery_channels?: string[]
          scheduled_for?: string
          sent_at?: string
          email_subject?: string
          metadata?: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          content_type?: string
          template_type?: string
          priority?: string
          status?: string
          target_roles?: string[]
          delivery_channels?: string[]
          scheduled_for?: string
          sent_at?: string
          email_subject?: string
          metadata?: Json
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
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          admin_communications_inapp?: boolean
          admin_communications_email?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      // Missing tables referenced in errors
      onboarding_analytics: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_data?: Json
          created_at?: string
        }
        Update: {
          event_data?: Json
        }
        Relationships: []
      }
      onboarding_sync: {
        Row: {
          id: string
          user_id: string
          sync_data: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sync_data?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          sync_data?: Json
          status?: string
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
          reaction_type?: string
        }
        Relationships: []
      }
      // Access control tables
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
          tool_id?: string
          role_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_permissions: {
        Args: { user_id: string }
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
        Args: {
          function_name: string
          params?: Json
        }
        Returns: Json
      }
      complete_invite_registration: {
        Args: {
          p_token: string
          p_user_id: string
        }
        Returns: {
          success: boolean
          message: string
        }
      }
      user_has_permission: {
        Args: {
          user_id: string
          permission_code: string
        }
        Returns: boolean
      }
      has_role: {
        Args: { role_name: string }
        Returns: boolean
      }
      accept_invite: {
        Args: { p_token: string }
        Returns: {
          success: boolean
          message: string
          requires_onboarding: boolean
        }
      }
    }
    Enums: {
      solution_category: 'Receita' | 'Operacional' | 'Estratégia'
      difficulty_level: 'beginner' | 'intermediate' | 'advanced'
      forum_reaction_type: 'like' | 'dislike' | 'helpful' | 'resolved'
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

