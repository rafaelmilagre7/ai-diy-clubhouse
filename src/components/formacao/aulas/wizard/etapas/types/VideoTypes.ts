
export interface VideoFormValues {
  id?: string;
  title?: string;  // Mantendo como opcional para ser compatível com o uso atual
  description?: string;
  url?: string;    // Tornando opcional também para compatibilidade
  type?: string;
  video_id?: string;
  filePath?: string;
  fileSize?: number;
  duration_seconds?: number;
  thumbnail_url?: string;
  embedCode?: string;
  fileName?: string;
}
