
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
export type LearningCertificate = Database['public']['Tables']['learning_certificates']['Row'];
export type LearningLessonNps = Database['public']['Tables']['learning_lesson_nps']['Row'];

// =============================================================================
// TIPOS ADMINISTRATIVOS
// =============================================================================

export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Invite = Database['public']['Tables']['invites']['Row'];
export type Analytics = Database['public']['Tables']['analytics']['Row'];

// =============================================================================
// TIPOS DO SISTEMA DE MEMBROS
// =============================================================================

export type Tool = Database['public']['Tables']['tools']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type Benefit = Database['public']['Tables']['benefits']['Row'];

// =============================================================================
// RE-EXPORTAR TIPOS DO DATABASE
// =============================================================================

export * from './database.types';
