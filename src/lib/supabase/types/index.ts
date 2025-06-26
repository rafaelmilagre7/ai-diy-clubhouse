
import { Database } from './database.types';

// Tipos de tabelas
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'];
export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'] & {
  // lesson_id agora pode ser null para recursos da biblioteca
  lesson_id: string | null;
};
export type LearningLessonTool = Database['public']['Tables']['learning_lesson_tools']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];

// CORREÇÃO: Tipo UserProfile referenciando a tabela 'profiles' correta
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

// Outros tipos existentes
export * from './database.types';
