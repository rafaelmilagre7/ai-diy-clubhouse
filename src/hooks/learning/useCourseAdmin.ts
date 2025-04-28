
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Course } from '@/types/learningTypes';
import { toast } from 'sonner';

export const useCourseAdmin = (courseId: string) => {
  const queryClient = useQueryClient();

  // Buscar curso por ID
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['admin-course', courseId],
    queryFn: async () => {
      if (!courseId) return null;

      const { data, error } = await supabase
        .from('learning_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        toast.error('Erro ao carregar curso');
        throw error;
      }

      return data as Course;
    },
    enabled: !!courseId,
  });

  // Atualizar curso
  const updateCourse = useMutation({
    mutationFn: async (updatedCourse: Partial<Course>) => {
      const { data, error } = await supabase
        .from('learning_courses')
        .update(updatedCourse)
        .eq('id', updatedCourse.id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar curso');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Curso atualizado com sucesso');
    },
  });

  return {
    course,
    isLoading,
    error,
    updateCourse,
  };
};
