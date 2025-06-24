
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";

interface SystemActivity {
  id: string;
  user_id: string;
  event_type: string;
  created_at: string;
  user_name?: string;
  event_description: string;
}

interface ActivityData {
  totalEvents: number;
  eventsByType: { type: string; count: number }[];
  userActivities: SystemActivity[];
}

const getDefaultActivityData = (): ActivityData => ({
  totalEvents: 0,
  eventsByType: [],
  userActivities: []
});

export const useRealSystemActivity = (timeRange: string) => {
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityData>(getDefaultActivityData());

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        logger.info('[SYSTEM-ACTIVITY] Iniciando busca de atividades', { timeRange });

        const activity = getDefaultActivityData();

        // Calcular período baseado no timeRange
        const now = new Date();
        let startDate = new Date(now);
        
        switch(timeRange) {
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
          default:
            startDate.setDate(now.getDate() - 30);
        }

        // 1. Buscar eventos de analytics com fallback
        try {
          const { data: analyticsData, error: analyticsError } = await supabase
            .from('analytics')
            .select('id, user_id, event_type, created_at, event_data')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false })
            .limit(100);
          
          if (analyticsError) {
            logger.warn('[SYSTEM-ACTIVITY] Erro ao buscar analytics:', analyticsError);
          } else {
            activity.totalEvents = analyticsData?.length || 0;
            
            // Agrupar por tipo de evento
            const eventGroups = analyticsData?.reduce((acc, event) => {
              const type = event.event_type || 'unknown';
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>) || {};

            activity.eventsByType = Object.entries(eventGroups)
              .map(([type, count]) => ({ type, count }))
              .sort((a, b) => b.count - a.count);
          }
        } catch (error) {
          logger.error('[SYSTEM-ACTIVITY] Erro na consulta de analytics:', error);
        }

        // 2. Buscar atividades de usuários com nomes
        try {
          const { data: recentAnalytics, error: recentError } = await supabase
            .from('analytics')
            .select(`
              id,
              user_id,
              event_type,
              created_at,
              event_data
            `)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (recentError) {
            logger.warn('[SYSTEM-ACTIVITY] Erro ao buscar atividades recentes:', recentError);
          } else if (recentAnalytics?.length) {
            // Buscar nomes dos usuários
            const userIds = [...new Set(recentAnalytics.map(a => a.user_id))];
            
            const { data: usersData, error: usersError } = await supabase
              .from('profiles')
              .select('id, name, email')
              .in('id', userIds);
            
            if (usersError) {
              logger.warn('[SYSTEM-ACTIVITY] Erro ao buscar nomes de usuários:', usersError);
            }

            const userMap = new Map(
              usersData?.map(user => [user.id, user.name || user.email || 'Usuário']) || []
            );

            activity.userActivities = recentAnalytics.map(event => ({
              id: event.id,
              user_id: event.user_id,
              event_type: event.event_type,
              created_at: event.created_at,
              user_name: userMap.get(event.user_id) || 'Usuário Desconhecido',
              event_description: getEventDescription(event.event_type, event.event_data)
            }));
          }
        } catch (error) {
          logger.error('[SYSTEM-ACTIVITY] Erro ao buscar atividades de usuários:', error);
        }

        logger.info('[SYSTEM-ACTIVITY] Atividades carregadas com sucesso', {
          totalEvents: activity.totalEvents,
          userActivitiesCount: activity.userActivities.length,
          eventTypesCount: activity.eventsByType.length
        });

        setActivityData(activity);

      } catch (error) {
        logger.error('[SYSTEM-ACTIVITY] Erro geral ao carregar atividades:', error);
        setActivityData(getDefaultActivityData());
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [timeRange]);

  return { activityData, loading };
};

function getEventDescription(eventType: string, eventData: any): string {
  switch (eventType) {
    case 'login':
      return 'Fez login no sistema';
    case 'view':
      return `Visualizou ${eventData?.type || 'conteúdo'}`;
    case 'complete':
      return `Completou ${eventData?.type || 'atividade'}`;
    case 'start':
      return `Iniciou ${eventData?.type || 'atividade'}`;
    case 'progress':
      return `Atualizou progresso em ${eventData?.type || 'atividade'}`;
    default:
      return `Ação: ${eventType}`;
  }
}
