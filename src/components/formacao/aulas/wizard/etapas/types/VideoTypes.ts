
export interface VideoFormValues {
  id?: string;
  title?: string;  // Alterado para opcional
  description?: string;
  url: string;     // Mantido como obrigatório
  type?: string;
  video_id?: string;
  filePath?: string;
  fileSize?: number;
  duration_seconds?: number;
  thumbnail_url?: string;
  embedCode?: string;
  fileName?: string;
}
