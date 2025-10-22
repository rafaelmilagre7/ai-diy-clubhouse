
import { useRealAdminStats } from "./dashboard/useRealAdminStats";
import { useRealSystemActivity } from "./dashboard/useRealSystemActivity";

export const useRealAdminDashboardData = (timeRange: string) => {
  const { statsData, loading: statsLoading, refetch: refetchStats } = useRealAdminStats(timeRange);
  const { data: activityData, isLoading: activityLoading, refetch: refetchActivity } = useRealSystemActivity(timeRange);

  const refetch = async () => {
    try {
      // Forçar atualização sequencial para garantir sincronização
      await refetchStats?.();
      await refetchActivity?.();
    } catch (error) {
      console.error('❌ Erro ao atualizar dashboard:', error);
    }
  };

  return {
    statsData,
    activityData,
    loading: statsLoading || activityLoading,
    refetch,
    // Informações adicionais para debugging
    debug: {
      hasStatsData: !!statsData,
      hasActivityData: !!activityData,
      timeRange,
      lastUpdate: new Date().toISOString(),
      statsTimeRange: statsData?.timeRange,
      activityTimeRange: activityData?.timeRange,
      statsLoading,
      activityLoading,
      statsDataKeys: statsData ? Object.keys(statsData) : [],
      activityDataKeys: activityData ? Object.keys(activityData) : []
    }
  };
};
