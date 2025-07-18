
import { Database } from './types/database.types';

// =============================================================================
// TIPOS PRINCIPAIS DO SISTEMA LEARNING (LMS)
// =============================================================================

// Tipos de tabelas expandidos com dados relacionais
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'] & {
  ai_assistant_id?: string; // Campo adicionado na migração
  // Campos relacionais opcionais para compatibilidade
  module?: {
    id: string;
    title: string;
    description: string | null;
    course_id: string;
    order_index: number;
    published: boolean;
    created_at: string;
    updated_at: string;
    cover_image_url: string | null;
  };
  videos?: any[];
  resources?: any[];
};

export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'] & {
  // Campos calculados opcionais
  module_count?: number;
  lesson_count?: number;
  is_restricted?: boolean;
};
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

// Remover tipos duplicados - agora estão em extended.ts

// =============================================================================
// TIPOS DE COMPATIBILIDADE PARA SISTEMA LEGADO
// =============================================================================

// Compatibilidade: Solution → mapeado para estrutura similar a LearningLesson
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
  // Campos específicos do sistema legado
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

// Compatibilidade: Module → mapeado para estrutura com conteúdo de módulo
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

// Compatibilidade: Progress → mapeado para learning_progress
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

// Compatibilidade: UserChecklist → estrutura para checklists de usuário
export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// TIPOS DO SISTEMA ADMINISTRATIVO
// =============================================================================

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

// Tipos que podem existir ou não ainda (compatibilidade com fallback)
export type UserRoleTable = Database['public']['Tables'] extends { user_roles: any } 
  ? Database['public']['Tables']['user_roles']['Row']
  : UserRoleData;

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
  
  // Debug log detalhado
  console.log('🔍 [DEBUG] getUserRoleName chamado:', {
    profileId: profile.id?.substring(0, 8) + '***',
    roleId: profile.role_id,
    hasUserRoles: !!profile.user_roles,
    userRolesType: typeof profile.user_roles,
    userRolesName: profile.user_roles?.name,
    legacyRole: profile.role
  });
  
  // Priorizar user_roles (novo sistema)
  if (profile.user_roles?.name) {
    console.log('✅ [ROLE] Usando user_roles.name:', profile.user_roles.name);
    return profile.user_roles.name;
  }
  
  // Fallback direto para role_id conhecido
  if (profile.role_id) {
    // Mapeamento direto de role_ids conhecidos
    const roleMapping: Record<string, string> = {
      'f0724d21-981f-4119-af02-07334300801a': 'admin', // ID real do role admin
      '550e8400-e29b-41d4-a716-446655440000': 'admin',
      // Adicionar outros IDs conhecidos conforme necessário
    };
    
    if (roleMapping[profile.role_id]) {
      console.log('📋 [ROLE] Usando mapeamento role_id:', roleMapping[profile.role_id]);
      return roleMapping[profile.role_id];
    }
    
    console.warn('⚠️ [ROLE] role_id não mapeado:', profile.role_id);
  }
  
  // Fallback para campo legado durante migração
  if (profile.role) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ [DEPRECATED] Usando profile.role (legado). Migre para role_id/user_roles.', {
        profileId: profile.id.substring(0, 8) + '***',
        legacyRole: profile.role,
        hasRoleId: !!profile.role_id,
        hasUserRoles: !!profile.user_roles
      });
    }
    console.log('🔄 [ROLE] Usando role legado:', profile.role);
    return profile.role;
  }
  
  console.log('🔻 [ROLE] Fallback para member');
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

// =============================================================================
// TIPOS DO SISTEMA DE MEMBROS (Tools, Events, Benefits)
// =============================================================================

// Tools/Benefits interfaces (compatibilidade com sistema de membros)
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

export type Benefit = Tool; // Benefits são tools

// =============================================================================
// TIPOS DE FORMULÁRIOS E COMPONENTES
// =============================================================================

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

// =============================================================================
// RE-EXPORTAR TIPOS DO DATABASE
// =============================================================================

// Outros tipos existentes do database
export * from './types/database.types';
