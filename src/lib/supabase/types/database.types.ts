
export type Database = {
  public: {
    Tables: {
      learning_lesson_videos: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          description: string | null;
          url: string;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          created_at: string;
          order_index: number;
          video_type: string | null;
          file_size_bytes: number | null;
          video_file_path: string | null;
          video_file_name: string | null;
          video_id: string | null;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          description?: string | null;
          url: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          order_index: number;
          video_type?: string | null;
          file_size_bytes?: number | null;
          video_file_path?: string | null;
          video_file_name?: string | null;
          video_id?: string | null;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          title?: string;
          description?: string | null;
          url?: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          order_index?: number;
          video_type?: string | null;
          file_size_bytes?: number | null;
          video_file_path?: string | null;
          video_file_name?: string | null;
          video_id?: string | null;
        };
      };
      learning_lessons: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          content: any | null;
          cover_image_url: string | null;
          module_id: string;
          published: boolean;
          created_at: string;
          updated_at: string;
          order_index: number;
          estimated_time_minutes: number | null;
          ai_assistant_enabled: boolean;
          ai_assistant_prompt: string | null;
          difficulty_level: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          content?: any | null;
          cover_image_url?: string | null;
          module_id: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          order_index: number;
          estimated_time_minutes?: number | null;
          ai_assistant_enabled?: boolean;
          ai_assistant_prompt?: string | null;
          difficulty_level?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          content?: any | null;
          cover_image_url?: string | null;
          module_id?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          order_index?: number;
          estimated_time_minutes?: number | null;
          ai_assistant_enabled?: boolean;
          ai_assistant_prompt?: string | null;
          difficulty_level?: string | null;
        };
      };
      learning_modules: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_image_url: string | null;
          course_id: string;
          published: boolean;
          created_at: string;
          updated_at: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_image_url?: string | null;
          course_id: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          order_index: number;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          cover_image_url?: string | null;
          course_id?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          order_index?: number;
        };
      };
      learning_courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_image_url: string | null;
          slug: string;
          published: boolean;
          created_at: string;
          updated_at: string;
          order_index: number;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_image_url?: string | null;
          slug: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          order_index?: number;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          cover_image_url?: string | null;
          slug?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          order_index?: number;
          created_by?: string | null;
        };
      };
      learning_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          progress_percentage: number;
          started_at: string;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          last_position_seconds: number | null;
          video_progress: Record<string, number> | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          progress_percentage?: number;
          started_at?: string;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          last_position_seconds?: number | null;
          video_progress?: Record<string, number> | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          progress_percentage?: number;
          started_at?: string;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          last_position_seconds?: number | null;
          video_progress?: Record<string, number> | null;
        };
      };
      learning_resources: {
        Row: {
          id: string;
          lesson_id: string;
          name: string;
          description: string | null;
          file_url: string;
          file_type: string | null;
          file_size_bytes: number | null;
          created_at: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          name: string;
          description?: string | null;
          file_url: string;
          file_type?: string | null;
          file_size_bytes?: number | null;
          created_at?: string;
          order_index: number;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          name?: string;
          description?: string | null;
          file_url?: string;
          file_type?: string | null;
          file_size_bytes?: number | null;
          created_at?: string;
          order_index?: number;
        };
      };
      learning_lesson_tools: {
        Row: {
          id: string;
          lesson_id: string;
          tool_id: string;
          created_at: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          tool_id: string;
          created_at?: string;
          order_index: number;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          tool_id?: string;
          created_at?: string;
          order_index?: number;
        };
      };
      learning_comments: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
          is_hidden: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
          is_hidden?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
          is_hidden?: boolean;
        };
      };
      // Definição mínima necessária para compilação
      // Outras tabelas seriam adicionadas conforme necessário
    };
  };
};
