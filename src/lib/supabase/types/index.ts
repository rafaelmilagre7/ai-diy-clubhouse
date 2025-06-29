
import { Database } from './database.types';

// =============================================================================
// TIPOS PRINCIPAIS - SISTEMA LEARNING (LMS)
// =============================================================================

export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'] & {
  ai_assistant_id?: string; // Campo adicionado na migração
};
export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningLessonTool = Database['public']['Tables']['learning_lesson_tools']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];

// Tipos que podem existir ou não ainda (compatibilidade)
export type LearningCertificate = Database['public']['Tables'] extends { learning_certificates: any } 
  ? Database['public']['Tables']['learning_certificates']['Row']
  : {
      id: string;
      user_id: string;
      course_id: string;
      certificate_url?: string;
      issued_at: string;
      created_at: string;
    };

export type LearningLessonNps = Database['public']['Tables']['learning_lesson_nps']['Row'];

// =============================================================================
// TIPOS ADMINISTRATIVOS
// =============================================================================

export type UserRole = Database['public']['Tables'] extends { user_roles: any } 
  ? Database['public']['Tables']['user_roles']['Row']
  : {
      id: string;
      name: string;
      description?: string;
      permissions?: any;
      is_system?: boolean;
      created_at: string;
      updated_at: string;
    };

export type Profile = Database['public']['Tables'] extends { profiles: any } 
  ? Database['public']['Tables']['profiles']['Row']
  : {
      id: string;
      email: string;
      name: string | null;
      avatar_url: string | null;
      company_name: string | null;
      industry: string | null;
      role_id: string | null;
      role: string | null;
      onboarding_completed: boolean;
      onboarding_completed_at: string | null;
      created_at: string;
      updated_at: string;
    };

export type Invite = Database['public']['Tables'] extends { invites: any } 
  ? Database['public']['Tables']['invites']['Row'] 
  : {
      id: string;
      email: string;
      token: string;
      role_id: string;
      created_by: string;
      expires_at: string;
      used_at: string | null;
      notes: string | null;
      created_at: string;
    };

export type Analytics = Database['public']['Tables'] extends { analytics: any }
  ? Database['public']['Tables']['analytics']['Row']
  : {
      id: string;
      user_id: string;
      event_type: string;
      solution_id?: string;
      module_id?: string;
      event_data?: any;
      created_at: string;
    };

// =============================================================================
// TIPOS DO SISTEMA DE MEMBROS
// =============================================================================

export type Tool = Database['public']['Tables'] extends { tools: any }
  ? Database['public']['Tables']['tools']['Row']
  : {
      id: string;
      name: string;
      description: string;
      link: string;
      image_url?: string;
      category: string;
      is_premium: boolean;
      created_at: string;
      updated_at: string;
    };

export type Event = Database['public']['Tables'] extends { events: any }
  ? Database['public']['Tables']['events']['Row']
  : {
      id: string;
      title: string;
      description?: string;
      start_time: string;
      end_time: string;
      location_link?: string;
      physical_location?: string;
      cover_image_url?: string;
      is_recurring: boolean;
      recurrence_pattern?: string;
      created_by: string;
      created_at: string;
    };

export type Benefit = Tool;

// =============================================================================
// TIPOS DE COMPATIBILIDADE
// =============================================================================

// Compatibilidade: Solution (sistema legado)
export interface Solution {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  published: boolean;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  slug: string;
  tags?: string[];
  estimated_time?: number;
  success_rate?: number;
  related_solutions?: string[];
  author_id?: string;
  overview?: string;
  checklist?: Array<{
    id: string;
    title: string;
    description?: string;
    checked?: boolean;
  }>;
  videos?: Array<{
    title?: string;
    description?: string;
    url?: string;
    youtube_id?: string;
  }>;
}

// Compatibilidade: Module (sistema legado)
export interface Module {
  id: string;
  title: string;
  type: string;
  content?: {
    blocks?: any[];
    checklist?: Array<{
      id: string;
      title: string;
      description?: string;
      checked?: boolean;
    }>;
    videos?: Array<{
      title?: string;
      description?: string;
      url?: string;
      youtube_id?: string;
    }>;
  };
  solution_id?: string;
  module_order?: number;
  estimated_time_minutes?: number;
  created_at: string;
  updated_at: string;
  certificate_template?: any;
  metrics?: any;
}

// Compatibilidade: Progress (sistema legado)
export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completed_modules: number[];
  last_activity: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Compatibilidade: UserChecklist (sistema legado)
export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// RE-EXPORTAR TIPOS DO DATABASE
// =============================================================================

export * from './database.types';
