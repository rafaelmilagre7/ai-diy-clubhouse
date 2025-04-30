
export type UserRole = 'admin' | 'member' | 'formacao';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  industry: string | null;
  role: UserRole;
  created_at: string;
}

// Interface expandida para incluir todas as propriedades utilizadas no código
export interface Solution {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
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
  module_order?: number; // Algumas partes do código usam essa propriedade ao invés de order
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

// Interfaces para o LMS
export interface LearningCourse {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  order_index: number;
  created_by: string | null;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  course_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  order_index: number;
}

export interface LearningLesson {
  id: string;
  title: string;
  description: string | null;
  content: any | null;
  cover_image_url: string | null;
  module_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  order_index: number;
  estimated_time_minutes: number | null;
  ai_assistant_enabled: boolean;
  ai_assistant_prompt: string | null;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percentage: number;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  last_position_seconds: number | null;
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

export interface LearningCertificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string | null;
  created_at: string;
  issued_at: string;
}
