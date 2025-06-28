
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
          content_type: string | null
          priority: string | null
          template_type: string | null
          status: string | null
          delivery_channels: string[]
          target_roles: string[]
          created_by: string
          created_at: string | null
          updated_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          email_subject: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          content_type?: string | null
          priority?: string | null
          template_type?: string | null
          status?: string | null
          delivery_channels?: string[]
          target_roles?: string[]
          created_by: string
          created_at?: string | null
          updated_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          email_subject?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          content_type?: string | null
          priority?: string | null
          template_type?: string | null
          status?: string | null
          delivery_channels?: string[]
          target_roles?: string[]
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          email_subject?: string | null
          metadata?: Json | null
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
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          action: string
          resource_id: string | null
          details: Json | null
          timestamp: string | null
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          severity: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          action: string
          resource_id?: string | null
          details?: Json | null
          timestamp?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          severity?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          action?: string
          resource_id?: string | null
          details?: Json | null
          timestamp?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          severity?: string | null
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
      course_access_control: {
        Row: {
          id: string
          course_id: string | null
          role_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          course_id?: string | null
          role_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          course_id?: string | null
          role_id?: string | null
          created_at?: string | null
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
          created_by: string
          created_at: string
          is_recurring: boolean | null
          recurrence_pattern: string | null
          recurrence_interval: number | null
          recurrence_day: number | null
          recurrence_count: number | null
          recurrence_end_date: string | null
          parent_event_id: string | null
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
          created_by: string
          created_at?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          recurrence_interval?: number | null
          recurrence_day?: number | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          parent_event_id?: string | null
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
          created_by?: string
          created_at?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          recurrence_interval?: number | null
          recurrence_day?: number | null
          recurrence_count?: number | null
          recurrence_end_date?: string | null
          parent_event_id?: string | null
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
      forum_topics: {
        Row: {
          id: string
          title: string
          content: string
          user_id: string
          category_id: string
          is_pinned: boolean
          is_locked: boolean
          is_solved: boolean | null
          view_count: number
          reply_count: number
          created_at: string
          updated_at: string
          last_activity_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          category_id: string
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean | null
          view_count?: number
          reply_count?: number
          created_at?: string
          updated_at?: string
          last_activity_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          category_id?: string
          is_pinned?: boolean
          is_locked?: boolean
          is_solved?: boolean | null
          view_count?: number
          reply_count?: number
          created_at?: string
          updated_at?: string
          last_activity_at?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          id: string
          topic_id: string
          user_id: string
          content: string
          parent_id: string | null
          is_solution: boolean
          is_hidden: boolean
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
          is_hidden?: boolean
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
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      implementation_checkpoints: {
        Row: {
          id: string
          solution_id: string | null
          description: string
          checkpoint_order: number
          created_at: string | null
        }
        Insert: {
          id?: string
          solution_id?: string | null
          description: string
          checkpoint_order: number
          created_at?: string | null
        }
        Update: {
          id?: string
          solution_id?: string | null
          description?: string
          checkpoint_order?: number
          created_at?: string | null
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
          send_attempts: number | null
          notes: text | null
          preferred_channel: string | null
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
          send_attempts?: number | null
          notes?: text | null
          preferred_channel?: string | null
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
          send_attempts?: number | null
          notes?: text | null
          preferred_channel?: string | null
          whatsapp_number?: string | null
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
          published: boolean | null
          order_index: number | null
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
          published?: boolean | null
          order_index?: number | null
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
          published?: boolean | null
          order_index?: number | null
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
          cover_image_url: string | null
          published: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index?: number
          cover_image_url?: string | null
          published?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          cover_image_url?: string | null
          published?: boolean | null
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
          cover_image_url: string | null
          published: boolean | null
          estimated_time_minutes: number | null
          difficulty_level: string | null
          ai_assistant_enabled: boolean | null
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
          cover_image_url?: string | null
          published?: boolean | null
          estimated_time_minutes?: number | null
          difficulty_level?: string | null
          ai_assistant_enabled?: boolean | null
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
          cover_image_url?: string | null
          published?: boolean | null
          estimated_time_minutes?: number | null
          difficulty_level?: string | null
          ai_assistant_enabled?: boolean | null
          ai_assistant_id?: string | null
          ai_assistant_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          progress_percentage: number | null
          video_progress: Json | null
          started_at: string
          completed_at: string | null
          last_position_seconds: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          progress_percentage?: number | null
          video_progress?: Json | null
          started_at?: string
          completed_at?: string | null
          last_position_seconds?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          progress_percentage?: number | null
          video_progress?: Json | null
          started_at?: string
          completed_at?: string | null
          last_position_seconds?: number | null
          notes?: string | null
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
          estimated_time_minutes: number | null
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
          estimated_time_minutes?: number | null
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
          estimated_time_minutes?: number | null
          metrics?: Json | null
          certificate_template?: Json | null
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
          admin_communications_inapp: boolean | null
          admin_communications_email: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          admin_communications_inapp?: boolean | null
          admin_communications_email?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          whatsapp_enabled?: boolean
          admin_communications_inapp?: boolean | null
          admin_communications_email?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          company_name: string | null
          industry: string | null
          role_id: string
          role: string | null
          created_at: string
          updated_at: string
          phone: string | null
          instagram: string | null
          linkedin: string | null
          state: string | null
          city: string | null
          company_website: string | null
          company_size: string | null
          annual_revenue: string | null
          ai_knowledge_level: number | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          referrals_count: number
          successful_referrals_count: number
          business_challenges: string[] | null
          user_roles: {
            id: string
            name: string
            description?: string | null
          } | null
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          role_id: string
          role?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          instagram?: string | null
          linkedin?: string | null
          state?: string | null
          city?: string | null
          company_website?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          ai_knowledge_level?: number | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          referrals_count?: number
          successful_referrals_count?: number
          business_challenges?: string[] | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          role_id?: string
          role?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          instagram?: string | null
          linkedin?: string | null
          state?: string | null
          city?: string | null
          company_website?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          ai_knowledge_level?: number | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          referrals_count?: number
          successful_referrals_count?: number
          business_challenges?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          }
        ]
      }
      solution_resources: {
        Row: {
          id: string
          solution_id: string
          name: string
          description: string | null
          file_url: string | null
          file_type: string | null
          file_size_bytes: number | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solution_id: string
          name: string
          description?: string | null
          file_url?: string | null
          file_type?: string | null
          file_size_bytes?: number | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solution_id?: string
          name?: string
          description?: string | null
          file_url?: string | null
          file_type?: string | null
          file_size_bytes?: number | null
          order_index?: number
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
          difficulty: string
          estimated_time_hours: number | null
          cover_image_url: string | null
          published: boolean | null
          featured: boolean | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          difficulty: string
          estimated_time_hours?: number | null
          cover_image_url?: string | null
          published?: boolean | null
          featured?: boolean | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          difficulty?: string
          estimated_time_hours?: number | null
          cover_image_url?: string | null
          published?: boolean | null
          featured?: boolean | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          official_url: string
          logo_url: string | null
          status: boolean | null
          pricing_info: Json | null
          features: string[] | null
          tags: string[] | null
          difficulty_level: string | null
          integration_available: boolean | null
          api_available: boolean | null
          free_tier: boolean | null
          created_at: string
          updated_at: string
          benefit_title: string | null
          benefit_description: string | null
          benefit_url: string | null
          benefit_instructions: string | null
          video_tutorials: Json | null
          affiliate_link: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          official_url: string
          logo_url?: string | null
          status?: boolean | null
          pricing_info?: Json | null
          features?: string[] | null
          tags?: string[] | null
          difficulty_level?: string | null
          integration_available?: boolean | null
          api_available?: boolean | null
          free_tier?: boolean | null
          created_at?: string
          updated_at?: string
          benefit_title?: string | null
          benefit_description?: string | null
          benefit_url?: string | null
          benefit_instructions?: string | null
          video_tutorials?: Json | null
          affiliate_link?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          official_url?: string
          logo_url?: string | null
          status?: boolean | null
          pricing_info?: Json | null
          features?: string[] | null
          tags?: string[] | null
          difficulty_level?: string | null
          integration_available?: boolean | null
          api_available?: boolean | null
          free_tier?: boolean | null
          created_at?: string
          updated_at?: string
          benefit_title?: string | null
          benefit_description?: string | null
          benefit_url?: string | null
          benefit_instructions?: string | null
          video_tutorials?: Json | null
          affiliate_link?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: Json | null
          is_system: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: Json | null
          is_system?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: Json | null
          is_system?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      audit_role_assignments: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_count_by_role: Record<string, number>
          inconsistencies_count: number
          total_users: number
          roles_without_users: string[] | null
          users_without_roles: number
        }[]
      }
      sync_profile_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          success: boolean
          total_profiles: number
          profiles_corrected: number
          message: string
        }
      }
      validate_profile_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          user_role: string
          user_role_id: string
          expected_role_name: string
          expected_role_id: string
          issue_type: string
        }[]
      }
      use_invite: {
        Args: {
          invite_token: string
          user_id: string
        }
        Returns: Json
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
