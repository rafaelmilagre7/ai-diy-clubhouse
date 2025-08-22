import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useInvalidateSearch = () => {
  const queryClient = useQueryClient();

  const invalidateGlobalSearch = useCallback(() => {
    console.log('[CACHE] Invalidando cache da busca global');
    queryClient.invalidateQueries({ 
      queryKey: ['global-lessons-search'] 
    });
  }, [queryClient]);

  const invalidateCourseSearch = useCallback((courseId?: string) => {
    console.log('[CACHE] Invalidando cache da busca de curso:', courseId || 'todos');
    if (courseId) {
      queryClient.invalidateQueries({ 
        queryKey: ['course-lessons', courseId] 
      });
    } else {
      queryClient.invalidateQueries({ 
        queryKey: ['course-lessons'] 
      });
    }
  }, [queryClient]);

  const invalidateAllLearningData = useCallback(() => {
    console.log('[CACHE] 🔄 Invalidando TODOS os caches de aprendizado');
    queryClient.invalidateQueries({ 
      queryKey: ['global-lessons-search'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['course-lessons'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['learning-courses'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['user-progress'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['learning-user-progress'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['learning-lesson-progress'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['learning-completed-lessons'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['course-details'] 
    });
  }, [queryClient]);

  const invalidateProgressData = useCallback((lessonId?: string) => {
    console.log('[CACHE] 🎯 Invalidando dados de progresso:', { lessonId });
    queryClient.invalidateQueries({ 
      queryKey: ['learning-lesson-progress'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['learning-user-progress'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['learning-completed-lessons'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['course-details'] 
    });
    
    if (lessonId) {
      queryClient.refetchQueries({ 
        queryKey: ['learning-lesson-progress', lessonId] 
      });
    }
  }, [queryClient]);

  return {
    invalidateGlobalSearch,
    invalidateCourseSearch,
    invalidateAllLearningData,
    invalidateProgressData
  };
};