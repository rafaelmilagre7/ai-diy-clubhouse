
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
export type Solution = Database['public']['Tables']['solutions']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type Referral = Database['public']['Tables']['referrals']['Row'];
export type UserProfile = Database['public']['Tables']['profiles']['Row'];

// Tipos para formulários
export type VideoFormValues = {
  title: string;
  description?: string;
  url: string;
  type: 'youtube' | 'panda' | 'direct';
  duration?: number;
  thumbnail_url?: string;
};

// Outros tipos existentes
export * from './database.types';
