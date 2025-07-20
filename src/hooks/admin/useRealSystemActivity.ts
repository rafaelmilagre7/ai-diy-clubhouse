
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SystemActivity {
  recent_signups: number;
  active_users_today: number;
  communityActivity: number;
  implementations_started: number;
  recent_events: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user_email?: string;
  }>;
}

export const useRealSystemActivity = () => {
  return useQuery({
    queryKey: ['admin-system-activity-real'],
    queryFn: async (): Promise<SystemActivity> => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      try {
        // Novos cadastros nas últimas 24h
        const { count: recentSignups } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString());

        // Usuários ativos hoje (com alguma atividade)
        const { count: activeToday } = await supabase
          .from('analytics')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString());

        // Atividade na comunidade (novos tópicos e posts hoje)
        const { count: topicsToday } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString());

        const { count: postsToday } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString());

        // Implementações iniciadas hoje
        const { count: implementationsToday } = await supabase
          .from('implementation_trails')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString());

        // Eventos recentes do sistema
        const { data: auditLogs } = await supabase
          .from('audit_logs')
          .select(`
            id,
            event_type,
            action,
            timestamp,
            details
          `)
          .order('timestamp', { ascending: false })
          .limit(10);

        const recentEvents = auditLogs?.map(log => ({
          id: log.id,
          type: log.event_type,
          description: log.action,
          timestamp: log.timestamp,
          user_email: log.details?.user_email || undefined
        })) || [];

        return {
          recent_signups: recentSignups || 0,
          active_users_today: activeToday || 0,
          communityActivity: (topicsToday || 0) + (postsToday || 0),
          implementations_started: implementationsToday || 0,
          recent_events: recentEvents
        };

      } catch (error) {
        console.error('Erro ao buscar atividade do sistema:', error);
        
        // Retornar valores padrão em caso de erro
        return {
          recent_signups: 0,
          active_users_today: 0,
          communityActivity: 0,
          implementations_started: 0,
          recent_events: []
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
  });
};
