import { useState, useMemo } from 'react';

interface RecommendedLesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  justification: string;
  priority: number;
}

export const useTopLessons = (lessons: RecommendedLesson[], topCount: number = 5) => {
  const [showAll, setShowAll] = useState(false);

  // Ordenar aulas por prioridade (1 = alta, 2 = média, 3 = baixa)
  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => a.priority - b.priority);
  }, [lessons]);

  const topLessons = useMemo(() => {
    if (showAll) {
      return sortedLessons;
    }
    return sortedLessons.slice(0, topCount);
  }, [sortedLessons, showAll, topCount]);

  const hasMoreLessons = sortedLessons.length > topCount;
  const remainingCount = Math.max(0, sortedLessons.length - topCount);
  const totalLessons = sortedLessons.length;

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return {
    topLessons,
    hasMoreLessons,
    remainingCount,
    totalLessons,
    showAll,
    toggleShowAll,
    sortedLessons,
  };
};