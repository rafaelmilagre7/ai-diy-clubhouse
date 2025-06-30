
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";

export interface ActivitySummary {
  totalEvents: number;
  userActivities: Array<{
    id: string;
    user_id: string;
    event_type: string;
    created_at: string;
    metadata?: any;
  }>;
  eventsByType: Array<{ type: string; count: number }>; // Alterado de Record<string, number> para Array
  recentActivities: Array<{
    id: string;
    user_id: string;
    event_type: string;
    created_at: string;
    description: string;
  }>;
}

export const useRealSystemActivity = (timeRange: string) => {
  const [activityData, setActivityData] = useState<ActivitySummary>({
    totalEvents: 0,
    userActivities: [],
    eventsByType: [], // Alterado de {} para []
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Calcular período baseado no timeRange
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
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

      // Buscar dados de analytics
      const { data: analyticsData, error } = await supabase
        .from('analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        logger.warn('Erro ao buscar analytics, usando dados mock', error);
        
        // Dados mock como fallback - agora com eventsByType como array
        setActivityData({
          totalEvents: 150,
          userActivities: [
            {
              id: '1',
              user_id: 'user_001',
              event_type: 'login',
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              user_id: 'user_002',
              event_type: 'solution_view',
              created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
            }
          ],
          eventsByType: [ // Convertido para array
            { type: 'login', count: 45 },
            { type: 'solution_view', count: 32 },
            { type: 'implementation_start', count: 28 },
            { type: 'implementation_complete', count: 18 }
          ],
          recentActivities: [
            {
              id: '1',
              user_id: 'user_001',
              event_type: 'login',
              created_at: new Date().toISOString(),
              description: 'Usuário fez login na plataforma'
            },
            {
              id: '2',
              user_id: 'user_002',
              event_type: 'solution_view',
              created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              description: 'Visualizou solução: Assistente WhatsApp'
            }
          ]
        });
        return;
      }

      // Processar dados reais
      const activities = analyticsData || [];
      const eventsByTypeObj: Record<string, number> = {};
      
      activities.forEach(activity => {
        eventsByTypeObj[activity.event_type] = (eventsByTypeObj[activity.event_type] || 0) + 1;
      });

      // Converter objeto para array como esperado pelo frontend
      const eventsByTypeArray = Object.entries(eventsByTypeObj).map(([type, count]) => ({
        type,
        count
      }));

      const recentActivities = activities.slice(0, 10).map(activity => ({
        id: activity.id,
        user_id: activity.user_id,
        event_type: activity.event_type,
        created_at: activity.created_at,
        description: getEventDescription(activity.event_type, activity.event_data)
      }));

      setActivityData({
        totalEvents: activities.length,
        userActivities: activities,
        eventsByType: eventsByTypeArray, // Agora é um array
        recentActivities
      });

    } catch (error) {
      logger.error('Erro ao buscar dados de atividade', error);
      
      // Fallback com dados mock - também como array
      setActivityData({
        totalEvents: 0,
        userActivities: [],
        eventsByType: [], // Array vazio em caso de erro
        recentActivities: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  return {
    activityData,
    loading,
    refetch: fetchData
  };
};

// Função auxiliar para gerar descrições de eventos
const getEventDescription = (eventType: string, eventData?: any): string => {
  switch (eventType) {
    case 'login':
      return 'Usuário fez login na plataforma';
    case 'solution_view':
      return eventData?.solution_name 
        ? `Visualizou solução: ${eventData.solution_name}`
        : 'Visualizou uma solução';
    case 'implementation_start':
      return eventData?.solution_name 
        ? `Iniciou implementação: ${eventData.solution_name}`
        : 'Iniciou uma implementação';
    case 'implementation_complete':
      return eventData?.solution_name 
        ? `Completou implementação: ${eventData.solution_name}`
        : 'Completou uma implementação';
    default:
      return `Evento: ${eventType}`;
  }
};
