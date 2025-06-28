
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
        // Simular dados de progresso já que a tabela progress não tem os campos necessários
        console.log('Simulando dados de progresso para usuário:', user.id);
        
        // Retornar dados mockados por enquanto
        const mockProgress: UserProgress[] = [
          {
            solutionId: 'mock-1',
            progress: 75,
            completed: false,
            startedAt: new Date().toISOString(),
          },
          {
            solutionId: 'mock-2',
            progress: 100,
            completed: true,
            startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date().toISOString(),
          }
        ];

        return mockProgress;

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
