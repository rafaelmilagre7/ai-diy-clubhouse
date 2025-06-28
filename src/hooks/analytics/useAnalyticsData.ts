
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
        // Buscar contadores básicos de forma simplificada
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        const { count: activeSolutions } = await supabase
          .from('solutions')
          .select('id', { count: 'exact', head: true });

        const { data: solutions } = await supabase
          .from('solutions')
          .select('id, title, category')
          .limit(10);

        // Calcular métricas
        const completionRate = Math.floor(Math.random() * 40) + 60; // Mock

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
          totalUsers: totalUsers || 0,
          activeSolutions: activeSolutions || 0,
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
