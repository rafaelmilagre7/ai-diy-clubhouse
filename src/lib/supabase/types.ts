
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

// Tipo para Soluções
export type Solution = {
  id: string;
  title: string;
  description: string;
  category: 'Receita' | 'Operacional' | 'Estratégia';
  difficulty: 'easy' | 'medium' | 'advanced';
  thumbnail_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
  estimated_time?: number;
  slug: string;
  implementation_steps?: any;
  completion_requirements?: any;
  related_solutions?: string[];
  success_rate?: number;
  checklist_items?: any;
};

// Tipo para Módulos
export type Module = {
  id: string;
  solution_id: string;
  title: string;
  type: string;
  content: {
    blocks: any[];
  };
  module_order: number;
  created_at: string;
  updated_at: string;
  estimated_time_minutes?: number;
  metrics?: any;
  certificate_template?: any;
};

// Tipo para Perfis de Usuário
export type UserProfile = {
  id: string;
  name?: string;
  email: string;
  avatar_url?: string;
  role: string;
  role_id?: string;
  company_name?: string;
  industry?: string;
  created_at: string;
  whatsapp_number?: string;
  referrals_count: number;
  successful_referrals_count: number;
};

// Tipos para Formação/Learning
export type LearningCourse = {
  id: string;
  title: string;
  description?: string;
  slug: string;
  cover_image_url?: string;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
};

export type LearningModule = {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  order_index: number;
  published: boolean;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
};

export type LearningLesson = {
  id: string;
  title: string;
  description?: string;
  module_id: string;
  order_index: number;
  content?: any;
  cover_image_url?: string;
  difficulty_level?: string;
  estimated_time_minutes?: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  ai_assistant_prompt?: string;
  ai_assistant_id?: string;
  ai_assistant_enabled?: boolean;
};

export type LearningLessonVideo = {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  url: string;
  video_id?: string;
  video_type?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  order_index: number;
  created_at: string;
  video_file_name?: string;
  video_file_path?: string;
  file_size_bytes?: number;
};

export type LearningResource = {
  id: string;
  name: string;
  description?: string;
  file_url: string;
  lesson_id: string;
  file_type?: string;
  file_size_bytes?: number;
  order_index: number;
  created_at: string;
};

export type LearningProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percentage?: number;
  started_at: string;
  completed_at?: string;
  last_position_seconds?: number;
  notes?: string;
  video_progress?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type LearningComment = {
  id: string;
  lesson_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  likes_count: number;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
};

export type LearningLessonTool = {
  id: string;
  lesson_id: string;
  tool_id: string;
  order_index: number;
  created_at: string;
};

export type VideoFormValues = {
  title: string;
  description?: string;
  url: string;
  type: 'youtube' | 'panda' | 'direct';
  duration?: number;
  thumbnail_url?: string;
};

// Re-exportando o tipo Database para manter compatibilidade
export type { Database };
