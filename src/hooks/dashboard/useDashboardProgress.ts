
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
        // Buscar progresso do usuário nas soluções
        const { data: progress, error } = await supabase
          .from('user_solution_progress')
          .select(`
            solution_id,
            progress_percentage,
            completed,
            started_at,
            completed_at
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao buscar progresso:', error);
          return [];
        }

        return (progress || []).map(p => ({
          solutionId: p.solution_id,
          progress: p.progress_percentage || 0,
          completed: p.completed || false,
          startedAt: p.started_at,
          completedAt: p.completed_at
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
