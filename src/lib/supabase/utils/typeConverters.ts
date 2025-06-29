
import { LearningLesson, LearningLessonWithRelations } from '../types';

/**
 * Converte um array de LearningLesson para LearningLessonWithRelations
 * Útil para casos onde os dados não vêm das views especializadas
 */
export function convertToLearningLessonsWithRelations(
  lessons: LearningLesson[]
): LearningLessonWithRelations[] {
  return lessons.map(lesson => ({
    ...lesson,
    videos: lesson.videos || [],
    resources: lesson.resources || [],
    module: lesson.module ? {
      ...lesson.module,
      description: lesson.module.description || null,
      cover_image_url: lesson.module.cover_image_url || null
    } : undefined
  }));
}

/**
 * Converte um LearningLesson único para LearningLessonWithRelations
 */
export function convertToLearningLessonWithRelations(
  lesson: LearningLesson
): LearningLessonWithRelations {
  return {
    ...lesson,
    videos: lesson.videos || [],
    resources: lesson.resources || [],
    module: lesson.module ? {
      ...lesson.module,
      description: lesson.module.description || null,
      cover_image_url: lesson.module.cover_image_url || null
    } : undefined
  };
}
