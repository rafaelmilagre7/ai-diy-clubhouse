import { Database } from './database.types';

// Tipos para tabelas de aprendizado
export interface LearningLesson {
  id: string;
  title: string;
  description: string | null;
  content: any | null;
  cover_image_url: string | null;
  module_id: string;
  published: boolean;
  is_published: boolean; // Alias para compatibilidade
  created_at: string;
  updated_at: string;
  order_index: number;
  estimated_time_minutes: number | null;
  ai_assistant_enabled: boolean;
  ai_assistant_prompt: string | null;
  difficulty_level: string | null;
  ai_assistant_id?: string | null;
  videos?: LearningLessonVideo[];
  resources?: LearningResource[];
  module?: LearningModule;
}

export interface LearningLessonVideo {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  created_at: string;
  order_index: number;
  video_type: string | null;
  file_size_bytes: number | null;
  video_file_path: string | null;
  video_file_name: string | null;
  video_id: string | null;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  course_id: string;
  published: boolean;
  is_published: boolean; // Alias para compatibilidade
  created_at: string;
  updated_at: string;
  order_index: number;
  learning_courses?: { id: string; title: string; };
}

export interface LearningCourse {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  slug: string;
  published: boolean;
  is_published: boolean; // Alias para compatibilidade
  created_at: string;
  updated_at: string;
  order_index: number;
  created_by: string | null;
  is_restricted?: boolean;
  modules_count?: number;
  lessons_count?: number;
  module_count?: number; // Alias para compatibilidade
  lesson_count?: number; // Alias para compatibilidade
  total_duration_minutes?: number;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percentage: number;
  video_progress: Record<string, number>; // Para salvar progresso de vídeos individuais
  started_at: string;
  completed_at: string | null;
  last_position_seconds?: number;
  updated_at: string;
  created_at: string;
  notes?: string | null;
}

export interface LearningResource {
  id: string;
  lesson_id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
  order_index: number;
}

export interface LearningLessonTool {
  id: string;
  lesson_id: string;
  tool_id: string;
  created_at: string;
  order_index: number;
}

export interface LearningComment {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  is_hidden: boolean;
}

// UserProfile com user_roles
export interface UserProfile {
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
    permissions?: Record<string, any>;
  };
  company_name?: string;
  industry?: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
  whatsapp_number?: string;
  referrals_count?: number;
  successful_referrals_count?: number;
}

// Reexportar Database para manter compatibilidade
export * from './database.types';

// Interface de Solution para compatibilidade
export interface Solution {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail_url?: string;
  category: string;
  difficulty: string;
  estimated_time?: number;
  published: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// Definindo TrailSolution para compatibilidade com TrailSolutionsList
export interface TrailSolution {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  estimated_time?: number;
  difficulty: string;
  category: string;
  tags?: string[];
  checklist_items?: any[];
  priority: number;
  justification: string;
}

// Definindo UserChecklist para compatibilidade
export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// Definindo Progress para componentes de implementação
export interface Progress {
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
}

// Definindo UserRole para autenticação
export type UserRole = {
  id: string;
  name: string;
  description?: string;
  permissions?: Record<string, any>;
  is_system?: boolean;
};
