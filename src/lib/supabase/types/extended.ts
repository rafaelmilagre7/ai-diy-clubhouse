
// Tipos estendidos para queries com dados relacionais
// Mantém os tipos originais intactos, apenas adiciona extensões

import { LearningLesson, LearningLessonVideo, LearningResource, LearningModule, LearningCourse } from './index';

// Tipo estendido para aulas com dados relacionais
export interface LearningLessonWithRelations extends LearningLesson {
  ai_assistant_id?: string; // Novo campo adicionado
  videos?: LearningLessonVideo[];
  resources?: LearningResource[];
  module?: LearningModuleWithCourse;
}

// Tipo estendido para módulos com dados do curso - sem sobrescrever campos obrigatórios
export interface LearningModuleWithCourse extends LearningModule {
  learning_courses?: LearningCourse;
  course?: LearningCourse;
}

// Tipo estendido para cursos com contadores
export interface LearningCourseWithStats extends LearningCourse {
  module_count: number;
  lesson_count: number;
  is_restricted: boolean;
}

// Re-exportar todos os tipos originais para compatibilidade
export * from './index';
