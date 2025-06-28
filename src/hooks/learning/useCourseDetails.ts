
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useCourseDetails = (courseId: string) => {
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;

      const { data, error } = await (supabase as any)
        .from('learning_courses')
        .select(`
          *,
          learning_modules!inner (
            *,
            learning_lessons!inner (*)
          )
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });

  return {
    course,
    isLoading,
    error
  };
};
