
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

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
    const fetchRealActivity = async () => {
      try {
        setLoading(true);
        
        // Definir período baseado no timeRange
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
            startDate.setFullYear(2020); // Todo período
        }
        
        // Buscar atividades recentes com dados do usuário
        const { data: analytics, error: analyticsError } = await supabase
          .from('analytics')
          .select(`
            id,
            user_id,
            event_type,
            event_data,
            created_at,
            profiles!inner(name)
          `)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (analyticsError) throw analyticsError;
        
        // Buscar contagem total de eventos
        const { count: totalEvents, error: countError } = await supabase
          .from('analytics')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString());
        
        if (countError) throw countError;
        
        // Processar dados
        const eventsByType = analytics?.reduce((acc, event) => {
          const existing = acc.find(e => e.type === event.event_type);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ type: event.event_type, count: 1 });
          }
          return acc;
        }, [] as { type: string; count: number }[]) || [];
        
        // Mapear descrições dos eventos
        const getEventDescription = (eventType: string, eventData: any) => {
          switch (eventType) {
            case 'login':
              return 'Fez login na plataforma';
            case 'solution_view':
              return `Visualizou uma solução`;
            case 'solution_start':
              return `Iniciou implementação de solução`;
            case 'solution_complete':
              return `Completou implementação`;
            case 'lesson_view':
              return `Acessou uma aula`;
            case 'lesson_complete':
              return `Completou uma aula`;
            default:
              return `Realizou ação: ${eventType}`;
          }
        };
        
        const userActivities: SystemActivity[] = analytics?.map(event => ({
          id: event.id,
          user_id: event.user_id,
          event_type: event.event_type,
          created_at: event.created_at,
          user_name: (event.profiles as any)?.name || 'Usuário desconhecido',
          event_description: getEventDescription(event.event_type, event.event_data)
        })) || [];

        setActivityData({
          totalEvents: totalEvents || 0,
          eventsByType: eventsByType.sort((a, b) => b.count - a.count),
          userActivities
        });

      } catch (error: any) {
        console.error("Erro ao carregar atividades do sistema:", error);
        toast({
          title: "Erro ao carregar atividades",
          description: "Ocorreu um erro ao carregar as atividades do sistema.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRealActivity();
  }, [toast, timeRange]);

  return { activityData, loading };
};
