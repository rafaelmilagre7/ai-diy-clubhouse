
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export interface UserProgress {
  solutionId: string;
  progress: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export const useDashboardProgress = () => {
  const { user } = useSimpleAuth();

  return useQuery({
    queryKey: ['dashboard-progress', user?.id],
    queryFn: async (): Promise<UserProgress[]> => {
      if (!user?.id) {
        return [];
      }

      try {
        // Usar tabela 'progress' que existe no Supabase
        const { data: progress, error } = await supabase
          .from('progress')
          .select(`
            solution_id,
            completion_percentage,
            is_completed,
            created_at,
            updated_at
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao buscar progresso:', error);
          return [];
        }

        return (progress || []).map(p => ({
          solutionId: p.solution_id,
          progress: p.completion_percentage || 0,
          completed: p.is_completed || false,
          startedAt: p.created_at,
          completedAt: p.is_completed ? p.updated_at : undefined
        }));

      } catch (error) {
        console.error('Erro geral no progresso:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });
};
