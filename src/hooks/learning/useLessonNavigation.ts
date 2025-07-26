
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LearningLessonWithRelations } from "@/lib/supabase/types/extended";

interface UseLessonNavigationProps {
  courseId?: string;
  currentLessonId?: string;
  lessons?: LearningLessonWithRelations[]; // Todas as aulas do curso
}

interface AdjacentLessons {
  prev: LearningLessonWithRelations | null;
  next: LearningLessonWithRelations | null;
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
    
    // As aulas já vêm ordenadas do hook useLessonData
    
    const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId);
    
    if (currentIndex === -1) {
      console.log("Aula atual não encontrada na lista de aulas do curso");
      return { prev: null, next: null };
    }
    
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    
    
    return {
      prev: prevLesson,
      next: nextLesson
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
