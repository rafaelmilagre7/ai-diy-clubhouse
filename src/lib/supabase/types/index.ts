
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

// UserRole para autenticação
export type UserRole = {
  id: string;
  name: string;
  description?: string;
  permissions?: Record<string, any>;
  is_system?: boolean;
};

// Progress para componentes de implementação
export type Progress = {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  completed_modules: number[];
  is_completed: boolean;
  completion_data?: Record<string, any>;
  implementation_status?: string;
  created_at: string;
  last_activity: string;
  completed_at?: string;
};

// UserChecklist para compatibilidade
export type UserChecklist = {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};

// TrailSolution para compatibilidade com TrailSolutionsList
export type TrailSolution = {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  estimated_time?: number;
  difficulty: string;
  category: string;
  tags?: string[];
  checklist_items?: any[];
};

// Definição do tipo Solution específico do Supabase
export type Solution = Database['public']['Tables']['solutions']['Row'] & {
  checklist_items?: any[]; // Adicionando o campo checklist_items que está faltando
};

// Outros tipos existentes
export * from './database.types';
