
import { useState, useEffect } from 'react';
import { LearningLesson, LearningProgress } from '@/lib/supabase/types';

interface UseCourseCompletionProps {
  courseId?: string;
  currentLessonId?: string;
  allLessons?: LearningLesson[];
  userProgress?: LearningProgress[];
  isCurrentLessonCompleted?: boolean;
}

export const useCourseCompletion = ({
  courseId,
  currentLessonId,
  allLessons = [],
  userProgress = [],
  isCurrentLessonCompleted = false
}: UseCourseCompletionProps) => {
  const [shouldShowCelebration, setShouldShowCelebration] = useState(false);
  const [lastCompletedLessonId, setLastCompletedLessonId] = useState<string | null>(null);

  // Calcular estatísticas do curso
  const courseStats = {
    totalLessons: allLessons.length,
    completedLessons: userProgress.filter(p => p.progress_percentage >= 100).length,
    progress: allLessons.length > 0 
      ? Math.round((userProgress.filter(p => p.progress_percentage >= 100).length / allLessons.length) * 100)
      : 0
  };

  // Verificar se o curso foi completado
  const isCourseCompleted = courseStats.progress >= 100;

  // Detectar quando mostrar celebração de conclusão do curso
  useEffect(() => {
    if (
      isCourseCompleted && 
      isCurrentLessonCompleted && 
      currentLessonId && 
      currentLessonId !== lastCompletedLessonId &&
      courseStats.totalLessons > 1 // Só mostrar se for um curso com múltiplas aulas
    ) {
      setShouldShowCelebration(true);
      setLastCompletedLessonId(currentLessonId);
    }
  }, [isCourseCompleted, isCurrentLessonCompleted, currentLessonId, lastCompletedLessonId, courseStats.totalLessons]);

  const resetCelebration = () => {
    setShouldShowCelebration(false);
  };

  return {
    courseStats,
    isCourseCompleted,
    shouldShowCelebration,
    resetCelebration
  };
};
