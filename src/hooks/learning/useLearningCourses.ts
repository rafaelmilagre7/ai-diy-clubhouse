
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LearningCourse {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export const useLearningCourses = () => {
  const query = useQuery({
    queryKey: ['learning-courses'],
    queryFn: async (): Promise<LearningCourse[]> => {
      console.log('Buscando cursos de aprendizado');

      const { data, error } = await supabase
        .from('learning_courses')
        .select('id, title, description, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar cursos:', error);
        throw error;
      }

      return data?.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        created_at: course.created_at,
        updated_at: course.updated_at
      })) || [];
    },
    staleTime: 5 * 60 * 1000
  });

  return {
    ...query,
    courses: query.data || []
  };
};
