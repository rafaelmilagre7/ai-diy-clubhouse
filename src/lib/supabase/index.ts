
// Exportações principais do cliente
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
  UserChecklist,
  SolutionCategory
} from './types/index';

// Exportar tipos específicos do Learning/LMS - TODOS OS TIPOS
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
} from './types/learning';

// Exportar tipos de onboarding
export type {
  OnboardingFinal,
  OnboardingPersonalInfo,
  OnboardingBusinessInfo,
  OnboardingStepComponentProps
} from './types/onboarding';

// Exportar utilitários
export type {
  OptionalProps,
  RequiredProps,
  WithFallbacks,
  SafeComponentProps
} from './types/utils';

// Exportar configurações básicas
export { ensureStorageBucketExists, createStoragePublicPolicy } from './client';
