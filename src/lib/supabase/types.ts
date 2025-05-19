
import { Database } from './types/database.types';

// Tipos para o sistema de referrals/indicações
export type ReferralType = 'club' | 'formacao';
export type ReferralStatus = 'pending' | 'registered' | 'completed';

export type Referral = {
  id: string;
  referrer_id: string;
  email: string;
  token: string;
  type: ReferralType;
  status: ReferralStatus;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  expires_at: string;
  benefits_claimed: boolean;
  metadata?: Record<string, any>;
  notes?: string;
  role_id?: string;
  whatsapp_number?: string;
  last_sent_at?: string;
  send_attempts?: number;
};

export type ReferralFormData = {
  email: string;
  type: ReferralType;
  notes?: string;
};

export type ReferralStats = {
  total: number;
  pending: number;
  completed: number;
  conversion_rate: number;
};

// Re-exportando o tipo Database para manter compatibilidade
export type { Database };

// Definições para tipos de vídeo
export interface VideoFormValues {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  video_id?: string;
  video_type?: string;
  type?: string;
  duration_seconds?: number;
  thumbnail_url?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  embedCode?: string;
}

// Definindo TrailSolution para compatibilidade com TrailSolutionsList
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
  priority: number;
  justification: string;
};

// Definindo UserChecklist para compatibilidade
export type UserChecklist = {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};

// Definindo Progress para componentes de implementação
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

// Definindo tipos para perfil de usuário
export interface UserProfile {
  id: string;
  updated_at?: string;
  created_at?: string;
  username?: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  website?: string;
  role?: string;
  email?: string;
  user_roles?: {
    id: string;
    name: string;
    description?: string;
    permissions?: Record<string, any>;
  };
  company_name?: string;
  industry?: string;
  role_id?: string;
}

// Definindo UserRole para autenticação
export type UserRole = {
  id: string;
  name: string;
  description?: string;
  permissions?: Record<string, any>;
  is_system?: boolean;
};

// Definições para tipos de aprendizado
export type LearningLesson = {
  id: string;
  title: string;
  description?: string;
  module_id: string;
  order_index: number;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
  cover_image_url?: string;
  slug?: string;
  status?: string;
  is_published?: boolean;
  published?: boolean; // Alias para compatibilidade
  content?: any;
  videos?: LearningLessonVideo[];
  resources?: LearningResource[];
  module?: LearningModule;
  estimated_time_minutes?: number;
  ai_assistant_enabled?: boolean;
  ai_assistant_id?: string;
  ai_assistant_prompt?: string;
  difficulty_level?: string;
};

export type LearningLessonVideo = {
  id: string;
  lesson_id: string;
  title?: string;
  description?: string;
  url: string;
  duration_seconds?: number;
  thumbnail_url?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  video_id?: string;
  video_type?: string;
};

export type LearningModule = {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  is_published?: boolean;
  lessons_count?: number;
  total_duration_minutes?: number;
};

export type LearningCourse = {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  is_published?: boolean;
  modules_count?: number;
  lessons_count?: number;
  total_duration_minutes?: number;
  slug?: string;
};

export type LearningProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  progress_percentage: number;
  video_progress?: Record<string, number>;
  last_position_seconds?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  notes?: string;
  started_at?: string;
};

export type LearningResource = {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  type: string;
  url?: string;
  file_path?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  file_url?: string;
  file_size_bytes?: number;
  file_type?: string;
  name?: string;
};

export type LearningComment = {
  id: string;
  lesson_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  is_pinned?: boolean;
  likes_count?: number;
};

export type LearningLessonTool = {
  id: string;
  lesson_id: string;
  tool_id: string;
  created_at: string;
  updated_at: string;
};

// Definindo tipo Solution para compatibilidade
export type Solution = {
  id: string;
  title: string;
  description: string;
  [key: string]: any;
};
