
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface EnhancedAnalyticsData {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalImplementations: number;
    completionRate: number;
  };
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
  contentPerformance: Array<{
    title: string;
    category: string;
    engagement: number;
    unit: string;
  }>;
}

export const useEnhancedAnalyticsData = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null);

  useEffect(() => {
    const fetchEnhancedAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados usando funções seguras
        const [
          overviewResult,
          userGrowthResult, 
          weeklyActivityResult,
          solutionPerformanceResult
        ] = await Promise.allSettled([
          supabase.rpc('get_admin_analytics_overview'),
          supabase.rpc('get_user_growth_by_date'),
          supabase.rpc('get_weekly_activity_patterns'),
          supabase.rpc('get_solution_performance_metrics')
        ]);

        // Processar resultados das funções seguras
        const overviewData = overviewResult.status === 'fulfilled' ? overviewResult.value.data?.[0] : null;
        const userGrowthData = userGrowthResult.status === 'fulfilled' ? userGrowthResult.value.data || [] : [];
        const weeklyActivityData = weeklyActivityResult.status === 'fulfilled' ? weeklyActivityResult.value.data || [] : [];
        const solutionPerformanceData = solutionPerformanceResult.status === 'fulfilled' ? solutionPerformanceResult.value.data || [] : [];

        if (overviewResult.status === 'rejected') {
          console.warn('Erro ao buscar overview:', overviewResult.reason);
        }
        if (userGrowthResult.status === 'rejected') {
          console.warn('Erro ao buscar crescimento de usuários:', userGrowthResult.reason);
        }
        if (weeklyActivityResult.status === 'rejected') {
          console.warn('Erro ao buscar atividade semanal:', weeklyActivityResult.reason);
        }
        if (solutionPerformanceResult.status === 'rejected') {
          console.warn('Erro ao buscar performance de soluções:', solutionPerformanceResult.reason);
        }

        // Processar dados
        const processedData: EnhancedAnalyticsData = {
          metrics: {
            totalUsers: overviewData?.total_users || 0,
            activeUsers: overviewData?.active_users_7d || 0,
            totalImplementations: (overviewData?.completed_implementations || 0) + (overviewData?.active_implementations || 0),
            completionRate: overviewData?.overall_completion_rate || 0
          },
          solutionPopularity: solutionPerformanceData?.slice(0, 5).map(item => ({
            name: item.title?.length > 25 ? item.title.substring(0, 25) + '...' : item.title || 'Sem título',
            value: item.total_implementations || 0
          })) || [],
          implementationsByCategory: (() => {
            const categoryMap = new Map();
            solutionPerformanceData?.forEach(item => {
              const category = item.category || 'Outros';
              categoryMap.set(category, (categoryMap.get(category) || 0) + item.total_implementations);
            });
            return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
          })(),
          userCompletionRate: [
            { name: 'Concluídas', value: overviewData?.completed_implementations || 0 },
            { name: 'Em andamento', value: overviewData?.active_implementations || 0 }
          ],
          usersByTime: userGrowthData?.map(item => ({
            date: item.date,
            name: item.name,
            usuarios: item.novos,
            total: item.total,
            novos: item.novos
          })) || [],
          dayOfWeekActivity: weeklyActivityData?.map(item => ({
            day: item.day,
            atividade: item.atividade
          })) || [],
          contentPerformance: solutionPerformanceData?.slice(0, 5).map(item => ({
            title: item.title || 'Sem título',
            category: item.category || 'Outros',
            engagement: item.total_implementations || 0,
            unit: 'implementações'
          })) || []
        };

        setData(processedData);

      } catch (error: any) {
        console.error('Erro ao carregar enhanced analytics:', error);
        setError(error.message || 'Erro ao carregar dados de analytics');
        toast({
          title: "Erro ao carregar analytics",
          description: "Não foi possível carregar os dados. Verifique sua conexão.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEnhancedAnalytics();
  }, [timeRange, toast]);

  return { data, loading, error };
};
