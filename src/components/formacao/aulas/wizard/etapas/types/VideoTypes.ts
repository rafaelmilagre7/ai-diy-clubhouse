
export interface VideoFormValues {
  id?: string;
  title: string; // Alterado para obrigatório conforme esperado pelo componente
  description?: string;
  url: string; // Também obrigatório conforme requisitos implícitos
  type?: string;
  video_id?: string;
  filePath?: string;
  fileSize?: number;
  duration_seconds?: number;
  thumbnail_url?: string;
  embedCode?: string;
  fileName?: string;
}
