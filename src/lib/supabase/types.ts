
import { Database } from './types/database.types';

// Tipos de tabelas expandidos
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'] & {
  videos?: LearningLessonVideo[];
  resources?: LearningResource[];
  module?: LearningModule & {
    course_id?: string;
    learning_courses?: LearningCourse;
  };
  ai_assistant_id?: string | null;
};

export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'] & {
  module_count?: number;
  lesson_count?: number;
  is_restricted?: boolean;
};
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningLessonTool = Database['public']['Tables']['learning_lesson_tools']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];

// Outros tipos existentes
export * from './types/database.types';

export type UserRole = 'admin' | 'formacao' | 'membro_club';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  industry: string | null;
  role: UserRole;
  role_id?: string;
  user_roles?: any;
  created_at: string;
}

// Interface expandida para incluir todas as propriedades utilizadas no código
export interface Solution {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: 'Receita' | 'Operacional' | 'Estratégia';
  image_url?: string;
  thumbnail_url?: string;
  author_id?: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  slug: string;
  status?: string;
  completion_percentage?: number;
  overview?: string;
  estimated_time?: number;
  success_rate?: number;
  tags?: string[];
  videos?: any[];
  checklist?: any[];
  module_order?: number;
  related_solutions?: string[];
}

export interface Module {
  id: string;
  solution_id: string;
  title: string;
  description?: string;
  order: number;
  module_order?: number;
  type: string;
  content?: any;
  created_at: string;
  updated_at: string;
  completed?: boolean;
}

// Adicionando interfaces faltantes
export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completed_modules: number[];
  completed_at?: string;
  last_activity: string;
  created_at: string;
}

export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface LearningCertificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string | null;
  created_at: string;
  issued_at: string;
}

// Interface específica para formulários que lidam com vídeos
export interface VideoFormValues {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  duration_seconds?: number;
  video_id?: string;
  thumbnail_url?: string;
  order_index?: number;
}

export interface LearningLessonNps {
  id: string;
  user_id: string;
  lesson_id: string;
  score: number;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}
