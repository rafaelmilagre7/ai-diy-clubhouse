
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SystemActivity {
  totalLogins: number;
  newUsers: number;
  activeImplementations: number;
  completedSolutions: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivities: Array<{
    type: string;
    count: number;
    period: string;
  }>;
  communityActivity: number;
  timeRange: string;
  lastUpdated: string;
}

export const useRealSystemActivity = (timeRange: string) => {
  return useQuery({
    queryKey: ['admin-system-activity-real', timeRange],
    queryFn: async (): Promise<SystemActivity> => {
      const today = new Date();
      let startDate: Date;
      
      // Calcular data de início baseada no timeRange
      switch (timeRange) {
        case '7d':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      try {
        // Novos cadastros no período
        const { count: recentSignups } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString());

        // Usuários ativos no período (com alguma atividade)
        const { count: activeToday } = await supabase
          .from('analytics')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString());

        // Atividade na comunidade (novos tópicos e posts no período)
        const { count: topicsInPeriod } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString());

        const { count: postsInPeriod } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString());

        // Implementações iniciadas no período
        const { count: implementationsInPeriod } = await supabase
          .from('implementation_trails')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString());

        // Atividades recentes do sistema
        const recentActivities = [
          {
            type: 'Novos usuários',
            count: recentSignups || 0,
            period: `Últimos ${timeRange === '7d' ? '7 dias' : timeRange === '30d' ? '30 dias' : timeRange === '90d' ? '90 dias' : '1 ano'}`
          },
          {
            type: 'Usuários ativos',
            count: activeToday || 0,
            period: `Últimos ${timeRange === '7d' ? '7 dias' : timeRange === '30d' ? '30 dias' : timeRange === '90d' ? '90 dias' : '1 ano'}`
          },
          {
            type: 'Atividade da comunidade',
            count: (topicsInPeriod || 0) + (postsInPeriod || 0),
            period: `Últimos ${timeRange === '7d' ? '7 dias' : timeRange === '30d' ? '30 dias' : timeRange === '90d' ? '90 dias' : '1 ano'}`
          },
          {
            type: 'Implementações iniciadas',
            count: implementationsInPeriod || 0,
            period: `Últimos ${timeRange === '7d' ? '7 dias' : timeRange === '30d' ? '30 dias' : timeRange === '90d' ? '90 dias' : '1 ano'}`
          }
        ];

        return {
          totalLogins: activeToday || 0,
          newUsers: recentSignups || 0,
          activeImplementations: implementationsInPeriod || 0,
          completedSolutions: 0, // Pode ser implementado futuramente
          systemHealth: 'healthy' as const,
          recentActivities,
          communityActivity: (topicsInPeriod || 0) + (postsInPeriod || 0),
          timeRange,
          lastUpdated: new Date().toISOString()
        };

      } catch (error) {
        console.error('Erro ao buscar atividade do sistema:', error);
        
        // Retornar valores padrão em caso de erro
        return {
          totalLogins: 0,
          newUsers: 0,
          activeImplementations: 0,
          completedSolutions: 0,
          systemHealth: 'warning' as const,
          recentActivities: [],
          communityActivity: 0,
          timeRange,
          lastUpdated: new Date().toISOString()
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
  });
};
