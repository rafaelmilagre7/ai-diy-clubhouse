
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInviteCache } from './useInviteCache';
import { useDataValidation } from '@/hooks/analytics/useDataValidation';

interface OptimizedAnalyticsData {
  metrics: {
    totalInvites: number;
    acceptanceRate: number;
    averageResponseTime: number;
    topPerformingChannel: string;
  };
  trends: {
    period: string;
    invitesSent: number;
    acceptanceRate: number;
  }[];
  segmentation: {
    channel: string;
    role: string;
    status: string;
    count: number;
    percentage: number;
  }[];
}

export const useOptimizedAnalytics = (timeRange: string = '30d') => {
  const [filters, setFilters] = useState({
    channel: 'all',
    role: 'all',
    status: 'all'
  });

  const { optimizeQuery } = useInviteCache();
  const { validateAnalyticsData } = useDataValidation();

  const { data, loading, error, refetch } = useQuery({
    queryKey: ['invite-analytics-optimized', timeRange, filters],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange.replace('d', '')));

      // Buscar dados otimizados com agregações
      const [metricsResult, trendsResult, segmentationResult] = await Promise.all([
        // Métricas principais
        supabase
          .from('invites')
          .select(`
            id,
            created_at,
            used_at,
            invite_deliveries(status, channel, created_at)
          `)
          .gte('created_at', startDate.toISOString()),

        // Tendências temporais
        supabase.rpc('get_invite_trends', {
          start_date: startDate.toISOString(),
          interval_days: 7
        }),

        // Segmentação
        supabase
          .from('invites')
          .select(`
            role_id,
            invite_deliveries(channel, status),
            user_roles(name)
          `)
          .gte('created_at', startDate.toISOString())
      ]);

      // Processar métricas
      const invites = metricsResult.data || [];
      const totalInvites = invites.length;
      const acceptedInvites = invites.filter(i => i.used_at).length;
      const acceptanceRate = totalInvites > 0 ? (acceptedInvites / totalInvites) * 100 : 0;

      // Calcular tempo médio de resposta
      const responseTimes = invites
        .filter(i => i.used_at)
        .map(i => new Date(i.used_at!).getTime() - new Date(i.created_at).getTime());
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / (1000 * 60 * 60 * 24)
        : 0;

      // Determinar canal com melhor performance
      const channelStats = new Map();
      invites.forEach(invite => {
        const deliveries = invite.invite_deliveries || [];
        deliveries.forEach((delivery: any) => {
          const channel = delivery.channel;
          if (!channelStats.has(channel)) {
            channelStats.set(channel, { total: 0, accepted: 0 });
          }
          channelStats.get(channel).total++;
          if (invite.used_at) {
            channelStats.get(channel).accepted++;
          }
        });
      });

      let topPerformingChannel = 'email';
      let bestRate = 0;
      channelStats.forEach((stats, channel) => {
        const rate = stats.total > 0 ? stats.accepted / stats.total : 0;
        if (rate > bestRate) {
          bestRate = rate;
          topPerformingChannel = channel;
        }
      });

      // Processar segmentação
      const segmentationData: OptimizedAnalyticsData['segmentation'] = [];
      const segmentMap = new Map<string, number>();

      invites.forEach(invite => {
        const deliveries = invite.invite_deliveries || [];
        const roleName = (invite as any).user_roles?.name || 'Unknown';
        
        deliveries.forEach((delivery: any) => {
          const segmentKey = `${delivery.channel}-${roleName}-${delivery.status}`;
          segmentMap.set(segmentKey, (segmentMap.get(segmentKey) || 0) + 1);
        });
      });

      segmentMap.forEach((count, key) => {
        const [channel, role, status] = key.split('-');
        segmentationData.push({
          channel,
          role,
          status,
          count,
          percentage: totalInvites > 0 ? (count / totalInvites) * 100 : 0
        });
      });

      const analyticsData: OptimizedAnalyticsData = {
        metrics: {
          totalInvites,
          acceptanceRate,
          averageResponseTime,
          topPerformingChannel
        },
        trends: trendsResult.data || [],
        segmentation: segmentationData
      };

      // Validar dados antes de retornar
      const validation = validateAnalyticsData(analyticsData, 'optimized-analytics');
      if (!validation.isValid) {
        console.warn('Dados de analytics inválidos:', validation.errors);
      }

      return analyticsData;
    },
    ...optimizeQuery(['invite-analytics-optimized'])
  });

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const exportData = useCallback(async () => {
    if (!data) return;

    try {
      const csvContent = [
        'Channel,Role,Status,Count,Percentage',
        ...data.segmentation.map(item => 
          `${item.channel},${item.role},${item.status},${item.count},${item.percentage.toFixed(2)}%`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invite-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
  }, [data]);

  return {
    data: data || {
      metrics: {
        totalInvites: 0,
        acceptanceRate: 0,
        averageResponseTime: 0,
        topPerformingChannel: 'email'
      },
      trends: [],
      segmentation: []
    },
    loading,
    error,
    filters,
    updateFilters,
    exportData,
    refetch
  };
};
