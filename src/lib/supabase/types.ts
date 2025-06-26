
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          company_name: string | null;
          industry: string | null;
          role_id: string | null;
          role?: string | null;
          created_at: string;
          onboarding_completed: boolean;
          onboarding_completed_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          avatar_url?: string | null;
          company_name?: string | null;
          industry?: string | null;
          role_id?: string | null;
          role?: string | null;
          created_at?: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          company_name?: string | null;
          industry?: string | null;
          role_id?: string | null;
          role?: string | null;
          created_at?: string;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
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
          permissions: Record<string, any> | null;
          is_system: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          permissions?: Record<string, any> | null;
          is_system?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          permissions?: Record<string, any> | null;
          is_system?: boolean;
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
          published: boolean;
          created_at: string;
          updated_at: string;
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
        };
        Relationships: [];
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          solution_id: string;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          solution_id: string;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          solution_id?: string;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_time: string;
          end_time: string;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          start_time: string;
          end_time: string;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_time?: string;
          end_time?: string;
          location?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      analytics: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          event_data: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          event_data: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          event_data?: Record<string, any>;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description: string;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          content: string;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          content?: string;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_lesson_videos: {
        Row: {
          id: string;
          lesson_id: string;
          video_url: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          video_url: string;
          title: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          video_url?: string;
          title?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_resources: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          url: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          url: string;
          type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          title?: string;
          url?: string;
          type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_lesson_tools: {
        Row: {
          id: string;
          lesson_id: string;
          tool_name: string;
          tool_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          tool_name: string;
          tool_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          tool_name?: string;
          tool_url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      learning_comments: {
        Row: {
          id: string;
          lesson_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          user_id?: string;
          content?: string;
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
};

export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  user_roles?: Database['public']['Tables']['user_roles']['Row'];
};

export type Solution = Database['public']['Tables']['solutions']['Row'];
