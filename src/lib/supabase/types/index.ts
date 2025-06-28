

import { Database } from './database.types';

// Tipos de tabelas principais (apenas tabelas que existem)
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'];
export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];

// Tipos específicos do sistema
export type Solution = Database['public']['Tables']['solutions']['Row'];
export type UserProfile = Database['public']['Tables']['profiles']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type Progress = Database['public']['Tables']['progress']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
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

// Re-exportação das definições de tipos base
export * from './database.types';
export * from './events';

// Função utilitária movida para arquivo separado
export { getUserRoleName } from './getUserRoleName';

// Utilitário para type casting seguro
export const safeSupabaseQuery = <T = any>(query: Promise<any>): Promise<{ data: T | null; error: any }> => {
  return query.catch((error: any) => ({ data: null, error }));
};

