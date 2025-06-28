
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
          type?: string
          priority?: string
          target_roles?: string[]
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          scheduled_for?: string
          sent_at?: string
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
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string
          role: string
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
          name?: string
          avatar_url?: string
          role?: string
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
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string
          role?: string
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
        Relationships: []
      }
      solutions: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          difficulty_level: string
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
          difficulty: string
          is_published: boolean
          success_metrics: Json | null
          cover_image_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          difficulty_level?: string
          estimated_time_hours?: number
          roi_potential?: string
          implementation_steps?: Json
          required_tools?: string[]
          created_at?: string
          updated_at?: string
          created_by: string
          tags?: string[]
          thumbnail_url?: string
          slug?: string
          published?: boolean
          difficulty?: string
          is_published?: boolean
          success_metrics?: Json | null
          cover_image_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          difficulty_level?: string
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
          difficulty?: string
          is_published?: boolean
          success_metrics?: Json | null
          cover_image_url?: string | null
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
          description?: string | null
          category: string
          url?: string | null
          logo_url?: string | null
          pricing_info?: Json | null
          features?: string[] | null
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
          tags?: string[]
          official_url?: string
          status?: boolean
          benefit_link?: string | null
          has_member_benefit?: boolean
          benefit_type?: string | null
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
      // Add more tables as needed
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
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
