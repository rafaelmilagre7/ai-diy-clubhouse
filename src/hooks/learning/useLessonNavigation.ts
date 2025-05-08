
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase";

interface UseLessonNavigationProps {
  courseId?: string;
  currentLessonId?: string;
  lessons?: LearningLesson[];
}

interface AdjacentLessons {
  prev: LearningLesson | null;
  next: LearningLesson | null;
}

export function useLessonNavigation({ 
  courseId,
  currentLessonId,
  lessons = []
}: UseLessonNavigationProps) {
  const navigate = useNavigate();

  const findAdjacentLessons = useCallback((): AdjacentLessons => {
    if (!lessons.length || !currentLessonId) {
      return { prev: null, next: null };
    }
    
    const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId);
    
    if (currentIndex === -1) {
      return { prev: null, next: null };
    }
    
    return {
      prev: currentIndex > 0 ? lessons[currentIndex - 1] : null,
      next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
    };
  }, [currentLessonId, lessons]);

  const { prev, next } = findAdjacentLessons();

  const navigateToPrevious = useCallback(() => {
    if (prev && courseId) {
      navigate(`/learning/course/${courseId}/lesson/${prev.id}`);
    }
  }, [prev, courseId, navigate]);

  const navigateToNext = useCallback(() => {
    if (next && courseId) {
      navigate(`/learning/course/${courseId}/lesson/${next.id}`);
    } else if (courseId) {
      // Voltar para a página do curso se não houver próxima aula
      navigate(`/learning/course/${courseId}`);
    }
  }, [next, courseId, navigate]);

  const navigateToCourse = useCallback(() => {
    if (courseId) {
      navigate(`/learning/course/${courseId}`);
    }
  }, [courseId, navigate]);

  return {
    prevLesson: prev,
    nextLesson: next,
    navigateToPrevious,
    navigateToNext,
    navigateToCourse
  };
}
