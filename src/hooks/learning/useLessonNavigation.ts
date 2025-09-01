
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LearningLessonWithRelations } from "@/lib/supabase/types/extended";
import { correctId } from "@/utils/learningValidation";

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

  // Função auxiliar para extrair courseId válido
  const getValidCourseId = useCallback((): string | null => {
    // 1. Verificar se courseId fornecido é válido e corrigi-lo se necessário
    if (courseId && courseId !== 'undefined' && courseId !== 'null' && courseId.length > 10) {
      const correctedCourseId = correctId(courseId);
      console.log('🔧 [NAVIGATION] CourseId corrigido:', courseId, '→', correctedCourseId);
      return correctedCourseId;
    }
    
    // 2. Tentar extrair da lição atual
    if (lessons.length > 0 && currentLessonId) {
      const currentLesson = lessons.find(lesson => lesson.id === currentLessonId);
      if (currentLesson?.module?.course_id) {
        console.log('🔧 [NAVIGATION-FALLBACK] CourseId extraído da lição:', currentLesson.module.course_id);
        return currentLesson.module.course_id;
      }
    }
    
    // 3. Tentar extrair de qualquer lição disponível
    if (lessons.length > 0 && lessons[0]?.module?.course_id) {
      console.log('🔧 [NAVIGATION-FALLBACK] CourseId extraído da primeira lição:', lessons[0].module.course_id);
      return lessons[0].module.course_id;
    }
    
    console.warn('⚠️ [NAVIGATION-FALLBACK] Nenhum courseId válido encontrado');
    return null;
  }, [courseId, currentLessonId, lessons]);

  const findAdjacentLessons = useCallback((): AdjacentLessons => {
    if (!lessons.length || !currentLessonId) {
      return { prev: null, next: null };
    }
    
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
    const validCourseId = getValidCourseId();
    
    if (prev && validCourseId) {
      navigate(`/learning/course/${validCourseId}/lesson/${prev.id}`);
    }
  }, [prev, getValidCourseId, navigate]);

  const navigateToNext = useCallback(() => {
    const validCourseId = getValidCourseId();
    
    if (next && validCourseId) {
      navigate(`/learning/course/${validCourseId}/lesson/${next.id}`);
    } else if (validCourseId) {
      // Voltar para a página do curso se não houver próxima aula
      navigate(`/learning/course/${validCourseId}`);
    } else {
      navigate('/learning');
    }
  }, [next, getValidCourseId, navigate]);

  const navigateToCourse = useCallback(() => {
    const validCourseId = getValidCourseId();
    
    if (validCourseId) {
      console.log('🔧 [NAVIGATION] Navegando para curso:', validCourseId);
      navigate(`/learning/course/${validCourseId}`);
    } else {
      console.warn('⚠️ [NAVIGATION-ERROR] CourseId inválido, redirecionando para /learning');
      navigate('/learning');
    }
  }, [getValidCourseId, navigate]);

  return {
    prevLesson: prev,
    nextLesson: next,
    navigateToPrevious,
    navigateToNext,
    navigateToCourse
  };
}
