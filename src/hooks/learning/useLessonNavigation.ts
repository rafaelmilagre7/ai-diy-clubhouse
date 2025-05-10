
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase";
import { sortLessonsByNumber } from "@/components/learning/member/course-modules/CourseModulesHelpers";

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
    
    // Aplicar a ordenação consistente por número no título antes de buscar aulas adjacentes
    const sortedLessons = sortLessonsByNumber([...lessons]);
    
    // Adicionar log para depuração da ordem das aulas
    console.log("Aulas ordenadas para navegação:", 
      sortedLessons.map(l => ({
        id: l.id, 
        title: l.title, 
        order_index: l.order_index,
        isCurrent: l.id === currentLessonId
      }))
    );
    
    const currentIndex = sortedLessons.findIndex(lesson => lesson.id === currentLessonId);
    
    if (currentIndex === -1) {
      console.log("Aula atual não encontrada na lista de aulas ordenadas");
      return { prev: null, next: null };
    }
    
    const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;
    
    console.log("Navegação calculada:", {
      currentIndex,
      totalLessons: sortedLessons.length,
      hasPrev: !!prevLesson,
      hasNext: !!nextLesson,
      prevTitle: prevLesson?.title,
      nextTitle: nextLesson?.title
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
