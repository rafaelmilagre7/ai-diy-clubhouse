
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Lesson } from '@/types/learningTypes';
import { toast } from 'sonner';

export const useLessonsAdmin = (moduleId: string) => {
  const queryClient = useQueryClient();

  // Buscar aulas de um módulo
  const { data: lessons, isLoading, error } = useQuery({
    queryKey: ['admin-lessons', moduleId],
    queryFn: async () => {
      if (!moduleId) return [];

      const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) {
        toast.error('Erro ao carregar aulas');
        throw error;
      }

      return data as Lesson[];
    },
    enabled: !!moduleId,
  });

  // Criar nova aula
  const createLesson = useMutation({
    mutationFn: async (lesson: Partial<Lesson>) => {
      const { data, error } = await supabase
        .from('learning_lessons')
        .insert(lesson)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar aula');
        throw error;
      }

      return data as Lesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', moduleId] });
    },
  });

  // Atualizar aula
  const updateLesson = useMutation({
    mutationFn: async (updatedLesson: Partial<Lesson>) => {
      const { data, error } = await supabase
        .from('learning_lessons')
        .update(updatedLesson)
        .eq('id', updatedLesson.id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar aula');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', moduleId] });
    },
  });

  // Deletar aula
  const deleteLesson = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('learning_lessons')
        .delete()
        .eq('id', lessonId);

      if (error) {
        toast.error('Erro ao deletar aula');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', moduleId] });
      toast.success('Aula deletada com sucesso');
    },
  });

  // Reordenar aulas
  const reorderLessons = useMutation({
    mutationFn: async (reorderedLessons: { id: string; order_index: number }[]) => {
      const updates = reorderedLessons.map(({ id, order_index }) => 
        supabase
          .from('learning_lessons')
          .update({ order_index })
          .eq('id', id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', moduleId] });
      toast.success('Ordem das aulas atualizada');
    },
    onError: () => {
      toast.error('Erro ao reordenar aulas');
    }
  });

  return {
    lessons,
    isLoading,
    error,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons
  };
};
