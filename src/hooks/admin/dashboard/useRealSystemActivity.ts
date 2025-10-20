
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface RecentActivity {
  id: string;
  user_id: string;
  event_type: string;
  solution: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface SystemActivity {
  totalLogins: number;
  newUsers: number;
  activeImplementations: number;
  completedSolutions: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivities: RecentActivity[];
  forumActivity: number;
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
          .from('community_topics')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString());

        const { count: postsInPeriod } = await supabase
          .from('community_posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString());

        // Implementações iniciadas no período
        const { count: implementationsInPeriod } = await supabase
          .from('implementation_trails')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString());

        // Buscar atividades recentes reais do audit_logs com informações do usuário
        const { data: auditLogs, error: auditError } = await supabase
          .from('audit_logs')
          .select(`
            id,
            user_id,
            event_type,
            action,
            details,
            timestamp,
            resource_id
          `)
          .gte('timestamp', startDate.toISOString())
          .order('timestamp', { ascending: false })
          .limit(20);

        // Buscar informações dos usuários das atividades
        const userIds = auditLogs?.map(log => log.user_id).filter(Boolean) || [];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        // Mapear profiles por ID para acesso rápido
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Transformar audit_logs em RecentActivity
        const recentActivities: RecentActivity[] = auditLogs?.map(log => ({
          id: log.id,
          user_id: log.user_id || '',
          event_type: log.event_type || log.action,
          solution: log.details?.solution_title || log.details?.title || log.resource_id || 'Sistema',
          created_at: log.timestamp,
          user_name: profileMap.get(log.user_id)?.full_name || 'Usuário',
          user_email: profileMap.get(log.user_id)?.email
        })) || [];

        return {
          totalLogins: activeToday || 0,
          newUsers: recentSignups || 0,
          activeImplementations: implementationsInPeriod || 0,
          completedSolutions: 0, // Pode ser implementado futuramente
          systemHealth: 'healthy' as const,
          recentActivities,
          forumActivity: (topicsInPeriod || 0) + (postsInPeriod || 0),
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
          recentActivities: [] as RecentActivity[],
          forumActivity: 0,
          timeRange,
          lastUpdated: new Date().toISOString()
        };
      }
    },
    staleTime: 0, // Dados sempre frescos
    refetchInterval: false, // Não atualizar automaticamente
    refetchOnWindowFocus: false, // Não refetch no foco
  });
};
