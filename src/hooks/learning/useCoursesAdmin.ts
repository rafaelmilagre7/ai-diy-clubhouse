
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Course } from '@/types/learningTypes';
import { toast } from 'sonner';

export const useCoursesAdmin = () => {
  const queryClient = useQueryClient();

  // Buscar todos os cursos
  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_courses')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        toast.error('Erro ao carregar cursos');
        throw error;
      }

      return data as Course[];
    }
  });

  // Criar novo curso
  const createCourse = useMutation({
    mutationFn: async (course: Partial<Course>) => {
      const { data, error } = await supabase
        .from('learning_courses')
        .insert(course)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar curso');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Curso criado com sucesso');
    }
  });

  // Atualizar curso
  const updateCourse = useMutation({
    mutationFn: async (course: Partial<Course>) => {
      const { data, error } = await supabase
        .from('learning_courses')
        .update(course)
        .eq('id', course.id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar curso');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Curso atualizado com sucesso');
    }
  });

  // Deletar curso
  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('learning_courses')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Erro ao deletar curso');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Curso deletado com sucesso');
    }
  });

  return {
    courses,
    isLoading,
    createCourse,
    updateCourse,
    deleteCourse
  };
};
