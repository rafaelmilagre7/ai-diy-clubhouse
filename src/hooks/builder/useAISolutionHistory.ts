import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/lib/supabase';

export const useAISolutionHistory = () => {
  const { user } = useAuth();

  const { data: solutions, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-solution-history', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('ai_generated_solutions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 60000, // Cache por 1 minuto
  });

  return {
    solutions: solutions || [],
    isLoading,
    error,
    refetch
  };
};
