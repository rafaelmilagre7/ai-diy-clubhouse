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
  user_id: string;
  month_year: string;
  matches_generated: number;
  connections_sent: number;
  connections_accepted: number;
  messages_sent: number;
  meetings_scheduled: number;
  avg_compatibility_score: number;
  connection_success_rate: number;
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
        .order('month_year', { ascending: false });

      if (error) throw error;
      return data as NetworkingMetrics[];
    },
    enabled: !!user?.id,
  });

  // Buscar eventos recentes
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

      if (error) throw error;
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

  // Calcular estatísticas agregadas
  const currentMetrics = metrics?.[0];
  const previousMetrics = metrics?.[1];

  const stats = {
    totalMatches: currentMetrics?.matches_generated || 0,
    totalConnections: currentMetrics?.connections_accepted || 0,
    totalMessages: currentMetrics?.messages_sent || 0,
    totalMeetings: currentMetrics?.meetings_scheduled || 0,
    avgCompatibility: currentMetrics?.avg_compatibility_score || 0,
    successRate: currentMetrics?.connection_success_rate || 0,
    
    // Comparação com mês anterior
    matchesGrowth: currentMetrics && previousMetrics 
      ? ((currentMetrics.matches_generated - previousMetrics.matches_generated) / previousMetrics.matches_generated * 100)
      : 0,
    connectionsGrowth: currentMetrics && previousMetrics
      ? ((currentMetrics.connections_accepted - previousMetrics.connections_accepted) / previousMetrics.connections_accepted * 100)
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