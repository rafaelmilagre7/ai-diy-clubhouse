
// Interfaces para tipos de dados compartilhados entre componentes de aula
export interface AulaVideo {
  id?: string;
  title: string;
  description?: string;
  url: string;
  type: "youtube" | "panda";
  video_id?: string; // ID do vídeo no Panda Video
  thumbnail_url?: string; // URL da miniatura do vídeo
  duration_seconds?: number; // Duração do vídeo em segundos
}

export interface AulaMaterial {
  id?: string;
  title: string;
  description?: string;
  url: string;
  type: string; // "pdf", "doc", "image", etc.
  file_size?: number;
}

export interface AulaFormValues {
  title: string;
  description?: string;
  objective?: string;
  difficulty: string;
  estimated_time?: string;
  thumbnail_url?: string;
  videos: AulaVideo[];
  materials?: AulaMaterial[];
  is_published?: boolean;
  is_featured?: boolean;
}
