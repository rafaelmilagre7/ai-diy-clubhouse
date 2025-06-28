
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export const useModuleFetch = (moduleId: string | null) => {
  const [modules, setModules] = useState([]);

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
    modules,
    setModules,
    isLoading,
    error
  };
};
