
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToastModern } from '@/hooks/useToastModern';

interface AnalyticsData {
  solutionPopularity: Array<{
    name: string;
    value: number;
  }>;
  implementationsByCategory: Array<{
    name: string;
    value: number;
  }>;
  userCompletionRate: Array<{
    name: string;
    value: number;
  }>;
  usersByTime: Array<{
    date: string;
    name: string;
    usuarios: number;
    total: number;
    novos: number;
  }>;
  dayOfWeekActivity: Array<{
    day: string;
    atividade: number;
  }>;
}

interface UseAnalyticsDataParams {
  timeRange: string;
  category?: string;
  difficulty?: string;
}

export const useAnalyticsData = ({ timeRange, category = 'all', difficulty = 'all' }: UseAnalyticsDataParams) => {
  const { showError } = useToastModern();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData>({
    solutionPopularity: [],
    implementationsByCategory: [],
    userCompletionRate: [],
    usersByTime: [],
    dayOfWeekActivity: []
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados usando funções seguras
        const [
          solutionPerformanceResult,
          userGrowthResult,
          weeklyActivityResult,
          overviewResult
        ] = await Promise.allSettled([
          supabase.rpc('get_solution_performance_metrics'),
          supabase.rpc('get_user_growth_by_date'),
          supabase.rpc('get_weekly_activity_patterns'),
          supabase.rpc('get_admin_analytics_overview')
        ]);

        // Processar resultados
        const solutionData = solutionPerformanceResult.status === 'fulfilled' ? solutionPerformanceResult.value.data || [] : [];
        const userGrowthData = userGrowthResult.status === 'fulfilled' ? userGrowthResult.value.data || [] : [];
        const weeklyData = weeklyActivityResult.status === 'fulfilled' ? weeklyActivityResult.value.data || [] : [];
        const overviewData = overviewResult.status === 'fulfilled' ? overviewResult.value.data?.[0] : null;

        // Processar dados de popularidade de soluções
        const solutionPopularity = solutionData.slice(0, 5).map(item => ({
          name: item.title?.length > 25 ? item.title.substring(0, 25) + '...' : item.title || 'Solução',
          value: item.total_implementations || 0
        }));

        // Processar implementações por categoria
        const categoryMap = new Map();
        solutionData.forEach(item => {
          const category = item.category || 'Outros';
          categoryMap.set(category, (categoryMap.get(category) || 0) + item.total_implementations);
        });

        const implementationsByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value
        }));

        // Taxa de conclusão baseada em dados reais
        const userCompletionRate = [
          { name: 'Concluídas', value: overviewData?.completed_implementations || 0 },
          { name: 'Em andamento', value: overviewData?.active_implementations || 0 }
        ];

        const processedData: AnalyticsData = {
          solutionPopularity,
          implementationsByCategory,
          userCompletionRate,
          usersByTime: userGrowthData.map(item => ({
            date: item.date,
            name: item.name,
            usuarios: item.novos,
            total: item.total,
            novos: item.novos
          })),
          dayOfWeekActivity: weeklyData.map(item => ({
            day: item.day,
            atividade: item.atividade
          }))
        };

        setData(processedData);

      } catch (error: any) {
        console.error('Erro ao carregar analytics gerais:', error);
        setError(error.message || 'Erro ao carregar dados de analytics');
        showError("Erro ao carregar analytics", "Não foi possível carregar os dados. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange, category, difficulty, showError]);

  return { data, loading, error };
};
