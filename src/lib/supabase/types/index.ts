
// Exportação centralizada e organizada de todos os tipos
export * from './core';
export * from './learning';
export * from './onboarding';
export * from './utils';
export * from './database.types';

// Re-exportações específicas para compatibilidade
export type { 
  LearningCourse,
  LearningModule, 
  LearningLesson,
  LearningProgress,
  LearningCourseWithStats,
  LearningModuleWithStats,
  LearningResource,
  LearningLessonVideo,
  LearningComment,
  LearningCertificate,
  LearningLessonNps
} from './learning';

export type {
  Solution,
  Module,
  Progress,
  UserProfile,
  UserRole,
  SolutionCategory,
  UserChecklist
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

// Exportações adicionais necessárias
export type Database = any; // Tipo do banco de dados
export type Analytics = any; // Tipo de analytics
export type ForumCategory = any; // Tipo de categoria do fórum
export type ForumTopic = any; // Tipo de tópico do fórum
export type ForumPost = any; // Tipo de post do fórum
export type Tool = any; // Tipo de ferramenta
export type Event = any; // Tipo de evento
export type Course = any; // Tipo de curso (diferente de LearningCourse)
export type Lesson = any; // Tipo de aula (diferente de LearningLesson)
export type Resource = any; // Tipo de recurso (diferente de LearningResource)
export type ImplementationTrail = any; // Tipo de trilha de implementação
