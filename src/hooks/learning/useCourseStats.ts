
import { useMemo } from 'react';
import { LearningCourseWithStats, LearningProgress, LearningModule, LearningLesson } from '@/lib/supabase/types';
import { ensureNumber, ensureArray } from '@/lib/supabase/types/utils';

export interface CourseStats {
  progress: number;
  moduleCount: number;
  lessonCount: number;
  completedLessons: number;
  totalLessons: number;
  courseStats: {
    progress: number;
    moduleCount: number;
    lessonCount: number;
    completedLessons: number;
    totalLessons: number;
  };
  firstLessonId: string | null;
  courseProgress: number;
}

// Hook para estatísticas de curso - versão para CourseDetails
export const useCourseStats = (params: {
  modules?: LearningModule[];
  allLessons?: LearningLesson[];
  userProgress?: LearningProgress[];
}): CourseStats => {
  const { modules = [], allLessons = [], userProgress = [] } = params;

  return useMemo(() => {
    const lessons = ensureArray(allLessons);
    const totalLessons = lessons.length;
    
    // Contar aulas concluídas
    const completedLessons = lessons.filter(lesson => {
      const lessonProgress = userProgress.find(p => p.lesson_id === lesson.id);
      return lessonProgress && lessonProgress.progress_percentage >= 100;
    }).length;

    // Calcular progresso geral
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Encontrar primeira aula
    const firstLesson = lessons.length > 0 ? lessons[0] : null;
    const firstLessonId = firstLesson?.id || null;

    const stats = {
      progress,
      moduleCount: ensureNumber(modules.length),
      lessonCount: totalLessons,
      completedLessons,
      totalLessons
    };

    return {
      ...stats,
      courseStats: stats, // Para compatibilidade
      firstLessonId,
      courseProgress: progress // Para compatibilidade
    };
  }, [modules, allLessons, userProgress]);
};

// Hook alternativo para estatísticas simples de curso - versão para outros componentes
export const useSimpleCourseStats = (
  course: LearningCourseWithStats,
  userProgress: LearningProgress[]
): Omit<CourseStats, 'courseStats' | 'firstLessonId' | 'courseProgress'> => {
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
