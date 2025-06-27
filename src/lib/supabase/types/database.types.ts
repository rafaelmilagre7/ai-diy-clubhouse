
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
          content_type: string
          priority: string
          template_type: string
          status: string
          delivery_channels: string[]
          target_roles: string[]
          scheduled_for: string | null
          created_at: string
          created_by: string
          sent_at: string | null
          metadata: Json
          updated_at: string
          email_subject: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          content_type?: string
          priority?: string
          template_type?: string
          status?: string
          delivery_channels?: string[]
          target_roles: string[]
          scheduled_for?: string | null
          created_by: string
          sent_at?: string | null
          metadata?: Json
          updated_at?: string
          email_subject?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          content_type?: string
          priority?: string
          template_type?: string
          status?: string
          delivery_channels?: string[]
          target_roles?: string[]
          scheduled_for?: string | null
          created_by?: string
          sent_at?: string | null
          metadata?: Json
          updated_at?: string
          email_subject?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role_id: string | null
          avatar_url: string | null
          company_name: string | null
          industry: string | null
          created_at: string
          updated_at: string
          phone: string | null
          instagram: string | null
          linkedin: string | null
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
          nps_score: number | null
          weekly_availability: string | null
          networking_interests: string[] | null
          phone_country_code: string | null
          role: string | null
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          referrals_count: number
          successful_referrals_count: number
          user_roles: {
            id: string
            name: string
            description?: string
            permissions?: Json
            is_system?: boolean
          } | null
        }
        Insert: {
          id: string
          email: string
          name: string
          role_id?: string | null
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          instagram?: string | null
          linkedin?: string | null
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
          nps_score?: number | null
          weekly_availability?: string | null
          networking_interests?: string[] | null
          phone_country_code?: string | null
          role?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          referrals_count?: number
          successful_referrals_count?: number
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role_id?: string | null
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          instagram?: string | null
          linkedin?: string | null
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
          nps_score?: number | null
          weekly_availability?: string | null
          networking_interests?: string[] | null
          phone_country_code?: string | null
          role?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          referrals_count?: number
          successful_referrals_count?: number
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
      onboarding_analytics: {
        Row: {
          id: string
          user_id: string
          event_type: string
          step_number: number | null
          field_name: string | null
          error_message: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          step_number?: number | null
          field_name?: string | null
          error_message?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          step_number?: number | null
          field_name?: string | null
          error_message?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      audit_role_assignments: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          name: string
          role_name: string
          assigned_at: string
          issues: string[]
        }[]
      }
      can_access_benefit: {
        Args: {
          user_id: string
          tool_id: string
        }
        Returns: boolean
      }
      can_access_course: {
        Args: {
          user_id: string
          course_id: string
        }
        Returns: boolean
      }
      check_solution_certificate_eligibility: {
        Args: {
          p_user_id: string
          p_solution_id: string
        }
        Returns: boolean
      }
      create_invite: {
        Args: {
          p_email: string
          p_role_id: string
          p_expires_in?: string
          p_notes?: string
        }
        Returns: Json
      }
      create_storage_public_policy: {
        Args: {
          bucket_name: string
        }
        Returns: boolean
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
      delete_forum_post: {
        Args: {
          post_id: string
        }
        Returns: Json
      }
      delete_forum_topic: {
        Args: {
          topic_id: string
        }
        Returns: Json
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
      has_role: {
        Args: {
          role_name: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_access: {
        Args: {
          action: string
          resource: string
          success: boolean
        }
        Returns: void
      }
      reset_analytics_data_enhanced: {
        Args: Record<PropertyKey, never>
        Returns: {
          success: boolean
          message: string
          backupRecords: number
        }
      }
      sync_profile_roles: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      use_invite: {
        Args: {
          invite_token: string
          user_id: string
        }
        Returns: Json
      }
      user_has_permission: {
        Args: {
          user_id: string
          permission_code: string
        }
        Returns: boolean
      }
      validate_profile_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          name: string
          role_name: string
          role_id: string
          issues: string[]
          created_at: string
        }[]
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}
