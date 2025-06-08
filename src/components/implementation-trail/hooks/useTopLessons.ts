
import { useMemo } from 'react';

interface RecommendedLesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  justification: string;
  priority: number;
}

export const useTopLessons = (lessons: RecommendedLesson[], maxCount: number = 5) => {
  const topLessons = useMemo(() => {
    if (!lessons || lessons.length === 0) return [];

    // Algoritmo de ranking baseado em prioridade e outros fatores
    const sortedLessons = [...lessons].sort((a, b) => {
      // Prioridade mais alta primeiro (1 é melhor que 3)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Em caso de empate, ordenar por título alfabeticamente
      return a.title.localeCompare(b.title);
    });

    return sortedLessons.slice(0, maxCount);
  }, [lessons, maxCount]);

  const hasMoreLessons = lessons && lessons.length > maxCount;
  const remainingCount = lessons ? Math.max(0, lessons.length - maxCount) : 0;

  return {
    topLessons,
    hasMoreLessons,
    remainingCount,
    totalLessons: lessons?.length || 0
  };
};
