
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface RealAdminAnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalSolutions: number;
    totalCourses: number;
    completedImplementations: number;
    activeImplementations: number;
    overallCompletionRate: number;
    newUsers30d: number;
    activeUsers7d: number;
  };
  userGrowth: Array<{
    date: string;
    name: string;
    novos: number;
    total: number;
  }>;
  solutionPopularity: Array<{
    name: string;
    value: number;
  }>;
  implementationsByCategory: Array<{
    name: string;
    value: number;
  }>;
  userRoleDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  weeklyActivity: Array<{
    day: string;
    atividade: number;
  }>;
}

export const useRealAdminAnalytics = (timeRange: string = '30d') => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RealAdminAnalyticsData | null>(null);

  useEffect(() => {
    const fetchRealAdminAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados em paralelo de todas as views otimizadas
        const [
          overviewResult,
          userGrowthResult,
          solutionPerformanceResult,
          userSegmentationResult,
          weeklyActivityResult
        ] = await Promise.allSettled([
          supabase.rpc('get_admin_analytics_overview'),
          supabase.rpc('get_user_growth_by_date'),
          supabase.rpc('get_solution_performance_metrics'),
          supabase.rpc('get_user_segmentation_analytics'),
          supabase.rpc('get_weekly_activity_patterns')
        ]);

        // Processar resultados
        const overviewData = overviewResult.status === 'fulfilled' ? overviewResult.value.data?.[0] : null;
        const userGrowthData = userGrowthResult.status === 'fulfilled' ? userGrowthResult.value.data || [] : [];
        const solutionPerformanceData = solutionPerformanceResult.status === 'fulfilled' ? solutionPerformanceResult.value.data || [] : [];
        const userSegmentationData = userSegmentationResult.status === 'fulfilled' ? userSegmentationResult.value.data || [] : [];
        const weeklyActivityData = weeklyActivityResult.status === 'fulfilled' ? weeklyActivityResult.value.data || [] : [];

        // Processar crescimento de usuários com dados mais detalhados
        const processedUserGrowth = userGrowthData.map((item, index) => ({
          date: item.date,
          name: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          novos: item.users || item.novos || 0,
          total: userGrowthData.slice(0, index + 1).reduce((sum, curr) => sum + (curr.users || curr.novos || 0), 0)
        }));

        // Processar soluções mais populares
        const solutionPopularity = solutionPerformanceData.slice(0, 5).map(item => ({
          name: item.title && item.title.length > 25 ? item.title.substring(0, 25) + '...' : item.title || 'Solução',
          value: item.total_implementations || 0
        })).filter(item => item.value > 0);

        // Processar implementações por categoria
        const categoryMap = new Map();
        solutionPerformanceData.forEach(item => {
          const category = item.category || 'Outros';
          categoryMap.set(category, (categoryMap.get(category) || 0) + (item.total_implementations || 0));
        });

        const implementationsByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value: value as number
        })).filter(item => item.value > 0);

        // Processar distribuição de usuários por role
        const userRoleDistribution = userSegmentationData.map(item => ({
          name: item.role_name === 'member' ? 'Membros' : 
                item.role_name === 'admin' ? 'Administradores' :
                item.role_name === 'formacao' ? 'Formação' : item.role_name || 'Outros',
          value: item.user_count || 0,
          percentage: item.percentage || 0
        })).filter(item => item.value > 0);

        // Processar atividade semanal
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const processedWeeklyActivity = dayNames.map((day, index) => {
          const activityItem = weeklyActivityData.find(item => item.day_of_week === index);
          return {
            day,
            atividade: activityItem?.atividade || activityItem?.activity_count || 0
          };
        });

        const analyticsData: RealAdminAnalyticsData = {
          overview: {
            totalUsers: overviewData?.total_users || 0,
            activeUsers: overviewData?.active_users_7d || 0,
            totalSolutions: overviewData?.total_solutions || 0,
            totalCourses: overviewData?.total_courses || 0,
            completedImplementations: overviewData?.completed_implementations || 0,
            activeImplementations: overviewData?.active_implementations || 0,
            overallCompletionRate: overviewData?.overall_completion_rate || 0,
            newUsers30d: overviewData?.new_users_30d || 0,
            activeUsers7d: overviewData?.active_users_7d || 0
          },
          userGrowth: processedUserGrowth,
          solutionPopularity,
          implementationsByCategory,
          userRoleDistribution,
          weeklyActivity: processedWeeklyActivity
        };

        setData(analyticsData);

      } catch (error: any) {
        console.error('❌ [ANALYTICS] Erro ao carregar dados:', error);
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

    fetchRealAdminAnalytics();
  }, [timeRange, toast]);

  const refetch = () => {
    setLoading(true);
    setError(null);
  };

  return { data, loading, error, refetch };
};
