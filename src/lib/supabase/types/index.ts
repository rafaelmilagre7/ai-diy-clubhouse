
import { Database } from './database.types';

// Tipos de tabelas com campos adicionais
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'] & {
  ai_assistant_id?: string; // Novo campo adicionado na migração
};
export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningLessonTool = Database['public']['Tables']['learning_lesson_tools']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];

// Outros tipos existentes
export * from './database.types';
