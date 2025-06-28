export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
          delivery_channels: string[] | null
          target_roles: string[] | null
          scheduled_for: string | null
          created_at: string
          created_by: string
          sent_at: string | null
          updated_at: string
          email_subject: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          content_type?: string
          priority?: string
          template_type?: string
          status?: string
          delivery_channels?: string[] | null
          target_roles?: string[] | null
          scheduled_for?: string | null
          created_at?: string
          created_by: string
          sent_at?: string | null
          updated_at?: string
          email_subject?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          content_type?: string
          priority?: string
          template_type?: string
          status?: string
          delivery_channels?: string[] | null
          target_roles?: string[] | null
          scheduled_for?: string | null
          created_at?: string
          created_by?: string
          sent_at?: string | null
          updated_at?: string
          email_subject?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_communications_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
          timestamp: string | null
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          action: string
          resource_id?: string | null
          details?: Json | null
          severity?: string | null
          timestamp?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          action?: string
          resource_id?: string | null
          details?: Json | null
          severity?: string | null
          timestamp?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
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
          start_time: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
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
          start_time?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
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
          start_time?: string | null
          title?: string | null
        }
        Relationships: []
      }
      implementation_checkpoints: {
        Row: {
          checkpoint_order: number | null
          created_at: string | null
          description: string | null
          id: string
          solution_id: string | null
        }
        Insert: {
          checkpoint_order?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          solution_id?: string | null
        }
        Update: {
          checkpoint_order?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          solution_id?: string | null
        }
        Relationships: []
      }
      learning_courses: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          order_index: number | null
          published: boolean | null
          slug: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          published?: boolean | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          published?: boolean | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          certificate_template: Json | null
          content: Json | null
          created_at: string | null
          estimated_time_minutes: number | null
          id: string
          module_order: number | null
          solution_id: string | null
          title: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          certificate_template?: Json | null
          content?: Json | null
          created_at?: string | null
          estimated_time_minutes?: number | null
          id?: string
          module_order?: number | null
          solution_id?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          certificate_template?: Json | null
          content?: Json | null
          created_at?: string | null
          estimated_time_minutes?: number | null
          id?: string
          module_order?: number | null
          solution_id?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          admin_communications_email: boolean | null
          admin_communications_inapp: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          id: string
          updated_at: string | null
          user_id: string | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          admin_communications_email?: boolean | null
          admin_communications_inapp?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          admin_communications_email?: boolean | null
          admin_communications_inapp?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_enabled?: boolean | null
        }
        Relationships: []
      }
      onboarding_analytics: {
        Row: {
          completed_at: string | null
          created_at: string | null
          data: Json | null
          id: string
          step: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          step?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          step?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      permission_definitions: {
        Row: {
          category: string | null
          code: string | null
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          description?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          category?: string | null
          code?: string | null
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_knowledge_level: string | null
          annual_revenue: string | null
          avatar_url: string | null
          business_challenges: string[] | null
          city: string | null
          company_name: string | null
          company_size: string | null
          company_website: string | null
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          instagram: string | null
          linkedin: string | null
          name: string | null
          networking_interests: string[] | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          phone: string | null
          phone_country_code: string | null
          referrals_count: number | null
          role: string | null
          role_id: string | null
          state: string | null
          successful_referrals_count: number | null
          updated_at: string | null
        }
        Insert: {
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          avatar_url?: string | null
          business_challenges?: string[] | null
          city?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          industry?: string | null
          instagram?: string | null
          linkedin?: string | null
          name?: string | null
          networking_interests?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          phone_country_code?: string | null
          referrals_count?: number | null
          role?: string | null
          role_id?: string | null
          state?: string | null
          successful_referrals_count?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_knowledge_level?: string | null
          annual_revenue?: string | null
          avatar_url?: string | null
          business_challenges?: string[] | null
          city?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          instagram?: string | null
          linkedin?: string | null
          name?: string | null
          networking_interests?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          phone_country_code?: string | null
          referrals_count?: number | null
          role?: string | null
          role_id?: string | null
          state?: string | null
          successful_referrals_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          }
        ]
      }
      progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          module_id: string | null
          progress_data: Json | null
          solution_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          module_id?: string | null
          progress_data?: Json | null
          solution_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          module_id?: string | null
          progress_data?: Json | null
          solution_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: string
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: []
      }
      solutions: {
        Row: {
          category: string | null
          content: Json | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          estimated_implementation_time: string | null
          id: string
          is_published: boolean | null
          prerequisites: string[] | null
          roi_potential: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_implementation_time?: string | null
          id?: string
          is_published?: boolean | null
          prerequisites?: string[] | null
          roi_potential?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_implementation_time?: string | null
          id?: string
          is_published?: boolean | null
          prerequisites?: string[] | null
          roi_potential?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string | null
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string | null
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string | null
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
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
