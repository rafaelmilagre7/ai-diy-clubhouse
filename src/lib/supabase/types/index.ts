
import { Database } from './database.types';

// Tipos de tabelas principais (apenas tabelas que existem)
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'];
export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];

// Tipos específicos do sistema
export type UserProfile = Database['public']['Tables']['profiles']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type Invite = Database['public']['Tables']['invites']['Row'];

// Tipos de eventos e controle de acesso
export type Event = Database['public']['Tables']['events']['Row'];
export type EventAccessControl = Database['public']['Tables']['event_access_control']['Row'];
export type CourseAccessControl = Database['public']['Tables']['course_access_control']['Row'];
export type BenefitAccessControl = Database['public']['Tables']['benefit_access_control']['Row'];

// Tipos de permissões
export type PermissionDefinition = Database['public']['Tables']['permission_definitions']['Row'];
export type RolePermission = Database['public']['Tables']['role_permissions']['Row'];

// Tipos de fórum
export type ForumCategory = Database['public']['Tables']['forum_categories']['Row'];
export type ForumTopic = Database['public']['Tables']['forum_topics']['Row'];
export type ForumPost = Database['public']['Tables']['forum_posts']['Row'];

// Tipos de auditoria e comunicação
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type AdminCommunication = Database['public']['Tables']['admin_communications']['Row'];

// Tipos de ferramentas
export type Tool = Database['public']['Tables']['tools']['Row'];

// Tipos de implementação
export type ImplementationCheckpoint = Database['public']['Tables']['implementation_checkpoints']['Row'];
export type SolutionResource = Database['public']['Tables']['solution_resources']['Row'];

// Tipos de analytics e notificações
export type Analytics = Database['public']['Tables']['analytics']['Row'];
export type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];

// Tipos customizados para compatibilidade
export type SolutionCategory = 'Receita' | 'Operacional' | 'Estratégia';

export interface SimplifiedSolution {
  id: string;
  title: string;
  description: string;
  category: SolutionCategory;
  difficulty?: string;
  difficulty_level?: string;
  thumbnail_url?: string;
  cover_image_url: string;
  published: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  estimated_time_hours?: number;
  roi_potential?: string;
  implementation_steps?: any;
  required_tools?: string[];
  expected_results: string;
  success_metrics: string;
  target_audience: string;
  prerequisites: string;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  category: SolutionCategory;
  difficulty: string;
  difficulty_level?: string;
  slug: string;
  published: boolean;
  thumbnail_url?: string;
  cover_image_url: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  estimated_time_hours?: number;
  roi_potential?: string;
  implementation_steps?: any;
  required_tools?: string[];
  expected_results: string;
  success_metrics: string;
  target_audience: string;
  prerequisites: string;
}

export interface SimplifiedTool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  logo_url: string;
  pricing_info: any;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  has_member_benefit: boolean;
  benefit_type: string;
  benefit_discount_percentage: number | null;
  benefit_link: string | null;
  benefit_title: string;
  benefit_description: string;
  status: boolean;
}

export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  solution_id: string;
  title: string;
  type: string;
  content: any;
  module_order: number;
  created_at: string;
  updated_at: string;
}

// Função utilitária para categorias
export const safeSolutionCategory = (category: string): SolutionCategory => {
  const validCategories: SolutionCategory[] = ['Receita', 'Operacional', 'Estratégia'];
  return validCategories.includes(category as SolutionCategory) 
    ? category as SolutionCategory 
    : 'Receita';
};

// Re-exportação das definições de tipos base
export * from './database.types';
export * from './events';

// Função utilitária
export { getUserRoleName } from './getUserRoleName';

// Utilitário para type casting seguro
export const safeSupabaseQuery = <T = any>(query: Promise<any>): Promise<{ data: T | null; error: any }> => {
  return query.catch((error: any) => ({ data: null, error }));
};
