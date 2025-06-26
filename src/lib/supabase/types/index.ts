
import { Database } from './database.types';

// Tipos de tabelas principais
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'];
export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type Solution = Database['public']['Tables']['solutions']['Row'];
export type Progress = Database['public']['Tables']['progress']['Row'];
export type CourseAccessControl = Database['public']['Tables']['course_access_control']['Row'];

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
