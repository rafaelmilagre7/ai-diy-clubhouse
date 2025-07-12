
import { LearningLesson } from '../types';
import { LearningLessonWithRelations } from '../types/extended';

/**
 * Converte um array de LearningLesson para LearningLessonWithRelations
 * Útil para casos onde os dados não vêm das views especializadas
 */
export function convertToLearningLessonsWithRelations(
  lessons: LearningLesson[]
): LearningLessonWithRelations[] {
  return lessons.map(lesson => convertToLearningLessonWithRelations(lesson));
}

/**
 * Converte um LearningLesson único para LearningLessonWithRelations
 */
export function convertToLearningLessonWithRelations(
  lesson: LearningLesson
): LearningLessonWithRelations {
  // Verificar se o objeto já possui as propriedades relacionais
  const lessonAny = lesson as any;
  
  return {
    ...lesson,
    videos: lessonAny.videos || [],
    resources: lessonAny.resources || [],
    module: lessonAny.module || undefined
  };
}
