
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Module } from '@/types/learningTypes';
import { toast } from 'sonner';

export const useModuleAdmin = (moduleId: string) => {
  // Buscar módulo por ID
  const { data: module, isLoading, error } = useQuery({
    queryKey: ['admin-module', moduleId],
    queryFn: async () => {
      if (!moduleId) return null;

      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (error) {
        toast.error('Erro ao carregar módulo');
        throw error;
      }

      return data as Module;
    },
    enabled: !!moduleId,
  });

  // Extrair o course_id do módulo para navegação
  const courseId = module?.course_id || null;

  return {
    module,
    courseId,
    isLoading,
    error,
  };
};
