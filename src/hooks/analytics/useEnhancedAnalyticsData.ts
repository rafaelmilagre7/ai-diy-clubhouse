
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

        // Buscar overview geral
        const { data: overviewData, error: overviewError } = await supabase
          .from('admin_analytics_overview')
          .select('*')
          .single();

        if (overviewError && overviewError.code !== 'PGRST116') {
          console.warn('Erro ao buscar overview:', overviewError);
        }

        // Buscar crescimento de usuários
        const { data: userGrowthData, error: userGrowthError } = await supabase
          .from('user_growth_by_date')
          .select('*')
          .order('date', { ascending: true });

        if (userGrowthError) {
          console.warn('Erro ao buscar crescimento de usuários:', userGrowthError);
        }

        // Buscar atividade semanal
        const { data: weeklyActivityData, error: weeklyError } = await supabase
          .from('weekly_activity_patterns')
          .select('*')
          .order('day_of_week', { ascending: true });

        if (weeklyError) {
          console.warn('Erro ao buscar atividade semanal:', weeklyError);
        }

        // Buscar performance de soluções
        const { data: solutionPerformanceData, error: solutionError } = await supabase
          .from('solution_performance_metrics')
          .select('*')
          .order('total_implementations', { ascending: false })
          .limit(10);

        if (solutionError) {
          console.warn('Erro ao buscar performance de soluções:', solutionError);
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
        
        console.log('📊 Enhanced Analytics carregados:', {
          totalUsers: processedData.metrics.totalUsers,
          activeUsers: processedData.metrics.activeUsers,
          solutionPopularity: processedData.solutionPopularity.length,
          userGrowth: processedData.usersByTime.length
        });

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
