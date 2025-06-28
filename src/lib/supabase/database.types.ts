
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
      learning_courses: {
        Row: {
          id: string
          title: string
          description: string
          published: boolean
          created_at: string
          updated_at: string
          cover_image_url: string | null
          instructor_id: string
          category: string
          difficulty_level: string
          estimated_hours: number
        }
        Insert: {
          id?: string
          title: string
          description: string
          published?: boolean
          created_at?: string
          updated_at?: string
          cover_image_url?: string | null
          instructor_id: string
          category: string
          difficulty_level: string
          estimated_hours: number
        }
        Update: {
          id?: string
          title?: string
          description?: string
          published?: boolean
          created_at?: string
          updated_at?: string
          cover_image_url?: string | null
          instructor_id?: string
          category?: string
          difficulty_level?: string
          estimated_hours?: number
        }
      }
      learning_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      learning_lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string
          content: string
          order_index: number
          is_published: boolean
          published: boolean
          created_at: string
          updated_at: string
          estimated_duration_minutes: number
          estimated_time_minutes: number
          difficulty_level: string
          ai_assistant_enabled: boolean
          ai_assistant_id: string | null
          ai_assistant_prompt: string | null
          cover_image_url: string | null
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description: string
          content: string
          order_index: number
          is_published?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
          estimated_duration_minutes: number
          estimated_time_minutes: number
          difficulty_level: string
          ai_assistant_enabled?: boolean
          ai_assistant_id?: string | null
          ai_assistant_prompt?: string | null
          cover_image_url?: string | null
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          description?: string
          content?: string
          order_index?: number
          is_published?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
          estimated_duration_minutes?: number
          estimated_time_minutes?: number
          difficulty_level?: string
          ai_assistant_enabled?: boolean
          ai_assistant_id?: string | null
          ai_assistant_prompt?: string | null
          cover_image_url?: string | null
        }
      }
      learning_lesson_videos: {
        Row: {
          id: string
          lesson_id: string
          title: string
          description: string
          url: string
          thumbnail_url: string
          duration_seconds: number
          created_at: string
          order_index: number
          video_type: string
          file_size_bytes: number
          video_file_path: string
          video_file_name: string
          video_id: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description: string
          url: string
          thumbnail_url: string
          duration_seconds: number
          created_at?: string
          order_index: number
          video_type: string
          file_size_bytes: number
          video_file_path: string
          video_file_name: string
          video_id: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string
          url?: string
          thumbnail_url?: string
          duration_seconds?: number
          created_at?: string
          order_index?: number
          video_type?: string
          file_size_bytes?: number
          video_file_path?: string
          video_file_name?: string
          video_id?: string
        }
      }
      modules: {
        Row: {
          id: string
          solution_id: string
          title: string
          description: string
          content: Json
          type: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          description: string
          content: Json
          type: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          description?: string
          content?: Json
          type?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      solutions: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          difficulty_level: string
          difficulty: string
          estimated_time_hours: number
          roi_potential: string
          implementation_steps: Json
          required_tools: string[]
          created_at: string
          updated_at: string
          created_by: string
          tags: string[]
          thumbnail_url: string
          slug: string
          published: boolean
          is_published: boolean
          success_metrics: Json
          cover_image_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          difficulty_level: string
          difficulty: string
          estimated_time_hours: number
          roi_potential: string
          implementation_steps: Json
          required_tools: string[]
          created_at?: string
          updated_at?: string
          created_by: string
          tags: string[]
          thumbnail_url: string
          slug: string
          published?: boolean
          is_published?: boolean
          success_metrics?: Json
          cover_image_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          difficulty_level?: string
          difficulty?: string
          estimated_time_hours?: number
          roi_potential?: string
          implementation_steps?: Json
          required_tools?: string[]
          created_at?: string
          updated_at?: string
          created_by?: string
          tags?: string[]
          thumbnail_url?: string
          slug?: string
          published?: boolean
          is_published?: boolean
          success_metrics?: Json
          cover_image_url?: string | null
        }
      }
      solution_resources: {
        Row: {
          id: string
          solution_id: string
          title: string
          description: string | null
          resource_type: string
          file_url: string | null
          external_url: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          description?: string | null
          resource_type: string
          file_url?: string | null
          external_url?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          description?: string | null
          resource_type?: string
          file_url?: string | null
          external_url?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          role: string | null
          role_id: string
          company_name: string
          industry: string
          created_at: string
          updated_at: string
          phone: string | null
          instagram: string | null
          linkedin: string | null
          country: string | null
          state: string | null
          city: string | null
          company_website: string | null
          current_position: string | null
          company_sector: string | null
          company_size: string | null
          annual_revenue: string | null
          primary_goal: string | null
          business_challenges: string | null
          ai_knowledge_level: string | null
          weekly_availability: string | null
          networking_interests: string | null
          nps_score: number | null
          phone_country_code: string
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          is_premium: boolean
          premium_expires_at: string | null
          referred_by: string | null
          referrals_count: number
          successful_referrals_count: number
          last_login_at: string | null
          login_count: number
          email_verified: boolean
          email_verified_at: string | null
          profile_completion_percentage: number
          last_profile_update: string | null
          preferences: Json | null
          timezone: string | null
          language: string
          notifications_enabled: boolean
          marketing_emails_enabled: boolean
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          role?: string | null
          role_id: string
          company_name: string
          industry: string
          created_at?: string
          updated_at?: string
          phone?: string | null
          instagram?: string | null
          linkedin?: string | null
          country?: string | null
          state?: string | null
          city?: string | null
          company_website?: string | null
          current_position?: string | null
          company_sector?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          primary_goal?: string | null
          business_challenges?: string | null
          ai_knowledge_level?: string | null
          weekly_availability?: string | null
          networking_interests?: string | null
          nps_score?: number | null
          phone_country_code?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          is_premium?: boolean
          premium_expires_at?: string | null
          referred_by?: string | null
          referrals_count?: number
          successful_referrals_count?: number
          last_login_at?: string | null
          login_count?: number
          email_verified?: boolean
          email_verified_at?: string | null
          profile_completion_percentage?: number
          last_profile_update?: string | null
          preferences?: Json | null
          timezone?: string | null
          language?: string
          notifications_enabled?: boolean
          marketing_emails_enabled?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          role?: string | null
          role_id?: string
          company_name?: string
          industry?: string
          created_at?: string
          updated_at?: string
          phone?: string | null
          instagram?: string | null
          linkedin?: string | null
          country?: string | null
          state?: string | null
          city?: string | null
          company_website?: string | null
          current_position?: string | null
          company_sector?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          primary_goal?: string | null
          business_challenges?: string | null
          ai_knowledge_level?: string | null
          weekly_availability?: string | null
          networking_interests?: string | null
          nps_score?: number | null
          phone_country_code?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          is_premium?: boolean
          premium_expires_at?: string | null
          referred_by?: string | null
          referrals_count?: number
          successful_referrals_count?: number
          last_login_at?: string | null
          login_count?: number
          email_verified?: boolean
          email_verified_at?: string | null
          profile_completion_percentage?: number
          last_profile_update?: string | null
          preferences?: Json | null
          timezone?: string | null
          language?: string
          notifications_enabled?: boolean
          marketing_emails_enabled?: boolean
        }
      }
      tools: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          url: string
          logo_url: string
          pricing_info: Json
          features: string[]
          is_active: boolean
          created_at: string
          updated_at: string
          tags: string[]
          official_url: string
          status: boolean
          benefit_link: string | null
          has_member_benefit: boolean
          benefit_type: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          url: string
          logo_url: string
          pricing_info: Json
          features: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tags: string[]
          official_url: string
          status?: boolean
          benefit_link?: string | null
          has_member_benefit?: boolean
          benefit_type?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          url?: string
          logo_url?: string
          pricing_info?: Json
          features?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tags?: string[]
          official_url?: string
          status?: boolean
          benefit_link?: string | null
          has_member_benefit?: boolean
          benefit_type?: string | null
        }
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
          description: string
          permissions: Json
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
          last_position_seconds: number | null
          updated_at: string
          created_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          progress_percentage: number
          video_progress: Json
          started_at?: string
          completed_at?: string | null
          last_position_seconds?: number | null
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
          last_position_seconds?: number | null
          updated_at?: string
          created_at?: string
          notes?: string | null
        }
      }
      learning_resources: {
        Row: {
          id: string
          lesson_id: string
          title: string
          description: string | null
          resource_type: string
          file_url: string | null
          external_url: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description?: string | null
          resource_type: string
          file_url?: string | null
          external_url?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string | null
          resource_type?: string
          file_url?: string | null
          external_url?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      learning_comments: {
        Row: {
          id: string
          lesson_id: string
          user_id: string
          content: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          user_id: string
          content: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          start_time: string
          end_time: string
          location: string | null
          is_online: boolean
          meeting_url: string | null
          created_by: string
          created_at: string
          updated_at: string
          is_active: boolean
          max_participants: number | null
          cover_image_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          start_time: string
          end_time: string
          location?: string | null
          is_online?: boolean
          meeting_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          max_participants?: number | null
          cover_image_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          location?: string | null
          is_online?: boolean
          meeting_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          max_participants?: number | null
          cover_image_url?: string | null
        }
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
          description: string
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
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          granted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          granted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
          granted?: boolean
          created_at?: string
        }
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string
          color: string
          icon: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          color: string
          icon: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          color?: string
          icon?: string
          order_index?: number
          created_at?: string
        }
      }
      forum_topics: {
        Row: {
          id: string
          title: string
          category_id: string
          user_id: string
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
          title: string
          category_id: string
          user_id: string
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
          id?: string
          title?: string
          category_id?: string
          user_id?: string
          content?: string
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean
          view_count?: number
          reply_count?: number
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          topic_id: string
          user_id: string
          content: string
          parent_id: string | null
          is_solution: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          user_id: string
          content: string
          parent_id?: string | null
          is_solution?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          is_solution?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          action: string
          resource_id: string | null
          details: Json | null
          severity: string
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          action: string
          resource_id?: string | null
          details?: Json | null
          severity?: string
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          action?: string
          resource_id?: string | null
          details?: Json | null
          severity?: string
          timestamp?: string
        }
      }
      admin_communications: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          priority: string
          target_roles: string[]
          created_by: string
          created_at: string
          updated_at: string
          is_active: boolean
          scheduled_for: string
          sent_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type: string
          priority: string
          target_roles: string[]
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          scheduled_for: string
          sent_at: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: string
          priority?: string
          target_roles?: string[]
          created_by?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          scheduled_for?: string
          sent_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: Json
          created_at?: string
        }
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          push_notifications: boolean
          sms_notifications: boolean
          marketing_emails: boolean
          course_updates: boolean
          forum_replies: boolean
          system_announcements: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          push_notifications?: boolean
          sms_notifications?: boolean
          marketing_emails?: boolean
          course_updates?: boolean
          forum_replies?: boolean
          system_announcements?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          push_notifications?: boolean
          sms_notifications?: boolean
          marketing_emails?: boolean
          course_updates?: boolean
          forum_replies?: boolean
          system_announcements?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      implementation_checkpoints: {
        Row: {
          id: string
          solution_id: string
          title: string
          description: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          description: string
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          description?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          solution_id: string
          is_completed: boolean
          progress_percentage: number
          started_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          is_completed?: boolean
          progress_percentage?: number
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          is_completed?: boolean
          progress_percentage?: number
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
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
          updated_at: string
          notes: string | null
          send_attempts: number
          last_sent_at: string | null
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
          updated_at?: string
          notes?: string | null
          send_attempts?: number
          last_sent_at?: string | null
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
          updated_at?: string
          notes?: string | null
          send_attempts?: number
          last_sent_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
