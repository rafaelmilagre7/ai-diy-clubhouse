
import { Database } from './database.types';

// Tipos de tabelas principais
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'];
export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type Solution = Database['public']['Tables']['solutions']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type Progress = Database['public']['Tables']['progress']['Row'];
export type CourseAccessControl = Database['public']['Tables']['course_access_control']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type PermissionDefinition = Database['public']['Tables']['permission_definitions']['Row'];
export type RolePermission = Database['public']['Tables']['role_permissions']['Row'];
export type ImplementationCheckpoint = Database['public']['Tables']['implementation_checkpoints']['Row'];
export type SolutionResource = Database['public']['Tables']['solution_resources']['Row'];
export type Tool = Database['public']['Tables']['tools']['Row'];
export type BenefitAccessControl = Database['public']['Tables']['benefit_access_control']['Row'];
export type ForumTopic = Database['public']['Tables']['forum_topics']['Row'];
export type ForumCategory = Database['public']['Tables']['forum_categories']['Row'];
export type ForumPost = Database['public']['Tables']['forum_posts']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];

// Tipo UserProfile com role join
export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  user_roles?: {
    id: string;
    name: string;
    description?: string;
    permissions?: any;
    is_system?: boolean;
  } | null;
};

// Função helper para obter o nome do role do usuário de forma type-safe
export const getUserRoleName = (profile: UserProfile | null): string => {
  if (!profile) return 'guest';
  
  // Verificar se user_roles está disponível via JOIN
  if (profile.user_roles && typeof profile.user_roles === 'object' && 'name' in profile.user_roles) {
    return profile.user_roles.name || 'member';
  }
  
  // Fallback para role direto (caso exista)
  if ('role' in profile && typeof profile.role === 'string') {
    return profile.role;
  }
  
  return 'member';
};

// Re-exportar tipos do database
export * from './database.types';
