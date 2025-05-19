
export interface VideoFormValues {
  id?: string;
  title?: string;  // Tornando opcional para compatibilidade
  description?: string;
  url?: string;    // Tornando opcional para compatibilidade
  type?: string;
  video_id?: string;
  filePath?: string;
  fileSize?: number;
  duration_seconds?: number;
  thumbnail_url?: string;
  embedCode?: string;
  fileName?: string;
}
