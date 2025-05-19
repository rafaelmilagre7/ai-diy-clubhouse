
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
};

export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'] & {
  video_progress?: Record<string, number>; // Para compatibilidade com o campo adicionado
};

export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningLessonTool = Database['public']['Tables']['learning_lesson_tools']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];

// UserProfile com user_roles
export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: string;
  role_id?: string;
  user_roles?: {
    id: string;
    name: string;
    description?: string;
  };
  company_name?: string;
  industry?: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
  whatsapp_number?: string;
  referrals_count?: number;
  successful_referrals_count?: number;
};

// Definição do tipo Solution específico do Supabase
export type Solution = Database['public']['Tables']['solutions']['Row'] & {
  checklist_items?: any[]; // Adicionando o campo checklist_items que está faltando
};

// Outros tipos existentes
export * from './database.types';
