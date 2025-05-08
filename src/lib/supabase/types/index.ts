
import { Database } from './database.types';

// Tipos de tabelas
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'];
export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningLessonTool = Database['public']['Tables']['learning_lesson_tools']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];
export type Progress = Database['public']['Tables']['progress']['Row'];
export type Solution = Database['public']['Tables']['solutions']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type ImplementationCheckpoint = Database['public']['Tables']['implementation_checkpoints']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type SolutionResource = Database['public']['Tables']['solution_resources']['Row'];

// Adicionando tipo Tool temporário para resolver o erro
export interface Tool {
  id: string;
  name: string;
  description: string;
  official_url: string;
  category: string;
  logo_url: string | null;
  video_url: string | null;
  video_type: string | null;
  tags: string[];
  status: boolean;
  created_at: string;
  updated_at: string;
  has_member_benefit: boolean;
  benefit_title: string | null;
  benefit_description: string | null;
  benefit_link: string | null;
  benefit_badge_url: string | null;
  benefit_type: string | null;
  benefit_clicks: number;
  video_tutorials: any[];
}

// Outros tipos existentes
export * from './database.types';
