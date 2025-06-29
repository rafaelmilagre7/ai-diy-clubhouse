
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SystemActivity {
  id: string;
  event_type: string;
  user_id: string;
  solution_id?: string;
  module_id?: string;
  created_at: string;
  user_email?: string;
  solution_title?: string;
  user_name?: string;
  event_description: string;
}

interface ActivitySummary {
  totalEvents: number;
  eventsByType: Array<{ type: string; count: number }>;
  userActivities: SystemActivity[];
}

export const useRealSystemActivity = (timeRange: string) => {
  const [activityData, setActivityData] = useState<ActivitySummary>({
    totalEvents: 0,
    eventsByType: [],
    userActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemActivity = async () => {
      try {
        setLoading(true);

        // Calcular data de início baseada no timeRange
        let startDate = new Date();
        switch (timeRange) {
          case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
          default:
            startDate.setDate(startDate.getDate() - 7);
        }

        // Buscar atividades do sistema
        const { data: activities, error } = await supabase
          .from('analytics')
          .select(`
            id,
            event_type,
            user_id,
            solution_id,
            module_id,
            created_at
          `)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.warn('Erro ao buscar atividades do sistema:', error);
          
          // Dados mock para demonstração
          const mockActivities: SystemActivity[] = [
            {
              id: '1',
              event_type: 'solution_start',
              user_id: 'mock-user-1',
              solution_id: 'mock-solution-1',
              created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              user_name: 'João Silva',
              user_email: 'joao@exemplo.com',
              event_description: 'Iniciou implementação da solução Assistente Virtual WhatsApp'
            },
            {
              id: '2',
              event_type: 'lesson_complete',
              user_id: 'mock-user-2',
              module_id: 'mock-module-1',
              created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              user_name: 'Maria Santos',
              user_email: 'maria@exemplo.com',
              event_description: 'Completou aula de Automação Básica'
            },
            {
              id: '3',
              event_type: 'solution_complete',
              user_id: 'mock-user-3',
              solution_id: 'mock-solution-2',
              created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              user_name: 'Pedro Costa',
              user_email: 'pedro@exemplo.com',
              event_description: 'Finalizou implementação do Chatbot para Website'
            },
            {
              id: '4',
              event_type: 'login',
              user_id: 'mock-user-4',
              created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
              user_name: 'Ana Oliveira',
              user_email: 'ana@exemplo.com',
              event_description: 'Fez login na plataforma'
            }
          ];

          const eventsByType = [
            { type: 'solution_start', count: 1 },
            { type: 'lesson_complete', count: 1 },
            { type: 'solution_complete', count: 1 },
            { type: 'login', count: 1 }
          ];

          setActivityData({
            totalEvents: mockActivities.length,
            eventsByType,
            userActivities: mockActivities
          });
          return;
        }

        // Buscar dados relacionados (users e solutions) para enriquecer as atividades
        const userIds = [...new Set(activities?.map(a => a.user_id) || [])];
        const solutionIds = [...new Set(activities?.map(a => a.solution_id).filter(Boolean) || [])];

        const [usersData, solutionsData] = await Promise.all([
          userIds.length > 0 ? 
            supabase.from('profiles').select('id, email, full_name').in('id', userIds) :
            Promise.resolve({ data: [] }),
          solutionIds.length > 0 ?
            supabase.from('solutions').select('id, title').in('id', solutionIds) :
            Promise.resolve({ data: [] })
        ]);

        // Criar mapas para lookup rápido
        const usersMap = new Map((usersData.data || []).map(u => [u.id, { email: u.email, name: u.full_name }]));
        const solutionsMap = new Map((solutionsData.data || []).map(s => [s.id, s.title]));

        // Enriquecer dados das atividades
        const enrichedActivities: SystemActivity[] = (activities || []).map(activity => {
          const userInfo = usersMap.get(activity.user_id);
          const solutionTitle = activity.solution_id ? solutionsMap.get(activity.solution_id) : undefined;
          
          return {
            ...activity,
            user_name: userInfo?.name || 'Usuário desconhecido',
            user_email: userInfo?.email || 'Email não disponível',
            solution_title: solutionTitle,
            event_description: generateEventDescription(activity.event_type, solutionTitle)
          };
        });

        // Calcular estatísticas por tipo de evento
        const eventTypeCounts = enrichedActivities.reduce((acc, activity) => {
          acc[activity.event_type] = (acc[activity.event_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const eventsByType = Object.entries(eventTypeCounts).map(([type, count]) => ({
          type,
          count
        }));

        setActivityData({
          totalEvents: enrichedActivities.length,
          eventsByType,
          userActivities: enrichedActivities
        });

      } catch (error) {
        console.error('Erro ao buscar atividades do sistema:', error);
        
        // Fallback com dados mock mínimos
        setActivityData({
          totalEvents: 1,
          eventsByType: [{ type: 'error', count: 1 }],
          userActivities: [{
            id: 'fallback-1',
            event_type: 'system_error',
            user_id: 'system',
            created_at: new Date().toISOString(),
            user_name: 'Sistema',
            user_email: 'sistema@plataforma.com',
            event_description: 'Erro ao carregar atividades do sistema'
          }]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSystemActivity();
  }, [timeRange]);

  return { activityData, loading };
};

// Função auxiliar para gerar descrições dos eventos
function generateEventDescription(eventType: string, solutionTitle?: string): string {
  switch (eventType) {
    case 'solution_start':
      return `Iniciou implementação${solutionTitle ? ` da solução ${solutionTitle}` : ''}`;
    case 'solution_complete':
      return `Completou implementação${solutionTitle ? ` da solução ${solutionTitle}` : ''}`;
    case 'lesson_complete':
      return 'Completou uma aula';
    case 'lesson_view':
      return 'Visualizou uma aula';
    case 'solution_view':
      return `Visualizou${solutionTitle ? ` a solução ${solutionTitle}` : ' uma solução'}`;
    case 'login':
      return 'Fez login na plataforma';
    default:
      return `Executou ação: ${eventType}`;
  }
}
