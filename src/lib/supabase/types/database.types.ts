
export interface Database {
  public: {
    Tables: {
      admin_communications: {
        Row: {
          id: string;
          title: string;
          content: string;
          content_type: string;
          priority: string;
          template_type: string;
          status: string;
          delivery_channels: string[];
          target_roles: string[];
          scheduled_for: string;
          created_at: string;
          created_by: string;
          sent_at: string | null;
          metadata: Json;
          updated_at: string;
          email_subject: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          content_type?: string;
          priority?: string;
          template_type?: string;
          status?: string;
          delivery_channels?: string[];
          target_roles: string[];
          scheduled_for?: string;
          created_at?: string;
          created_by: string;
          sent_at?: string | null;
          metadata?: Json;
          updated_at?: string;
          email_subject?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          content_type?: string;
          priority?: string;
          template_type?: string;
          status?: string;
          delivery_channels?: string[];
          target_roles?: string[];
          scheduled_for?: string;
          created_at?: string;
          created_by?: string;
          sent_at?: string | null;
          metadata?: Json;
          updated_at?: string;
          email_subject?: string | null;
        };
        Relationships: [];
      };
      analytics: {
        Row: {
          id: string;
          created_at: string;
          event_type: string;
          user_id: string;
          solution_id: string | null;
          module_id: string | null;
          event_data: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          event_type: string;
          user_id: string;
          solution_id?: string | null;
          module_id?: string | null;
          event_data?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          event_type?: string;
          user_id?: string;
          solution_id?: string | null;
          module_id?: string | null;
          event_data?: Json | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          timestamp: string;
          session_id: string | null;
          details: Json;
          user_agent: string | null;
          action: string;
          resource_id: string | null;
          ip_address: string | null;
          event_type: string;
          severity: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          timestamp?: string;
          session_id?: string | null;
          details?: Json;
          user_agent?: string | null;
          action: string;
          resource_id?: string | null;
          ip_address?: string | null;
          event_type: string;
          severity?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          timestamp?: string;
          session_id?: string | null;
          details?: Json;
          user_agent?: string | null;
          action?: string;
          resource_id?: string | null;
          ip_address?: string | null;
          event_type?: string;
          severity?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          location_link: string | null;
          physical_location: string | null;
          cover_image_url: string | null;
          created_by: string;
          created_at: string;
          is_recurring: boolean;
          recurrence_pattern: string | null;
          recurrence_interval: number | null;
          recurrence_day: number | null;
          recurrence_count: number | null;
          recurrence_end_date: string | null;
          parent_event_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          location_link?: string | null;
          physical_location?: string | null;
          cover_image_url?: string | null;
          created_by: string;
          created_at?: string;
          is_recurring?: boolean;
          recurrence_pattern?: string | null;
          recurrence_interval?: number | null;
          recurrence_day?: number | null;
          recurrence_count?: number | null;
          recurrence_end_date?: string | null;
          parent_event_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          location_link?: string | null;
          physical_location?: string | null;
          cover_image_url?: string | null;
          created_by?: string;
          created_at?: string;
          is_recurring?: boolean;
          recurrence_pattern?: string | null;
          recurrence_interval?: number | null;
          recurrence_day?: number | null;
          recurrence_count?: number | null;
          recurrence_end_date?: string | null;
          parent_event_id?: string | null;
        };
        Relationships: [];
      };
      implementation_checkpoints: {
        Row: {
          id: string;
          solution_id: string | null;
          checkpoint_order: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          solution_id?: string | null;
          checkpoint_order: number;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          solution_id?: string | null;
          checkpoint_order?: number;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          solution_id: string;
          title: string;
          type: string;
          content: Json;
          module_order: number;
          estimated_time_minutes: number;
          metrics: Json;
          certificate_template: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          solution_id: string;
          title: string;
          type: string;
          content: Json;
          module_order: number;
          estimated_time_minutes?: number;
          metrics?: Json;
          certificate_template?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          solution_id?: string;
          title?: string;
          type?: string;
          content?: Json;
          module_order?: number;
          estimated_time_minutes?: number;
          metrics?: Json;
          certificate_template?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          email_enabled: boolean;
          whatsapp_enabled: boolean;
          admin_communications_inapp: boolean;
          admin_communications_email: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_enabled?: boolean;
          whatsapp_enabled?: boolean;
          admin_communications_inapp?: boolean;
          admin_communications_email?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_enabled?: boolean;
          whatsapp_enabled?: boolean;
          admin_communications_inapp?: boolean;
          admin_communications_email?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role_id: string;
          avatar_url: string | null;
          company_name: string | null;
          industry: string | null;
          created_at: string;
          updated_at: string;
          phone: string | null;
          instagram: string | null;
          linkedin: string | null;
          state: string | null;
          city: string | null;
          company_website: string | null;
          company_size: string | null;
          annual_revenue: string | null;
          ai_knowledge_level: string | null;
          networking_interests: string[] | null;
          phone_country_code: string | null;
          role: string | null;
          onboarding_completed: boolean;
          onboarding_completed_at: string | null;
          referrals_count: number;
          successful_referrals_count: number;
          business_challenges: string[] | null;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          role_id: string;
          avatar_url?: string | null;
          company_name?: string | null;
          industry?: string | null;
          created_at?: string;
          updated_at?: string;
          phone?: string | null;
          instagram?: string | null;
          linkedin?: string | null;
          state?: string | null;
          city?: string | null;
          company_website?: string | null;
          company_size?: string | null;
          annual_revenue?: string | null;
          ai_knowledge_level?: string | null;
          networking_interests?: string[] | null;
          phone_country_code?: string | null;
          role?: string | null;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          referrals_count?: number;
          successful_referrals_count?: number;
          business_challenges?: string[] | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role_id?: string;
          avatar_url?: string | null;
          company_name?: string | null;
          industry?: string | null;
          created_at?: string;
          updated_at?: string;
          phone?: string | null;
          instagram?: string | null;
          linkedin?: string | null;
          state?: string | null;
          city?: string | null;
          company_website?: string | null;
          company_size?: string | null;
          annual_revenue?: string | null;
          ai_knowledge_level?: string | null;
          networking_interests?: string[] | null;
          phone_country_code?: string | null;
          role?: string | null;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          referrals_count?: number;
          successful_referrals_count?: number;
          business_challenges?: string[] | null;
        };
        Relationships: [];
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          solution_id: string;
          module_id: string;
          progress_percentage: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          solution_id: string;
          module_id: string;
          progress_percentage?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          solution_id?: string;
          module_id?: string;
          progress_percentage?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      solutions: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty: string;
          estimated_time_hours: number;
          thumbnail_url: string | null;
          published: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          difficulty: string;
          estimated_time_hours?: number;
          thumbnail_url?: string | null;
          published?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          difficulty?: string;
          estimated_time_hours?: number;
          thumbnail_url?: string | null;
          published?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          slug: string;
          cover_image_url: string | null;
          published: boolean;
          order_index: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          slug: string;
          cover_image_url?: string | null;
          published?: boolean;
          order_index?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          slug?: string;
          cover_image_url?: string | null;
          published?: boolean;
          order_index?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      course_access_control: {
        Row: {
          id: string;
          course_id: string | null;
          role_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id?: string | null;
          role_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string | null;
          role_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      permission_definitions: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          category: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          category?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
        };
        Relationships: [];
      };
      onboarding_analytics: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          event_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          event_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          event_data?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
