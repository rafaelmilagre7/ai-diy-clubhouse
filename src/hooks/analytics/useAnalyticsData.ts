
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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

        // Buscar dados das views
        const [
          solutionPerformanceResult,
          userGrowthResult,
          weeklyActivityResult
        ] = await Promise.allSettled([
          supabase.from('solution_performance_metrics').select('*').order('total_implementations', { ascending: false }).limit(10),
          supabase.from('user_growth_by_date').select('*').order('date'),
          supabase.from('weekly_activity_patterns').select('*').order('day_of_week')
        ]);

        // Processar resultados
        const solutionData = solutionPerformanceResult.status === 'fulfilled' ? solutionPerformanceResult.value.data || [] : [];
        const userGrowthData = userGrowthResult.status === 'fulfilled' ? userGrowthResult.value.data || [] : [];
        const weeklyData = weeklyActivityResult.status === 'fulfilled' ? weeklyActivityResult.value.data || [] : [];

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

        // Calcular taxa de conclusão geral
        const totalImplementations = solutionData.reduce((sum, item) => sum + item.total_implementations, 0);
        const completedImplementations = solutionData.reduce((sum, item) => sum + item.completed_implementations, 0);
        
        const userCompletionRate = [
          { name: 'Concluídas', value: completedImplementations },
          { name: 'Em andamento', value: totalImplementations - completedImplementations }
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
        
        console.log('📈 Dados analytics gerais carregados:', {
          solutionPopularity: processedData.solutionPopularity.length,
          implementationsByCategory: processedData.implementationsByCategory.length,
          userGrowth: processedData.usersByTime.length
        });

      } catch (error: any) {
        console.error('Erro ao carregar analytics gerais:', error);
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

    fetchAnalyticsData();
  }, [timeRange, category, difficulty, toast]);

  return { data, loading, error };
};
