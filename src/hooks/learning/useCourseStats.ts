
import { useMemo } from 'react';
import { LearningCourseWithStats, LearningProgress } from '@/lib/supabase/types';
import { ensureNumber, ensureArray } from '@/lib/supabase/types/utils';

export interface CourseStats {
  progress: number;
  moduleCount: number;
  lessonCount: number;
  completedLessons: number;
  totalLessons: number;
}

export const useCourseStats = (
  course: LearningCourseWithStats,
  userProgress: LearningProgress[]
): CourseStats => {
  return useMemo(() => {
    const lessons = ensureArray(course.all_lessons);
    const totalLessons = lessons.length;
    
    // Contar aulas concluídas
    const completedLessons = lessons.filter(lesson => {
      const lessonProgress = userProgress.find(p => p.lesson_id === lesson.id);
      return lessonProgress && lessonProgress.progress_percentage >= 100;
    }).length;

    // Calcular progresso geral
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      progress,
      moduleCount: ensureNumber(course.module_count),
      lessonCount: ensureNumber(course.lesson_count, totalLessons),
      completedLessons,
      totalLessons
    };
  }, [course, userProgress]);
};
