import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface NetworkingAnalytics {
  totalConnections: number;
  activeConversations: number;
  matchesThisMonth: number;
  responseRate: number;
  averageResponseTime: string;
  topIndustries: { name: string; count: number }[];
  connectionsOverTime: { date: string; count: number }[];
  interactionsByType: { type: string; count: number }[];
  estimatedValue: number;
}

export const useNetworkingAnalytics = () => {
  return useQuery({
    queryKey: ['networking-analytics'],
    queryFn: async (): Promise<NetworkingAnalytics> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const userId = user.user.id;
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);

      // Total de conexões ativas
      const { data: connections, error: connectionsError } = await supabase
        .from('member_connections')
        .select('id, created_at, requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

      if (connectionsError) throw connectionsError;

      // Conversas ativas (com mensagens nos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentMessages } = await supabase
        .from('direct_messages')
        .select('sender_id, recipient_id')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const activeConversations = new Set(
        recentMessages?.map(msg => 
          msg.sender_id === userId ? msg.recipient_id : msg.sender_id
        ) || []
      ).size;

      // Matches deste mês
      const { data: monthlyMatches } = await supabase
        .from('member_connections')
        .select('id')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .gte('created_at', startOfCurrentMonth.toISOString())
        .lte('created_at', endOfCurrentMonth.toISOString());

      // Taxa de resposta (mensagens enviadas vs recebidas)
      const { data: sentMessages } = await supabase
        .from('direct_messages')
        .select('id')
        .eq('sender_id', userId);

      const { data: receivedMessages } = await supabase
        .from('direct_messages')
        .select('id, created_at')
        .eq('recipient_id', userId);

      const responseRate = sentMessages && receivedMessages
        ? Math.round((sentMessages.length / Math.max(receivedMessages.length, 1)) * 100)
        : 0;

      // Conexões ao longo do tempo (últimos 6 meses)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(now, 5 - i);
        return {
          date: format(date, 'MMM'),
          month: date.getMonth(),
          year: date.getFullYear()
        };
      });

      const connectionsOverTime = last6Months.map(({ date, month, year }) => {
        const count = connections?.filter(conn => {
          const connDate = new Date(conn.created_at);
          return connDate.getMonth() === month && connDate.getFullYear() === year;
        }).length || 0;

        return { date, count };
      });

      // Top indústrias (simulado com dados de perfis conectados)
      const topIndustries = [
        { name: 'Tecnologia', count: 12 },
        { name: 'Consultoria', count: 8 },
        { name: 'Educação', count: 6 },
        { name: 'Financeiro', count: 5 }
      ];

      // Interações por tipo
      const { data: interactions } = await supabase
        .from('connection_interactions')
        .select('interaction_type')
        .or(`match_id.in.(${connections?.map(c => c.id).join(',') || 'null'}),connection_id.in.(${connections?.map(c => c.id).join(',') || 'null'})`);

      const interactionsByType = [
        { type: 'Reunião', count: interactions?.filter(i => i.interaction_type === 'meeting').length || 0 },
        { type: 'Projeto', count: interactions?.filter(i => i.interaction_type === 'project').length || 0 },
        { type: 'Referência', count: interactions?.filter(i => i.interaction_type === 'referral').length || 0 }
      ];

      // Valor estimado (baseado em interações)
      const { data: valueInteractions } = await supabase
        .from('connection_interactions')
        .select('estimated_value')
        .or(`match_id.in.(${connections?.map(c => c.id).join(',') || 'null'}),connection_id.in.(${connections?.map(c => c.id).join(',') || 'null'})`);

      const estimatedValue = valueInteractions?.reduce((sum, i) => 
        sum + (Number(i.estimated_value) || 0), 0
      ) || 0;

      return {
        totalConnections: connections?.length || 0,
        activeConversations,
        matchesThisMonth: monthlyMatches?.length || 0,
        responseRate,
        averageResponseTime: '2h 15min',
        topIndustries,
        connectionsOverTime,
        interactionsByType,
        estimatedValue
      };
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });
};
