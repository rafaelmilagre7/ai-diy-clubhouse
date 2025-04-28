
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LessonResource } from '@/types/learningTypes';
import { toast } from 'sonner';

export const useLessonResources = (lessonId: string) => {
  const queryClient = useQueryClient();

  // Buscar recursos de uma aula
  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['admin-lesson-resources', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];

      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });

      if (error) {
        toast.error('Erro ao carregar recursos');
        throw error;
      }

      return data as LessonResource[];
    },
    enabled: !!lessonId,
  });

  // Adicionar recurso
  const addResource = useMutation({
    mutationFn: async (resource: Partial<LessonResource>) => {
      const { data, error } = await supabase
        .from('learning_resources')
        .insert(resource)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao adicionar recurso');
        throw error;
      }

      return data as LessonResource;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-resources', lessonId] });
    },
  });

  // Remover recurso
  const removeResource = useMutation({
    mutationFn: async (resourceId: string) => {
      const { error } = await supabase
        .from('learning_resources')
        .delete()
        .eq('id', resourceId);

      if (error) {
        toast.error('Erro ao remover recurso');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-resources', lessonId] });
    },
  });

  return {
    resources,
    isLoading,
    error,
    addResource,
    removeResource,
    isUpdating: addResource.isPending || removeResource.isPending
  };
};
