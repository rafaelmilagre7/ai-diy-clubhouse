
// Adicionar ao arquivo de definição de tipos do TS
export interface LearningProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percentage: number;
  video_progress: Record<string, number>; // Novo campo para progresso individual de vídeos
  started_at: string;
  completed_at: string | null;
  last_position_seconds?: number;
  updated_at: string;
  created_at: string;
  notes?: string | null;
}
