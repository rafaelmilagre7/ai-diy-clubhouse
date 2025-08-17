import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface NetworkingAnalytics {
  id: string;
  user_id: string;
  event_type: 'match_generated' | 'connection_sent' | 'connection_accepted' | 'message_sent' | 'meeting_scheduled';
  event_data: Record<string, any>;
  compatibility_score?: number;
  match_type?: string;
  partner_id?: string;
  created_at: string;
  month_year: string;
}

export interface NetworkingMetrics {
  id: string;
  user_id: string;
  metric_month: string;
  total_matches: number;
  active_connections: number;
  compatibility_score: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export const useNetworkingAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar métricas do usuário
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['networking-metrics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('networking_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('metric_month', { ascending: false });

      if (error) {
        console.error('Erro ao buscar métricas de networking:', error);
        return [];
      }
      return data as NetworkingMetrics[];
    },
    enabled: !!user?.id,
  });

  // Buscar eventos recentes com tratamento de erro robusto
  const { data: recentEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['networking-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('networking_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar eventos de networking:', error);
        return [];
      }
      return data as NetworkingAnalytics[];
    },
    enabled: !!user?.id,
  });

  // Registrar evento de analytics
  const logEvent = useMutation({
    mutationFn: async (event: {
      event_type: NetworkingAnalytics['event_type'];
      event_data?: Record<string, any>;
      compatibility_score?: number;
      match_type?: string;
      partner_id?: string;
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('networking_analytics')
        .insert({
          user_id: user.id,
          ...event,
          event_data: event.event_data || {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networking-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['networking-analytics'] });
    }
  });

  // Calcular estatísticas agregadas baseadas na estrutura real da tabela
  const currentMetrics = metrics?.[0];
  const previousMetrics = metrics?.[1];

  const stats = {
    totalMatches: currentMetrics?.total_matches || 0,
    totalConnections: currentMetrics?.active_connections || 0,
    totalMessages: 0, // Não disponível na estrutura atual
    totalMeetings: 0, // Não disponível na estrutura atual
    avgCompatibility: currentMetrics?.compatibility_score || 0,
    successRate: 0, // Não disponível na estrutura atual
    
    // Comparação com mês anterior
    matchesGrowth: currentMetrics && previousMetrics 
      ? ((currentMetrics.total_matches - previousMetrics.total_matches) / Math.max(previousMetrics.total_matches, 1) * 100)
      : 0,
    connectionsGrowth: currentMetrics && previousMetrics
      ? ((currentMetrics.active_connections - previousMetrics.active_connections) / Math.max(previousMetrics.active_connections, 1) * 100)
      : 0,
  };

  return {
    metrics,
    recentEvents,
    stats,
    logEvent,
    isLoading: metricsLoading || eventsLoading
  };
};