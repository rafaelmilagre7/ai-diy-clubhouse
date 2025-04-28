
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Module } from '@/types/learningTypes';
import { toast } from 'sonner';

export const useModulesAdmin = (courseId: string) => {
  const queryClient = useQueryClient();

  // Buscar módulos de um curso
  const { data: modules, isLoading, error } = useQuery({
    queryKey: ['admin-modules', courseId],
    queryFn: async () => {
      if (!courseId) return [];

      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) {
        toast.error('Erro ao carregar módulos');
        throw error;
      }

      return data as Module[];
    },
    enabled: !!courseId,
  });

  // Criar novo módulo
  const createModule = useMutation({
    mutationFn: async (module: Partial<Module>) => {
      const { data, error } = await supabase
        .from('learning_modules')
        .insert(module)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar módulo');
        throw error;
      }

      return data as Module;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules', courseId] });
    },
  });

  // Atualizar módulo
  const updateModule = useMutation({
    mutationFn: async (updatedModule: Partial<Module>) => {
      const { data, error } = await supabase
        .from('learning_modules')
        .update(updatedModule)
        .eq('id', updatedModule.id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar módulo');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules', courseId] });
    },
  });

  // Deletar módulo
  const deleteModule = useMutation({
    mutationFn: async (moduleId: string) => {
      const { error } = await supabase
        .from('learning_modules')
        .delete()
        .eq('id', moduleId);

      if (error) {
        toast.error('Erro ao deletar módulo');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules', courseId] });
      toast.success('Módulo deletado com sucesso');
    },
  });

  // Reordenar módulos
  const reorderModules = useMutation({
    mutationFn: async (reorderedModules: { id: string; order_index: number }[]) => {
      const updates = reorderedModules.map(({ id, order_index }) => 
        supabase
          .from('learning_modules')
          .update({ order_index })
          .eq('id', id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules', courseId] });
      toast.success('Ordem dos módulos atualizada');
    },
    onError: () => {
      toast.error('Erro ao reordenar módulos');
    }
  });

  return {
    modules,
    isLoading,
    error,
    createModule,
    updateModule,
    deleteModule,
    reorderModules
  };
};
