
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
          name: string | null
          avatar_url: string | null
          company_name: string | null
          industry: string | null
          role_id: string | null
          role: string | null
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
          business_challenges: string[] | null
          ai_knowledge_level: number | null
          weekly_availability: string | null
          networking_interests: string[] | null
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
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          role_id?: string | null
          role?: string | null
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
          business_challenges?: string[] | null
          ai_knowledge_level?: number | null
          weekly_availability?: string | null
          networking_interests?: string[] | null
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
          name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          role_id?: string | null
          role?: string | null
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
          business_challenges?: string[] | null
          ai_knowledge_level?: number | null
          weekly_availability?: string | null
          networking_interests?: string[] | null
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
      solutions: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          difficulty: string
          slug: string
          published: boolean
          thumbnail_url: string | null
          cover_image_url: string | null
          created_at: string
          updated_at: string
          estimated_time_hours: number | null
          roi_potential: string | null
          success_metrics: Json | null
          required_tools: string[] | null
          implementation_steps: Json | null
          target_audience: string | null
          prerequisites: string[] | null
          expected_results: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          difficulty: string
          slug: string
          published?: boolean
          thumbnail_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
          estimated_time_hours?: number | null
          roi_potential?: string | null
          success_metrics?: Json | null
          required_tools?: string[] | null
          implementation_steps?: Json | null
          target_audience?: string | null
          prerequisites?: string[] | null
          expected_results?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          difficulty?: string
          slug?: string
          published?: boolean
          thumbnail_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
          estimated_time_hours?: number | null
          roi_potential?: string | null
          success_metrics?: Json | null
          required_tools?: string[] | null
          implementation_steps?: Json | null
          target_audience?: string | null
          prerequisites?: string[] | null
          expected_results?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          id: string
          solution_id: string
          title: string
          type: string
          order_index: number
          content: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          title: string
          type: string
          order_index: number
          content?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          title?: string
          type?: string
          order_index?: number
          content?: Json
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
          url: string | null
          logo_url: string | null
          pricing_info: Json | null
          features: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
          has_member_benefit: boolean
          benefit_type: string | null
          benefit_title: string | null
          benefit_description: string | null
          benefit_discount_percentage: number | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          url?: string | null
          logo_url?: string | null
          pricing_info?: Json | null
          features?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          has_member_benefit?: boolean
          benefit_type?: string | null
          benefit_title?: string | null
          benefit_description?: string | null
          benefit_discount_percentage?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          url?: string | null
          logo_url?: string | null
          pricing_info?: Json | null
          features?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          has_member_benefit?: boolean
          benefit_type?: string | null
          benefit_title?: string | null
          benefit_description?: string | null
          benefit_discount_percentage?: number | null
        }
        Relationships: []
      }
      learning_courses: {
        Row: {
          id: string
          title: string
          description: string
          published: boolean
          created_at: string
          updated_at: string
          cover_image_url: string | null
          instructor_id: string | null
          category: string | null
          difficulty_level: string | null
          estimated_hours: number | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          published?: boolean
          created_at?: string
          updated_at?: string
          cover_image_url?: string | null
          instructor_id?: string | null
          category?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          published?: boolean
          created_at?: string
          updated_at?: string
          cover_image_url?: string | null
          instructor_id?: string | null
          category?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
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
          content: string | null
          order_index: number
          is_published: boolean
          published: boolean
          created_at: string
          updated_at: string
          estimated_duration_minutes: number | null
          lesson_type: string | null
          video_url: string | null
          video_duration_seconds: number | null
          cover_image_url: string | null
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description?: string | null
          content?: string | null
          order_index: number
          is_published?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
          estimated_duration_minutes?: number | null
          lesson_type?: string | null
          video_url?: string | null
          video_duration_seconds?: number | null
          cover_image_url?: string | null
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          description?: string | null
          content?: string | null
          order_index?: number
          is_published?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
          estimated_duration_minutes?: number | null
          lesson_type?: string | null
          video_url?: string | null
          video_duration_seconds?: number | null
          cover_image_url?: string | null
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
          thumbnail_url: string | null
          duration_seconds: number | null
          created_at: string
          order_index: number
          video_type: string
          file_size_bytes: number | null
          video_file_path: string | null
          video_file_name: string | null
          video_id: string | null
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description?: string | null
          url: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          created_at?: string
          order_index: number
          video_type: string
          file_size_bytes?: number | null
          video_file_path?: string | null
          video_file_name?: string | null
          video_id?: string | null
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string | null
          url?: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          created_at?: string
          order_index?: number
          video_type?: string
          file_size_bytes?: number | null
          video_file_path?: string | null
          video_file_name?: string | null
          video_id?: string | null
        }
        Relationships: []
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
          file_size_bytes: number | null
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description?: string | null
          resource_type: string
          file_url?: string | null
          external_url?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
          file_size_bytes?: number | null
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
          file_size_bytes?: number | null
        }
        Relationships: []
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
          order_index: number | null
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
          order_index?: number | null
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
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
  }
}
