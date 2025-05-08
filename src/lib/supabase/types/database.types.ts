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
      learning_courses: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          order_index: number
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          order_index?: number
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          order_index?: number
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          lesson_id: string
          likes_count: number
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          lesson_id: string
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          lesson_id?: string
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_lessons: {
        Row: {
          ai_assistant_enabled: boolean
          ai_assistant_prompt: string | null
          content: Json | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          estimated_time_minutes: number | null
          id: string
          module_id: string
          order_index: number
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          ai_assistant_enabled?: boolean
          ai_assistant_prompt?: string | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          module_id: string
          order_index: number
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          ai_assistant_enabled?: boolean
          ai_assistant_prompt?: string | null
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          module_id?: string
          order_index?: number
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_lesson_videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          lesson_id: string
          order_index: number
          thumbnail_url: string | null
          title: string
          url: string
          video_file_name: string | null
          video_file_path: string | null
          video_id: string | null
          video_type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          lesson_id: string
          order_index: number
          thumbnail_url?: string | null
          title: string
          url: string
          video_file_name?: string | null
          video_file_path?: string | null
          video_id?: string | null
          video_type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          lesson_id?: string
          order_index?: number
          thumbnail_url?: string | null
          title?: string
          url?: string
          video_file_name?: string | null
          video_file_path?: string | null
          video_id?: string | null
          video_type?: string | null
        }
        Relationships: []
      }
      learning_modules: {
        Row: {
          course_id: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          order_index: number
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_position_seconds: number | null
          lesson_id: string
          notes: string | null
          progress_percentage: number
          started_at: string
          updated_at: string
          user_id: string
          video_progress: Json
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position_seconds?: number | null
          lesson_id: string
          notes?: string | null
          progress_percentage?: number
          started_at?: string
          updated_at?: string
          user_id: string
          video_progress?: Json
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position_seconds?: number | null
          lesson_id?: string
          notes?: string | null
          progress_percentage?: number
          started_at?: string
          updated_at?: string
          user_id?: string
          video_progress?: Json
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          created_at: string
          description: string | null
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id: string
          name: string
          order_index: number
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      learning_lesson_tools: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lesson_id: string
          name: string
          order_index: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lesson_id: string
          name: string
          order_index: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lesson_id?: string
          name?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      implementation_checkpoints: {
        Row: {
          checkpoint_order: number
          created_at: string
          id: string
          description: string
          solution_id: string | null
        }
        Insert: {
          checkpoint_order: number
          created_at?: string
          id?: string
          description: string
          solution_id?: string | null
        }
        Update: {
          checkpoint_order?: number
          created_at?: string
          id?: string
          description?: string
          solution_id?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          certificate_template: Json | null
          content: Json
          created_at: string
          estimated_time_minutes: number | null
          id: string
          metrics: Json | null
          module_order: number
          solution_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          certificate_template?: Json | null
          content: Json
          created_at?: string
          estimated_time_minutes?: number | null
          id?: string
          metrics?: Json | null
          module_order: number
          solution_id: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          certificate_template?: Json | null
          content?: Json
          created_at?: string
          estimated_time_minutes?: number | null
          id?: string
          metrics?: Json | null
          module_order?: number
          solution_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          id: string
          industry: string | null
          name: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          id: string
          industry?: string | null
          name?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          name?: string | null
          role?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          last_activity: string
          created_at: string
          completed_modules: number[] | null
          completion_data: Json | null
          id: string
          implementation_status: string | null
          user_id: string
          solution_id: string
          current_module: number
          is_completed: boolean
          completed_at: string | null
        }
        Insert: {
          last_activity?: string
          created_at?: string
          completed_modules?: number[] | null
          completion_data?: Json | null
          id?: string
          implementation_status?: string | null
          user_id: string
          solution_id: string
          current_module: number
          is_completed: boolean
          completed_at?: string | null
        }
        Update: {
          last_activity?: string
          created_at?: string
          completed_modules?: number[] | null
          completion_data?: Json | null
          id?: string
          implementation_status?: string | null
          user_id?: string
          solution_id?: string
          current_module?: number
          is_completed?: boolean
          completed_at?: string | null
        }
        Relationships: []
      }
      solutions: {
        Row: {
          category: string
          checklist_items: Json[]
          completion_requirements: Json
          created_at: string
          description: string
          difficulty: string
          estimated_time: number | null
          id: string
          implementation_steps: Json[]
          published: boolean
          related_solutions: string[]
          slug: string
          success_rate: number
          tags: string[]
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          checklist_items?: Json[]
          completion_requirements?: Json
          created_at?: string
          description: string
          difficulty: string
          estimated_time?: number | null
          id?: string
          implementation_steps?: Json[]
          published?: boolean
          related_solutions?: string[]
          slug: string
          success_rate?: number
          tags?: string[]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          checklist_items?: Json[]
          completion_requirements?: Json
          created_at?: string
          description?: string
          difficulty?: string
          estimated_time?: number | null
          id?: string
          implementation_steps?: Json[]
          published?: boolean
          related_solutions?: string[]
          slug?: string
          success_rate?: number
          tags?: string[]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          physical_location: string | null
          start_time: string
          id: string
          location_link: string | null
          cover_image_url: string | null
          title: string
          end_time: string
          created_by: string
          created_at: string
          description: string | null
        }
        Insert: {
          physical_location?: string | null
          start_time: string
          id?: string
          location_link?: string | null
          cover_image_url?: string | null
          title: string
          end_time: string
          created_by: string
          created_at?: string
          description?: string | null
        }
        Update: {
          physical_location?: string | null
          start_time?: string
          id?: string
          location_link?: string | null
          cover_image_url?: string | null
          title?: string
          end_time?: string
          created_by?: string
          created_at?: string
          description?: string | null
        }
        Relationships: []
      }
      solution_resources: {
        Row: {
          id: string
          format: string | null
          url: string
          name: string
          type: string
          solution_id: string | null
          module_id: string | null
          size: number | null
          created_at: string
          updated_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          format?: string | null
          url: string
          name: string
          type: string
          solution_id?: string | null
          module_id?: string | null
          size?: number | null
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          format?: string | null
          url?: string
          name?: string
          type?: string
          solution_id?: string | null
          module_id?: string | null
          size?: number | null
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      // Definições de visualizações...
    }
    Functions: {
      // Definições de funções...
    }
  }
}
