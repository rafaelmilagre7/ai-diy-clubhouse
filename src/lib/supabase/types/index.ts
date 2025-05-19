
import { Database } from './database.types';

// Tipos de tabelas
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'] & {
  videos?: LearningLessonVideo[];
  resources?: LearningResource[];
  module?: LearningModule;
};

export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'] & {
  is_restricted?: boolean;
  module_count?: number;
  lesson_count?: number;
};
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningLessonTool = Database['public']['Tables']['learning_lesson_tools']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];

export type Solution = Database['public']['Tables']['solutions']['Row'] & {
  videos?: any[];
  checklist?: any[];
  overview?: string;
};

export type Module = Database['public']['Tables']['modules']['Row'] & {
  checklist?: any[];
  videos?: any[];
};

export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  user_roles?: {
    id: string;
    name: string;
    description?: string;
  };
};

export type Referral = Database['public']['Tables']['referrals']['Row'];

// Tipo para formulários de vídeo
export type VideoFormValues = {
  id?: string;
  title: string;
  description?: string;
  url?: string;
  type?: string;
  video_id?: string;
  filePath?: string;
  fileSize?: number;
  duration_seconds?: number;
  thumbnail_url?: string;
  embedCode?: string;
  fileName?: string;
};

// Interface para checklist de usuário
export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// Exportar o tipo UserRole para uso em outros arquivos
export type UserRole = 'admin' | 'member' | 'formacao';

// Outros tipos existentes
export * from './database.types';
