
// Exportações simplificadas para evitar dependências circulares
export { supabase } from './client';
export type { Tables } from './client';

// Exportar todos os tipos essenciais do sistema
export type {
  Database,
  UserProfile,
  Solution,
  Progress,
  Analytics,
  ForumCategory,
  ForumTopic,
  ForumPost,
  Tool,
  Event,
  Course,
  Module,
  Lesson,
  Resource,
  ImplementationTrail,
  UserRole,
  UserChecklist
} from './types/index';

// Exportar tipos específicos do Learning/LMS
export type {
  LearningCourse,
  LearningModule,
  LearningLesson,
  LearningProgress,
  LearningResource,
  LearningLessonVideo,
  LearningComment,
  LearningCertificate,
  LearningLessonNps,
  LearningCourseWithStats,
  LearningModuleWithStats
} from './types/index';

// Exportar configurações básicas
export { ensureStorageBucketExists, createStoragePublicPolicy } from './client';
