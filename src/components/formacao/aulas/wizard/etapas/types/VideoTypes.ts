
export interface VideoFormValues {
  id?: string;
  title?: string; // Alterado para opcional para compatibilidade com o código existente
  description?: string;
  url: string; // Mantido como obrigatório conforme requisitos implícitos
  type?: string;
  video_id?: string;
  filePath?: string;
  fileSize?: number;
  duration_seconds?: number;
  thumbnail_url?: string;
  embedCode?: string;
  fileName?: string;
}
