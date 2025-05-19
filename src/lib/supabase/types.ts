
export * from './types/database.types';

export type UserRole = 'admin' | 'member' | 'formacao';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  industry: string | null;
  role: UserRole;
  role_id?: string; // Adicionando o role_id
  user_roles?: any; // Interface para a relação com a tabela user_roles
  created_at: string;
  whatsapp_number?: string | null; // Adicionando o campo whatsapp_number
}

// Interface expandida para incluir todas as propriedades utilizadas no código
export interface Solution {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  // Atualizada a categoria para refletir os novos valores padronizados
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
  module_count?: number;
  lesson_count?: number;
  is_restricted?: boolean; // Adicionando a propriedade is_restricted
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
  learning_courses?: LearningCourse | null;
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
  ai_assistant_id: string | null;
  difficulty_level?: string | null;
  videos?: LearningLessonVideo[];
  resources?: LearningResource[];
  module?: LearningModule & {
    course_id?: string;
    learning_courses?: LearningCourse;
  };
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
  video_progress: Record<string, number>;
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
  video_type?: string;
  file_size_bytes?: number | null;
  video_file_path?: string | null;
  video_file_name?: string | null;
  video_id?: string | null;
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

// Interface para o sistema de indicações
export interface Referral {
  id: string;
  referrer_id: string;
  email: string;
  token: string;
  status: 'pending' | 'registered' | 'completed';
  type: 'club' | 'formacao';
  role_id?: string | null;
  created_at: string;
  completed_at?: string | null;
  expires_at: string;
  notes?: string | null;
  benefits_claimed: boolean;
  metadata: Record<string, any>;
}

export interface ReferralBenefit {
  id: string;
  referrer_id: string;
  referral_id: string;
  benefit_type: string;
  benefit_value: string;
  created_at: string;
  expires_at?: string | null;
  used: boolean;
}

export interface ReferralStats {
  total: number;
  pending: number;
  completed: number;
  conversion_rate: number;
}

export interface ReferralFormData {
  email: string;
  type: 'club' | 'formacao';
  notes?: string;
  whatsappNumber?: string; // Adicionado para suporte ao WhatsApp
  useWhatsapp?: boolean;   // Flag para indicar se deve usar WhatsApp
}

// Interface para preferências de notificação
export interface NotificationPreferences {
  id?: string;
  user_id?: string;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interface para mensagens do WhatsApp
export interface WhatsAppMessage {
  id: string;
  user_id?: string;
  phone_number: string;
  message_type: string;
  message_content: string;
  template_name?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}
