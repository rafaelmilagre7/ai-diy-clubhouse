
export interface AulaFormValues {
  id?: string;
  title: string;
  description: string;
  video_id?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  materials?: Material[];
  published?: boolean;
  created_at?: string;
  updated_at?: string;
  author_id?: string;
  module_id?: string;
  position?: number;
  
  // Campos adicionais necessários
  videos?: AulaVideo[];
  objective?: string;
  difficulty?: string;
  estimated_time?: string;
  is_published?: boolean;
  is_featured?: boolean;
}

export interface Material {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  title?: string;
  description?: string;
}

export interface VideoData {
  video_id: string;
  url: string;
  title?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
}

export interface AulaVideo {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: string;
  video_id?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
}
