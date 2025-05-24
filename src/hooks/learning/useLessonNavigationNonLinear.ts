
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase";

interface UseLessonNavigationProps {
  courseId?: string;
  currentLessonId?: string;
  lessons?: LearningLesson[];
  allowFreeNavigation?: boolean;
}

interface AdjacentLessons {
  prev: LearningLesson | null;
  next: LearningLesson | null;
}

export function useLessonNavigationNonLinear({ 
  courseId,
  currentLessonId,
  lessons = [],
  allowFreeNavigation = true
}: UseLessonNavigationProps) {
  const navigate = useNavigate();

  const findAdjacentLessons = useCallback((): AdjacentLessons => {
    if (!lessons.length || !currentLessonId) {
      return { prev: null, next: null };
    }
    
    try {
      // Ordenar por order_index primeiro, depois por título se necessário
      const sortedLessons = [...lessons].sort((a, b) => {
        if (a.order_index !== b.order_index) {
          return a.order_index - b.order_index;
        }
        return a.title.localeCompare(b.title);
      });
      
      const currentIndex = sortedLessons.findIndex(lesson => lesson.id === currentLessonId);
      
      if (currentIndex === -1) {
        console.log("Aula atual não encontrada na lista");
        return { prev: null, next: null };
      }
      
      const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;
      
      return {
        prev: prevLesson,
        next: nextLesson
      };
    } catch (error) {
      console.error("Erro ao encontrar aulas adjacentes:", error);
      return { prev: null, next: null };
    }
  }, [currentLessonId, lessons]);

  const { prev, next } = findAdjacentLessons();

  const navigateToLesson = useCallback((lessonId: string) => {
    if (!courseId || !lessonId) {
      console.error("Course ID ou Lesson ID não fornecidos");
      return false;
    }

    try {
      navigate(`/learning/course/${courseId}/lesson/${lessonId}`);
      return true;
    } catch (error) {
      console.error("Erro ao navegar para a lição:", error);
      return false;
    }
  }, [courseId, navigate]);

  const navigateToPrevious = useCallback(() => {
    if (prev) {
      return navigateToLesson(prev.id);
    } else {
      console.log("Não há aula anterior disponível");
      return false;
    }
  }, [prev, navigateToLesson]);

  const navigateToNext = useCallback(() => {
    if (next) {
      return navigateToLesson(next.id);
    } else {
      console.log("Não há próxima aula disponível, redirecionando para o curso");
      return navigateToCourse();
    }
  }, [next, navigateToLesson]);

  const navigateToCourse = useCallback(() => {
    if (!courseId) {
      console.error("Course ID não fornecido");
      return false;
    }

    try {
      navigate(`/learning/course/${courseId}`);
      return true;
    } catch (error) {
      console.error("Erro ao navegar para o curso:", error);
      return false;
    }
  }, [courseId, navigate]);

  const canNavigateToPrevious = allowFreeNavigation && !!prev;
  const canNavigateToNext = allowFreeNavigation && !!next;

  return {
    prevLesson: prev,
    nextLesson: next,
    canNavigateToPrevious,
    canNavigateToNext,
    navigateToPrevious,
    navigateToNext,
    navigateToLesson,
    navigateToCourse,
    totalLessons: lessons.length,
    currentPosition: lessons.findIndex(l => l.id === currentLessonId) + 1
  };
}
