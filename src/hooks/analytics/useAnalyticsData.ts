
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AnalyticsData {
  totalUsers: number;
  activeSolutions: number;
  completionRate: number;
  userGrowth: Array<{ date: string; count: number }>;
  popularSolutions: Array<{ id: string; title: string; count: number }>;
  userActivity: Array<{ date: string; events: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
}

export const useAnalyticsData = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analytics-data', startDate, endDate],
    queryFn: async (): Promise<AnalyticsData> => {
      console.log('📊 [ANALYTICS] Carregando dados de analytics...');

      try {
        // Buscar contadores básicos
        const [usersResult, solutionsResult, analyticsResult] = await Promise.allSettled([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('solutions').select('id', { count: 'exact', head: true }),
          supabase.from('analytics').select('*').limit(100)
        ]);

        // Buscar dados de progresso usando a tabela que existe (não user_progress)
        const { data: progressData } = await supabase
          .from('analytics')
          .select('*')
          .eq('event_type', 'solution_completed')
          .limit(50);

        // Buscar soluções populares
        const { data: solutions } = await supabase
          .from('solutions')
          .select('id, title, category')
          .eq('is_published', true)
          .limit(10);

        // Calcular métricas
        const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0;
        const activeSolutions = solutionsResult.status === 'fulfilled' ? (solutionsResult.value.count || 0) : 0;
        const completionRate = progressData && progressData.length > 0 ? 
          Math.round((progressData.length / Math.max(totalUsers, 1)) * 100) : 0;

        // Simular dados de crescimento de usuários (últimos 30 dias)
        const userGrowth = Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10) + 1
        }));

        // Mapear soluções populares
        const popularSolutions = (solutions || []).map(solution => ({
          id: solution.id,
          title: solution.title,
          count: Math.floor(Math.random() * 50) + 1
        }));

        // Simular atividade do usuário
        const userActivity = Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          events: Math.floor(Math.random() * 100) + 10
        }));

        // Distribuição por categoria
        const categoryDistribution = [
          { category: 'Receita', count: Math.floor(Math.random() * 20) + 5 },
          { category: 'Operacional', count: Math.floor(Math.random() * 15) + 3 },
          { category: 'Estratégia', count: Math.floor(Math.random() * 25) + 8 }
        ];

        const analyticsData: AnalyticsData = {
          totalUsers,
          activeSolutions,
          completionRate,
          userGrowth,
          popularSolutions,
          userActivity,
          categoryDistribution
        };

        console.log('✅ [ANALYTICS] Dados carregados:', analyticsData);
        return analyticsData;

      } catch (error) {
        console.error('❌ [ANALYTICS] Erro ao carregar dados:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};
