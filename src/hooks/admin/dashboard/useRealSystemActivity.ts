
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { secureLogger } from "@/utils/secureLogger";

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
        const now = new Date();
        let startDate = new Date();
        
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
        
        // Buscar atividades do analytics
        const { data: analytics, error: analyticsError } = await supabase
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
        
        if (analyticsError) {
          console.warn("Erro ao buscar analytics:", analyticsError);
        }
        
        // Buscar informações dos usuários para as atividades
        const userIds = analytics?.map(a => a.user_id).filter(Boolean) || [];
        const uniqueUserIds = [...new Set(userIds)];
        
        let userProfiles: any[] = [];
        if (uniqueUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', uniqueUserIds);
          
          userProfiles = profiles || [];
        }
        
        // Processar atividades com nomes de usuários
        const userActivities: SystemActivity[] = (analytics || []).map(activity => {
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
        secureLogger.info('System activity data loaded', 'ADMIN_DASHBOARD', {
          timeRange,
          totalEvents: userActivities.length,
          uniqueUsers: uniqueUserIds.length,
          eventTypes: eventsByType.length
        });
        
        setActivityData({
          totalEvents: userActivities.length,
          eventsByType,
          userActivities
        });

      } catch (error: any) {
        console.error("Erro ao carregar atividade do sistema:", error);
        
        // Log de erro de segurança
        secureLogger.error('Failed to load system activity', 'ADMIN_DASHBOARD', {
          error: error.message,
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
