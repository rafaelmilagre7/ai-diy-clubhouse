
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
      solutions: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty: string;
          published: boolean;
          created_at: string;
          updated_at: string;
          thumbnail_url?: string;
          slug: string;
          tags?: string[];
          estimated_time?: number;
          success_rate?: number;
          related_solutions?: string[];
          author_id?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          difficulty: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          thumbnail_url?: string;
          slug: string;
          tags?: string[];
          estimated_time?: number;
          success_rate?: number;
          related_solutions?: string[];
          author_id?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          difficulty?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          thumbnail_url?: string;
          slug?: string;
          tags?: string[];
          estimated_time?: number;
          success_rate?: number;
          related_solutions?: string[];
          author_id?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          solution_id: string;
          title: string;
          type: string;
          content: any;
          module_order: number;
          created_at: string;
          updated_at: string;
          certificate_template?: any;
          estimated_time_minutes?: number;
          metrics?: any;
        };
        Insert: {
          id?: string;
          solution_id: string;
          title: string;
          type: string;
          content: any;
          module_order: number;
          created_at?: string;
          updated_at?: string;
          certificate_template?: any;
          estimated_time_minutes?: number;
          metrics?: any;
        };
        Update: {
          id?: string;
          solution_id?: string;
          title?: string;
          type?: string;
          content?: any;
          module_order?: number;
          created_at?: string;
          updated_at?: string;
          certificate_template?: any;
          estimated_time_minutes?: number;
          metrics?: any;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name?: string;
          avatar_url?: string;
          role: string;
          company_name?: string;
          industry?: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          avatar_url?: string;
          role?: string;
          company_name?: string;
          industry?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          role?: string;
          company_name?: string;
          industry?: string;
          created_at?: string;
        };
      };
      solution_resources: {
        Row: {
          id: string;
          solution_id?: string;
          name: string;
          type: string;
          url: string;
          format?: string;
          module_id?: string;
          size?: number;
          created_at?: string;
          updated_at?: string;
          metadata?: any;
        };
        Insert: {
          id?: string;
          solution_id?: string;
          name: string;
          type: string;
          url: string;
          format?: string;
          module_id?: string;
          size?: number;
          created_at?: string;
          updated_at?: string;
          metadata?: any;
        };
        Update: {
          id?: string;
          solution_id?: string;
          name?: string;
          type?: string;
          url?: string;
          format?: string;
          module_id?: string;
          size?: number;
          created_at?: string;
          updated_at?: string;
          metadata?: any;
        };
      };
      solution_tools: {
        Row: {
          id: string;
          solution_id?: string;
          tool_name: string;
          tool_url?: string;
          is_required?: boolean;
          created_at?: string;
        };
        Insert: {
          id?: string;
          solution_id?: string;
          tool_name: string;
          tool_url?: string;
          is_required?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          solution_id?: string;
          tool_name?: string;
          tool_url?: string;
          is_required?: boolean;
          created_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          image_url: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          image_url: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          image_url?: string;
          category?: string;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          solution_id: string;
          current_module: number;
          is_completed: boolean;
          completed_modules?: number[];
          last_activity: string;
          created_at: string;
          completed_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          solution_id: string;
          current_module?: number;
          is_completed?: boolean;
          completed_modules?: number[];
          last_activity?: string;
          created_at?: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          solution_id?: string;
          current_module?: number;
          is_completed?: boolean;
          completed_modules?: number[];
          last_activity?: string;
          created_at?: string;
          completed_at?: string;
        };
      };
      implementation_checkpoints: {
        Row: {
          id: string;
          solution_id?: string;
          description: string;
          checkpoint_order: number;
          created_at?: string;
        };
        Insert: {
          id?: string;
          solution_id?: string;
          description: string;
          checkpoint_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          solution_id?: string;
          description?: string;
          checkpoint_order?: number;
          created_at?: string;
        };
      };
      implementation_profiles: {
        Row: {
          id: string;
          user_id?: string;
          company_name?: string;
          company_website?: string;
          company_sector?: string;
          company_size?: string;
          annual_revenue?: string;
          current_position?: string;
          city?: string;
          state?: string;
          country?: string;
          phone?: string;
          phone_country_code?: string;
          email?: string;
          name?: string;
          linkedin?: string;
          instagram?: string;
          business_challenges?: string[];
          primary_goal?: string;
          networking_interests?: string[];
          weekly_availability?: string;
          nps_score?: number;
          ai_knowledge_level?: number;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          company_name?: string;
          company_website?: string;
          company_sector?: string;
          company_size?: string;
          annual_revenue?: string;
          current_position?: string;
          city?: string;
          state?: string;
          country?: string;
          phone?: string;
          phone_country_code?: string;
          email?: string;
          name?: string;
          linkedin?: string;
          instagram?: string;
          business_challenges?: string[];
          primary_goal?: string;
          networking_interests?: string[];
          weekly_availability?: string;
          nps_score?: number;
          ai_knowledge_level?: number;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          company_website?: string;
          company_sector?: string;
          company_size?: string;
          annual_revenue?: string;
          current_position?: string;
          city?: string;
          state?: string;
          country?: string;
          phone?: string;
          phone_country_code?: string;
          email?: string;
          name?: string;
          linkedin?: string;
          instagram?: string;
          business_challenges?: string[];
          primary_goal?: string;
          networking_interests?: string[];
          weekly_availability?: string;
          nps_score?: number;
          ai_knowledge_level?: number;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      implementation_trails: {
        Row: {
          id: string;
          user_id: string;
          trail_data: any;
          status: string;
          error_message?: string;
          generation_attempts: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trail_data: any;
          status?: string;
          error_message?: string;
          generation_attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          trail_data?: any;
          status?: string;
          error_message?: string;
          generation_attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
