import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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

interface ActivitySummary {
  totalEvents: number;
  eventsByType: { type: string; count: number }[];
  userActivities: SystemActivity[];
}

export const useRealSystemActivity = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivitySummary>({
    totalEvents: 0,
    eventsByType: [],
    userActivities: []
  });

  useEffect(() => {
    const fetchSystemActivity = async () => {
      try {
        setLoading(true);
        
        // Calcular data de início baseada no timeRange
        let startDate: string | null = null;
        
        if (timeRange !== 'all') {
          const now = new Date();
          let pastDate = new Date();
          
          switch (timeRange) {
            case '7d':
              pastDate.setDate(now.getDate() - 7);
              break;
            case '30d':
              pastDate.setDate(now.getDate() - 30);
              break;
            case '90d':
              pastDate.setDate(now.getDate() - 90);
              break;
            default:
              pastDate.setDate(now.getDate() - 30);
          }
          
          startDate = pastDate.toISOString();
        }
        
        // Buscar atividades do analytics com filtro de data opcional
        let analyticsQuery = supabase
          .from('analytics')
          .select(`
            id,
            user_id,
            event_type,
            created_at,
            event_data
          `)
          .order('created_at', { ascending: false });
        
        if (startDate) {
          analyticsQuery = analyticsQuery.gte('created_at', startDate);
        }
        
        // Aumentar limite para mostrar mais diversidade de usuários
        const { data: analytics, error: analyticsError } = await analyticsQuery.limit(200);
        
        if (analyticsError) {
          console.warn("Erro ao buscar analytics:", analyticsError);
        }
        
        // Processar atividades para garantir diversidade de usuários
        const processedActivities = (analytics as any) || [];
        
        // Agrupar por usuário para balancear a exibição
        const activitiesByUser = processedActivities.reduce((acc: any, activity: any) => {
          const userId = activity.user_id;
          if (!acc[userId]) {
            acc[userId] = [];
          }
          acc[userId].push(activity);
          return acc;
        }, {});
        
        // Selecionar até 3 atividades por usuário para maior diversidade
        const balancedActivities: any[] = [];
        Object.values(activitiesByUser).forEach((userActivities: any) => {
          balancedActivities.push(...userActivities.slice(0, 3));
        });
        
        // Ordenar por data e limitar a 50 atividades finais
        const finalActivities = balancedActivities
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 50);
        
        // Buscar informações dos usuários para as atividades selecionadas
        const userIds = finalActivities.map(a => a.user_id).filter(Boolean);
        const uniqueUserIds = [...new Set(userIds)];
        
        let userProfiles: any[] = [];
        if (uniqueUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', uniqueUserIds as any);
          
          userProfiles = (profiles as any) || [];
        }
        
        // Processar atividades com nomes de usuários
        const userActivities: SystemActivity[] = finalActivities.map((activity: any) => {
          const userProfile = userProfiles.find(p => p.id === activity.user_id);
          return {
            id: activity.id,
            user_id: activity.user_id,
            event_type: activity.event_type,
            created_at: activity.created_at,
            user_name: userProfile?.name || 'Usuário Desconhecido',
            event_description: generateEventDescription(activity.event_type, activity.event_data)
          };
        });
        
        // Agrupar por tipo de evento
        const eventsByType = groupEventsByType(userActivities);
        
        // Log de segurança para monitoramento
        logger.info('System activity data loaded', {
          component: 'ADMIN_DASHBOARD',
          timeRange,
          totalEvents: userActivities.length,
          uniqueUsers: uniqueUserIds.length,
          eventTypes: eventsByType.length,
          dateFilter: startDate ? 'applied' : 'all_time'
        });
        
        setActivityData({
          totalEvents: userActivities.length,
          eventsByType,
          userActivities
        });

      } catch (error: any) {
        console.error("Erro ao carregar atividade do sistema:", error);
        
        // Log de erro de segurança
        logger.error('Failed to load system activity', error, {
          component: 'ADMIN_DASHBOARD',
          timeRange
        });
        
        toast({
          title: "Erro ao carregar atividades",
          description: "Ocorreu um erro ao carregar as atividades do sistema.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSystemActivity();
  }, [toast, timeRange]);

  return { activityData, loading };
};

// Método para gerar descrição legível do evento
const generateEventDescription = (eventType: string, eventData: any): string => {
  const descriptions: Record<string, string> = {
    'view': 'Visualizou conteúdo',
    'start': 'Iniciou sessão',
    'complete': 'Completou atividade',
    'login': 'Fez login no sistema',
    'logout': 'Fez logout do sistema',
    'create': 'Criou novo item',
    'update': 'Atualizou item',
    'delete': 'Removeu item'
  };
  
  let description = descriptions[eventType] || `Executou ação: ${eventType}`;
  
  // Adicionar detalhes do eventData se disponível
  if (eventData && typeof eventData === 'object') {
    if (eventData.page) {
      description += ` na página ${eventData.page}`;
    }
    if (eventData.resource) {
      description += ` (${eventData.resource})`;
    }
  }
  
  return description;
};

// Método para agrupar eventos por tipo
const groupEventsByType = (activities: SystemActivity[]): { type: string; count: number }[] => {
  const grouped = activities.reduce((acc, activity) => {
    const type = activity.event_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(grouped)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
};
