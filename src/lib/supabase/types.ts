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
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'] & {
  // lesson_id agora pode ser null para recursos da biblioteca
  lesson_id: string | null;
};
export type LearningLessonTool = Database['public']['Tables']['learning_lesson_tools']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];

// Outros tipos existentes
export * from './types/database.types';

// Interface para dados de role do usuário
export interface UserRoleData {
  id: string;
  name: string;
  description?: string;
  permissions?: any;
  is_system?: boolean;
}

// Enum para tipos de roles conhecidos (compatibilidade)
export type UserRole = 'admin' | 'formacao' | 'membro_club';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  industry: string | null;
  role_id: string | null; // Campo principal para roles
  role?: UserRole; // Campo legado - deprecado, mas mantido para compatibilidade
  user_roles?: UserRoleData | null; // Dados da role via join
  created_at: string;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
}

// Função utilitária para obter o nome da role
export const getUserRoleName = (profile: UserProfile | null): string => {
  if (!profile) return 'member';
  
  // Priorizar user_roles (novo sistema)
  if (profile.user_roles?.name) {
    return profile.user_roles.name;
  }
  
  // Fallback para campo legado durante migração
  if (profile.role) {
    // CORREÇÃO: Log de deprecação para monitoramento
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ [DEPRECATED] Usando profile.role (legado). Migre para role_id/user_roles.', {
        profileId: profile.id.substring(0, 8) + '***',
        legacyRole: profile.role,
        hasRoleId: !!profile.role_id,
        hasUserRoles: !!profile.user_roles
      });
    }
    return profile.role;
  }
  
  return 'member';
};

// Função utilitária para verificar se é admin
export const isAdminRole = (profile: UserProfile | null): boolean => {
  const roleName = getUserRoleName(profile);
  return roleName === 'admin';
};

// Função utilitária para verificar se é formação
export const isFormacaoRole = (profile: UserProfile | null): boolean => {
  const roleName = getUserRoleName(profile);
  return roleName === 'formacao';
};

// CORREÇÃO: Interface Solution unificada baseada no schema REAL do banco
export interface Solution {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  // Campos que existem no banco conforme schema
  category: 'Receita' | 'Operacional' | 'Estratégia';
  difficulty: string;
  tags?: string[];
  related_solutions?: string[];
  implementation_steps?: any[];
  checklist_items?: any[];
  completion_requirements?: any;
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
