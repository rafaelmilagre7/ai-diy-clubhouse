
// Tipos simplificados para funcionalidade básica de learning progress
export interface LearningProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percentage: number;
  video_progress: Record<string, number>; // Campo para progresso individual de vídeos
  started_at: string;
  completed_at: string | null;
  last_position_seconds?: number;
  updated_at: string;
  created_at: string;
  notes?: string | null;
}
