
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
          sent_at: string | null
          created_at: string
          created_by: string
          updated_at: string
          email_subject: string | null
          metadata: Json
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
          sent_at?: string | null
          created_at?: string
          created_by: string
          updated_at?: string
          email_subject?: string | null
          metadata?: Json
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
          sent_at?: string | null
          created_at?: string
          created_by?: string
          updated_at?: string
          email_subject?: string | null
          metadata?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role_id: string | null
          user_roles: {
            id: string
            name: string
            description?: string
          } | null
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
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          referrals_count: number
          successful_referrals_count: number
        }
        Insert: {
          id: string
          email: string
          name?: string | null
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
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          referrals_count?: number
          successful_referrals_count?: number
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
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
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          referrals_count?: number
          successful_referrals_count?: number
        }
        Relationships: []
      }
      progress: {
        Row: {
          id: string
          user_id: string
          solution_id: string
          is_completed: boolean
          progress_percentage: number
          created_at: string
          completed_at: string | null
          last_activity: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          is_completed?: boolean
          progress_percentage?: number
          created_at?: string
          completed_at?: string | null
          last_activity?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          is_completed?: boolean
          progress_percentage?: number
          created_at?: string
          completed_at?: string | null
          last_activity?: string
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
      analytics: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: Json | null
          solution_id: string | null
          module_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_data?: Json | null
          solution_id?: string | null
          module_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_data?: Json | null
          solution_id?: string | null
          module_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
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
          id?: string
          user_id?: string
          event_type?: string
          event_data?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      reset_analytics_data_enhanced: {
        Args: Record<PropertyKey, never>
        Returns: {
          success: boolean
          message: string
          backupRecords?: number
        }
      }
      create_storage_public_policy: {
        Args: {
          bucket_name: string
        }
        Returns: boolean
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
