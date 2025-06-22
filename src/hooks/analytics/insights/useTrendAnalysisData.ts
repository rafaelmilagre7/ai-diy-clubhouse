
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLogging } from '@/hooks/useLogging';

interface TrendMetric {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export const useTrendAnalysisData = (timeRange: string) => {
  const { log, logWarning } = useLogging();

  return useQuery({
    queryKey: ['trend-analysis', timeRange],
    queryFn: async (): Promise<TrendMetric[]> => {
      try {
        log('Buscando dados de análise de tendências', { timeRange });

        // Calcular períodos atual e anterior baseado no timeRange
        const now = new Date();
        let currentPeriodStart: Date;
        let previousPeriodStart: Date;
        let previousPeriodEnd: Date;

        switch (timeRange) {
          case '7d':
            currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            previousPeriodEnd = currentPeriodStart;
            break;
          case '30d':
            currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            previousPeriodEnd = currentPeriodStart;
            break;
          case '90d':
            currentPeriodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            previousPeriodStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            previousPeriodEnd = currentPeriodStart;
            break;
          default:
            currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            previousPeriodEnd = currentPeriodStart;
        }

        // 1. Buscar usuários ativos no período atual
        const { data: currentActiveUsers } = await supabase
          .from('analytics')
          .select('user_id')
          .gte('created_at', currentPeriodStart.toISOString())
          .lte('created_at', now.toISOString());

        // 2. Buscar usuários ativos no período anterior
        const { data: previousActiveUsers } = await supabase
          .from('analytics')
          .select('user_id')
          .gte('created_at', previousPeriodStart.toISOString())
          .lte('created_at', previousPeriodEnd.toISOString());

        // 3. Buscar implementações no período atual
        const { data: currentImplementations } = await supabase
          .from('progress')
          .select('*')
          .gte('created_at', currentPeriodStart.toISOString())
          .lte('created_at', now.toISOString());

        // 4. Buscar implementações no período anterior
        const { data: previousImplementations } = await supabase
          .from('progress')
          .select('*')
          .gte('created_at', previousPeriodStart.toISOString())
          .lte('created_at', previousPeriodEnd.toISOString());

        // Calcular métricas
        const currentActiveUsersCount = new Set(currentActiveUsers?.map(u => u.user_id) || []).size;
        const previousActiveUsersCount = new Set(previousActiveUsers?.map(u => u.user_id) || []).size;

        const currentImplementationsCount = currentImplementations?.length || 0;
        const previousImplementationsCount = previousImplementations?.length || 0;

        const currentCompletedCount = currentImplementations?.filter(i => i.is_completed).length || 0;
        const previousCompletedCount = previousImplementations?.filter(i => i.is_completed).length || 0;

        const currentCompletionRate = currentImplementationsCount > 0 
          ? (currentCompletedCount / currentImplementationsCount) * 100 
          : 0;
        const previousCompletionRate = previousImplementationsCount > 0 
          ? (previousCompletedCount / previousImplementationsCount) * 100 
          : 0;

        // Calcular mudanças percentuais
        const calculateChange = (current: number, previous: number): number => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };

        const getTrend = (change: number): 'up' | 'down' | 'stable' => {
          if (Math.abs(change) < 1) return 'stable';
          return change > 0 ? 'up' : 'down';
        };

        const usersChange = calculateChange(currentActiveUsersCount, previousActiveUsersCount);
        const implementationsChange = calculateChange(currentImplementationsCount, previousImplementationsCount);
        const completionChange = calculateChange(currentCompletionRate, previousCompletionRate);

        const trends: TrendMetric[] = [
          {
            metric: 'Usuários Ativos',
            current: currentActiveUsersCount,
            previous: previousActiveUsersCount,
            change: usersChange,
            trend: getTrend(usersChange),
            icon: null // Will be set in component
          },
          {
            metric: 'Implementações',
            current: currentImplementationsCount,
            previous: previousImplementationsCount,
            change: implementationsChange,
            trend: getTrend(implementationsChange),
            icon: null
          },
          {
            metric: 'Taxa de Conclusão',
            current: currentCompletionRate,
            previous: previousCompletionRate,
            change: completionChange,
            trend: getTrend(completionChange),
            icon: null
          }
        ];

        log('Dados de tendências processados', { 
          currentPeriod: { start: currentPeriodStart, end: now },
          previousPeriod: { start: previousPeriodStart, end: previousPeriodEnd },
          trendsCount: trends.length
        });

        return trends;

      } catch (error: any) {
        logWarning('Erro ao buscar dados de análise de tendências', { 
          error: error.message,
          timeRange
        });
        
        // Retornar dados vazios em caso de erro
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};
