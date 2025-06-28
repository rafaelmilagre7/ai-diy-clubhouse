
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useModuleFetch = (moduleId: string) => {
  const { data: module, isLoading, error } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: async () => {
      if (!moduleId) return null;

      const { data, error } = await (supabase as any)
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!moduleId
  });

  return {
    module,
    isLoading,
    error
  };
};
