
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Lesson } from '@/types/learningTypes';
import { toast } from 'sonner';

export const useLessonAdmin = (lessonId: string) => {
  // Buscar aula por ID
  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ['admin-lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;

      const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) {
        toast.error('Erro ao carregar aula');
        throw error;
      }

      return data as Lesson;
    },
    enabled: !!lessonId,
  });

  return {
    lesson,
    moduleId: lesson?.module_id,
    isLoading,
    error,
  };
};
