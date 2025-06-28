export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          company_name: string | null;
          industry: string | null;
          role_id: string | null;
          role: string | null;
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
          phone_country_code: string | null;
          onboarding_completed: boolean | null;
          onboarding_completed_at: string | null;
          referrals_count: number;
          successful_referrals_count: number;
          business_challenges: string[] | null;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          company_name?: string | null;
          industry?: string | null;
          role_id?: string | null;
          role?: string | null;
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
          phone_country_code?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          referrals_count?: number;
          successful_referrals_count?: number;
          business_challenges?: string[] | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          company_name?: string | null;
          industry?: string | null;
          role_id?: string | null;
          role?: string | null;
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
          phone_country_code?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          referrals_count?: number;
          successful_referrals_count?: number;
          business_challenges?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey";
            columns: ["role_id"];
            referencedRelation: "user_roles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          permissions: Json | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          permissions?: Json | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          permissions?: Json | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      solution_resources: {
        Row: {
          id: string;
          solution_id: string;
          name: string;
          description: string | null;
          url: string;
          type: string;
          format: string | null;
          size: number | null;
          metadata: Json | null;
          module_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          solution_id: string;
          name: string;
          description?: string | null;
          url: string;
          type: string;
          format?: string | null;
          size?: number | null;
          metadata?: Json | null;
          module_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          solution_id?: string;
          name?: string;
          description?: string | null;
          url?: string;
          type?: string;
          format?: string | null;
          size?: number | null;
          metadata?: Json | null;
          module_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "solution_resources_solution_id_fkey";
            columns: ["solution_id"];
            referencedRelation: "solutions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "solution_resources_module_id_fkey";
            columns: ["module_id"];
            referencedRelation: "modules";
            referencedColumns: ["id"];
          }
        ];
      };
      solutions: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty: string;
          estimated_time: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          published: boolean;
          tags: string[] | null;
          cover_image_url: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          difficulty?: string;
          estimated_time?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          published?: boolean;
          tags?: string[] | null;
          cover_image_url?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          difficulty?: string;
          estimated_time?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          published?: boolean;
          tags?: string[] | null;
          cover_image_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "solutions_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      modules: {
        Row: {
          id: string;
          solution_id: string;
          title: string;
          content: Json;
          type: string;
          module_order: number;
          estimated_time_minutes: number | null;
          metrics: Json | null;
          certificate_template: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          solution_id: string;
          title: string;
          content: Json;
          type: string;
          module_order: number;
          estimated_time_minutes?: number | null;
          metrics?: Json | null;
          certificate_template?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          solution_id?: string;
          title?: string;
          content?: Json;
          type?: string;
          module_order?: number;
          estimated_time_minutes?: number | null;
          metrics?: Json | null;
          certificate_template?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modules_solution_id_fkey";
            columns: ["solution_id"];
            referencedRelation: "solutions";
            referencedColumns: ["id"];
          }
        ];
      };
      learning_courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          slug: string;
          cover_image_url: string | null;
          published: boolean | null;
          order_index: number | null;
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
          published?: boolean | null;
          order_index?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          slug?: string;
          cover_image_url?: string | null;
          published?: boolean | null;
          order_index?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_courses_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      implementation_checkpoints: {
        Row: {
          id: string;
          solution_id: string | null;
          description: string;
          checkpoint_order: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          solution_id?: string | null;
          description: string;
          checkpoint_order: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          solution_id?: string | null;
          description?: string;
          checkpoint_order?: number;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "implementation_checkpoints_solution_id_fkey";
            columns: ["solution_id"];
            referencedRelation: "solutions";
            referencedColumns: ["id"];
          }
        ];
      };
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
          email_subject: string | null;
          scheduled_for: string | null;
          sent_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          metadata: Json;
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
          email_subject?: string | null;
          scheduled_for?: string | null;
          sent_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
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
          email_subject?: string | null;
          scheduled_for?: string | null;
          sent_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "admin_communications_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      analytics: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          solution_id: string | null;
          module_id: string | null;
          event_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          solution_id?: string | null;
          module_id?: string | null;
          event_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          solution_id?: string | null;
          module_id?: string | null;
          event_data?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          action: string;
          resource_id: string | null;
          details: Json | null;
          severity: string | null;
          timestamp: string | null;
          ip_address: string | null;
          user_agent: string | null;
          session_id: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          action: string;
          resource_id?: string | null;
          details?: Json | null;
          severity?: string | null;
          timestamp?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          session_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_type?: string;
          action?: string;
          resource_id?: string | null;
          details?: Json | null;
          severity?: string | null;
          timestamp?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          session_id?: string | null;
        };
        Relationships: [];
      };
      course_access_control: {
        Row: {
          id: string;
          course_id: string | null;
          role_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          course_id?: string | null;
          role_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          course_id?: string | null;
          role_id?: string | null;
          created_at?: string | null;
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
          is_recurring: boolean | null;
          recurrence_pattern: string | null;
          recurrence_interval: number | null;
          recurrence_day: number | null;
          recurrence_count: number | null;
          recurrence_end_date: string | null;
          parent_event_id: string | null;
          created_by: string;
          created_at: string;
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
          is_recurring?: boolean | null;
          recurrence_pattern?: string | null;
          recurrence_interval?: number | null;
          recurrence_day?: number | null;
          recurrence_count?: number | null;
          recurrence_end_date?: string | null;
          parent_event_id?: string | null;
          created_by: string;
          created_at?: string;
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
          is_recurring?: boolean | null;
          recurrence_pattern?: string | null;
          recurrence_interval?: number | null;
          recurrence_day?: number | null;
          recurrence_count?: number | null;
          recurrence_end_date?: string | null;
          parent_event_id?: string | null;
          created_by?: string;
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
