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
    console.log('[CACHE] Invalidando todo o cache de aprendizado');
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
  }, [queryClient]);

  return {
    invalidateGlobalSearch,
    invalidateCourseSearch,
    invalidateAllLearningData
  };
};