
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalSolutions: number;
  completedSolutions: number;
  activeSolutions: number;
  totalTools: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentSolutions: any[];
}

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async (): Promise<DashboardData> => {
      try {
        // Buscar soluções básicas (sem campo 'difficulty' que não existe)
        const { data: solutions, error: solutionsError } = await supabase
          .from('solutions')
          .select(`
            id,
            title,
            description,
            category,
            estimated_time_hours,
            cover_image_url,
            created_at,
            updated_at
          `)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (solutionsError) {
          console.error('Erro ao buscar soluções:', solutionsError);
        }

        // Buscar ferramentas para stats
        const { data: tools, error: toolsError } = await supabase
          .from('tools')
          .select('id')
          .eq('is_active', true);

        if (toolsError) {
          console.error('Erro ao buscar ferramentas:', toolsError);
        }

        const solutionsList = solutions || [];
        const toolsList = tools || [];

        // Calcular estatísticas básicas
        const stats: DashboardStats = {
          totalSolutions: solutionsList.length,
          completedSolutions: 0, // Será calculado com progresso do usuário
          activeSolutions: 0, // Será calculado com progresso do usuário
          totalTools: toolsList.length
        };

        return {
          stats,
          recentSolutions: solutionsList
        };

      } catch (error) {
        console.error('Erro geral no dashboard:', error);
        
        // Retornar dados vazios em caso de erro
        return {
          stats: {
            totalSolutions: 0,
            completedSolutions: 0,
            activeSolutions: 0,
            totalTools: 0
          },
          recentSolutions: []
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false
  });
};
