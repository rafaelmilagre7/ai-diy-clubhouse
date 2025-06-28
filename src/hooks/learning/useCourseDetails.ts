
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCourseAccess } from './useCourseAccess';

export interface CourseDetails {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export const useCourseDetails = (courseId: string) => {
  const courseAccess = useCourseAccess(courseId);

  const courseQuery = useQuery({
    queryKey: ['course-details', courseId],
    queryFn: async (): Promise<CourseDetails | null> => {
      if (!courseId) return null;

      console.log('Simulando busca de detalhes do curso:', courseId);

      const { data, error } = await supabase
        .from('learning_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('Erro ao buscar curso:', error);
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000
  });

  const lessonsQuery = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: async () => {
      if (!courseId) return [];

      console.log('Simulando busca de aulas do curso:', courseId);

      const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) {
        console.error('Erro ao buscar aulas:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!courseId && courseAccess.data?.hasAccess,
    staleTime: 5 * 60 * 1000
  });

  const modulesQuery = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      if (!courseId) return [];

      console.log('Simulando busca de módulos do curso:', courseId);

      // Mock modules data since relationship might not exist
      return [];
    },
    enabled: !!courseId && courseAccess.data?.hasAccess,
    staleTime: 5 * 60 * 1000
  });

  return {
    course: courseQuery.data,
    lessons: lessonsQuery.data || [],
    modules: modulesQuery.data || [],
    hasAccess: courseAccess.data?.hasAccess || false,
    accessReason: courseAccess.data?.reason || 'unknown',
    isLoadingCourse: courseQuery.isLoading,
    isLoadingLessons: lessonsQuery.isLoading,
    isLoadingModules: modulesQuery.isLoading,
    isLoadingAccess: courseAccess.isLoading,
    error: courseQuery.error || lessonsQuery.error || modulesQuery.error || courseAccess.error
  };
};
