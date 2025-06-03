
import { useState, useEffect } from "react";

interface UseCourseCompletionProps {
  courseId?: string;
  currentLessonId?: string;
  allLessons: any[];
  userProgress: any[];
  isCurrentLessonCompleted: boolean;
}

export function useCourseCompletion({
  courseId,
  currentLessonId,
  allLessons,
  userProgress,
  isCurrentLessonCompleted
}: UseCourseCompletionProps) {
  const [shouldShowCelebration, setShouldShowCelebration] = useState(false);
  
  const courseStats = {
    totalLessons: allLessons.length,
    completedLessons: userProgress.length,
    progressPercentage: allLessons.length > 0 ? Math.round((userProgress.length / allLessons.length) * 100) : 0
  };

  const resetCelebration = () => {
    setShouldShowCelebration(false);
  };

  useEffect(() => {
    // Lógica para detectar conclusão do curso
    if (isCurrentLessonCompleted && allLessons.length > 0) {
      const completedCount = userProgress.length;
      const totalCount = allLessons.length;
      
      if (completedCount >= totalCount) {
        setShouldShowCelebration(true);
      }
    }
  }, [isCurrentLessonCompleted, allLessons.length, userProgress.length]);

  return {
    courseStats,
    shouldShowCelebration,
    resetCelebration
  };
}
