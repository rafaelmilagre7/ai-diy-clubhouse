
// Exportação centralizada e organizada de todos os tipos
export * from './core';
export * from './learning';
export * from './onboarding';
export * from './utils';
export * from './database.types';

// Re-exportações para compatibilidade
export type { 
  LearningCourse,
  LearningModule, 
  LearningLesson,
  LearningProgress,
  LearningCourseWithStats,
  LearningModuleWithStats
} from './learning';

export type {
  Solution,
  Module,
  Progress,
  UserProfile,
  UserRole,
  SolutionCategory
} from './core';

export type {
  OnboardingFinal,
  OnboardingPersonalInfo,
  OnboardingBusinessInfo,
  OnboardingStepComponentProps
} from './onboarding';

export type {
  OptionalProps,
  RequiredProps,
  WithFallbacks,
  SafeComponentProps
} from './utils';
