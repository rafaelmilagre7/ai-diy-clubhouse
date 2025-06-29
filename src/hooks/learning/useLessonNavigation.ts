
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase";

interface UseLessonNavigationProps {
  courseId?: string;
  currentLessonId?: string;
  lessons?: LearningLesson[]; // Todas as aulas do curso
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
    
    // As aulas já vêm ordenadas do hook useLessonData
    console.log("Aulas para navegação:", 
      lessons.map(l => ({
        id: l.id, 
        title: l.title, 
        moduleTitle: l.module?.title,
        isCurrent: l.id === currentLessonId
      }))
    );
    
    const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId);
    
    if (currentIndex === -1) {
      console.log("Aula atual não encontrada na lista de aulas do curso");
      return { prev: null, next: null };
    }
    
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    
    console.log("Navegação do curso calculada:", {
      currentIndex,
      totalLessons: lessons.length,
      hasPrev: !!prevLesson,
      hasNext: !!nextLesson,
      prevTitle: prevLesson?.title,
      nextTitle: nextLesson?.title,
      prevModule: prevLesson?.module?.title,
      nextModule: nextLesson?.module?.title
    });
    
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
