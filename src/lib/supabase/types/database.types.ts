
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
        };
      };
      // Definição mínima necessária para compilação
      // Outras tabelas seriam adicionadas conforme necessário
    };
  };
};
