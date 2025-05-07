
export interface AulaFormValues {
  id?: string;
  title: string;
  description: string;
  video_id?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  materials?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size?: number;
  }[];
  published?: boolean;
  created_at?: string;
  updated_at?: string;
  author_id?: string;
  module_id?: string;
  position?: number;
}

export interface Material {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface VideoData {
  video_id: string;
  url: string;
  title?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
}
