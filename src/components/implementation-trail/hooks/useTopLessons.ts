
import { useMemo, useState } from 'react';

interface RecommendedLesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  justification: string;
  priority: number;
}

export const useTopLessons = (lessons: RecommendedLesson[], initialMaxCount: number = 5) => {
  const [showAll, setShowAll] = useState(false);
  const maxCount = showAll ? lessons?.length || 0 : initialMaxCount;

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

  const hasMoreLessons = lessons && lessons.length > initialMaxCount;
  const remainingCount = lessons ? Math.max(0, lessons.length - initialMaxCount) : 0;

  const toggleShowAll = () => setShowAll(!showAll);

  return {
    topLessons,
    hasMoreLessons,
    remainingCount,
    totalLessons: lessons?.length || 0,
    showAll,
    toggleShowAll
  };
};
