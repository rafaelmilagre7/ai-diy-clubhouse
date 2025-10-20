
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
  dataMetadata?: {
    oldestDataDate?: string;
    newestDataDate?: string;
    isHistoricalData?: boolean;
    dataRangeDescription?: string;
  };
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
        // Buscar datas mais recentes e antigas dos dados para calcular período real
        const { data: newestProfile } = await supabase
          .from('profiles')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { data: oldestProfile } = await supabase
          .from('profiles')
          .select('created_at')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        // Calcular período baseado na data mais recente real dos dados
        const recentDate = newestProfile?.created_at ? new Date(newestProfile.created_at) : new Date();
        const calculatedStartDate = new Date(recentDate);
        
        switch (timeRange) {
          case '7d':
            calculatedStartDate.setDate(calculatedStartDate.getDate() - 7);
            break;
          case '30d':
            calculatedStartDate.setDate(calculatedStartDate.getDate() - 30);
            break;
          case '90d':
            calculatedStartDate.setDate(calculatedStartDate.getDate() - 90);
            break;
          case '1y':
            calculatedStartDate.setFullYear(calculatedStartDate.getFullYear() - 1);
            break;
        }

        // Novos cadastros no período calculado
        const { count: recentSignups } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', calculatedStartDate.toISOString());

        // Total de usuários (como "usuários ativos")
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Total de implementações
        const { count: totalImplementations } = await supabase
          .from('implementation_trails')
          .select('*', { count: 'exact', head: true });

        // Implementações completas
        const { count: completedImplementations } = await supabase
          .from('implementation_trails')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        // Atividade na comunidade no período calculado
        const { count: topicsInPeriod } = await supabase
          .from('community_topics')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', calculatedStartDate.toISOString());

        const { count: postsInPeriod } = await supabase
          .from('community_posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', calculatedStartDate.toISOString());

        // Buscar atividades recentes reais do audit_logs (sem filtro de data para pegar as mais recentes)
        const { data: auditLogs } = await supabase
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
          .order('timestamp', { ascending: false })
          .limit(20);

        // Buscar informações dos usuários das atividades
        const userIds = auditLogs?.map(log => log.user_id).filter(Boolean) || [];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email')
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
          user_name: profileMap.get(log.user_id)?.name || 'Usuário',
          user_email: profileMap.get(log.user_id)?.email
        })) || [];

        // Determinar se estamos usando dados históricos
        const isHistorical = recentDate < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        return {
          totalLogins: totalUsers || 0,
          newUsers: recentSignups || 0,
          activeImplementations: totalImplementations || 0,
          completedSolutions: completedImplementations || 0,
          systemHealth: 'healthy' as const,
          recentActivities,
          forumActivity: (topicsInPeriod || 0) + (postsInPeriod || 0),
          timeRange,
          lastUpdated: new Date().toISOString(),
          dataMetadata: {
            oldestDataDate: oldestProfile?.created_at,
            newestDataDate: newestProfile?.created_at,
            isHistoricalData: isHistorical,
            dataRangeDescription: isHistorical 
              ? 'Dados históricos da plataforma' 
              : 'Dados atuais da plataforma'
          }
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
