
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
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          company_name: string | null
          industry: string | null
          role_id: string | null
          role: string | null // Campo legado - mantido para compatibilidade
          created_at: string
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          referrals_count: number | null
          successful_referrals_count: number | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          role_id?: string | null
          role?: string | null
          created_at?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          referrals_count?: number | null
          successful_referrals_count?: number | null
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
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          referrals_count?: number | null
          successful_referrals_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_role_id"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          }
        ]
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
          slug: string
          thumbnail_url: string | null
          published: boolean
          created_at: string
          updated_at: string
          category: string
          difficulty: string
          tags: string[] | null
          related_solutions: string[] | null
          implementation_steps: Json | null
          checklist_items: Json | null
          completion_requirements: Json | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          slug: string
          thumbnail_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
          category: string
          difficulty: string
          tags?: string[] | null
          related_solutions?: string[] | null
          implementation_steps?: Json | null
          checklist_items?: Json | null
          completion_requirements?: Json | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          slug?: string
          thumbnail_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
          category?: string
          difficulty?: string
          tags?: string[] | null
          related_solutions?: string[] | null
          implementation_steps?: Json | null
          checklist_items?: Json | null
          completion_requirements?: Json | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          id: string
          user_id: string
          solution_id: string
          current_module: number
          is_completed: boolean
          completed_modules: number[]
          completed_at: string | null
          last_activity: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          solution_id: string
          current_module?: number
          is_completed?: boolean  
          completed_modules?: number[]
          completed_at?: string | null
          last_activity?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          solution_id?: string
          current_module?: number
          is_completed?: boolean
          completed_modules?: number[]
          completed_at?: string | null
          last_activity?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_courses: {
        Row: {
          id: string
          title: string
          description: string | null
          slug: string
          cover_image_url: string | null
          published: boolean
          created_by: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          slug: string
          cover_image_url?: string | null
          published?: boolean
          created_by?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          slug?: string
          cover_image_url?: string | null
          published?: boolean
          created_by?: string | null
          order_index?: number
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
          published: boolean
          cover_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index?: number
          published?: boolean
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          published?: boolean
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "learning_courses"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string | null
          content: Json | null
          order_index: number
          published: boolean
          cover_image_url: string | null
          estimated_time_minutes: number
          difficulty_level: string
          ai_assistant_enabled: boolean
          ai_assistant_prompt: string | null
          ai_assistant_id: string | null
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
          published?: boolean
          cover_image_url?: string | null
          estimated_time_minutes?: number
          difficulty_level?: string
          ai_assistant_enabled?: boolean
          ai_assistant_prompt?: string | null
          ai_assistant_id?: string | null
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
          published?: boolean
          cover_image_url?: string | null
          estimated_time_minutes?: number
          difficulty_level?: string
          ai_assistant_enabled?: boolean
          ai_assistant_prompt?: string | null
          ai_assistant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          }
        ]
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
          video_file_path: string | null
          video_file_name: string | null
          file_size_bytes: number | null
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
          order_index?: number
          video_type?: string
          video_file_path?: string | null
          video_file_name?: string | null
          file_size_bytes?: number | null
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
          video_file_path?: string | null
          video_file_name?: string | null
          file_size_bytes?: number | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_lesson_videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          progress_percentage: number
          video_progress: Json
          started_at: string
          completed_at: string | null
          last_position_seconds: number
          updated_at: string
          created_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          progress_percentage?: number
          video_progress?: Json
          started_at?: string
          completed_at?: string | null
          last_position_seconds?: number
          updated_at?: string
          created_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          progress_percentage?: number
          video_progress?: Json
          started_at?: string
          completed_at?: string | null
          last_position_seconds?: number
          updated_at?: string
          created_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_resources: {
        Row: {
          id: string
          lesson_id: string | null
          name: string
          description: string | null
          file_url: string
          file_type: string | null
          file_size_bytes: number | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          name: string
          description?: string | null
          file_url: string
          file_type?: string | null
          file_size_bytes?: number | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string | null
          name?: string
          description?: string | null
          file_url?: string
          file_type?: string | null
          file_size_bytes?: number | null
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_comments: {
        Row: {
          id: string
          user_id: string  
          lesson_id: string
          content: string
          parent_id: string | null
          likes_count: number
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          content: string
          parent_id?: string | null
          likes_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          content?: string
          parent_id?: string | null
          likes_count?: number
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]  
      }
      learning_lesson_tools: {
        Row: {
          id: string
          lesson_id: string
          tool_id: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          tool_id: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          tool_id?: string
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_lesson_tools_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_lesson_nps: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          score: number
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          score: number
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          score?: number
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_lesson_nps_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_lesson_nps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
