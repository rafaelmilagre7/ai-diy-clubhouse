
import { useRealAdminStats } from "./admin/dashboard/useRealAdminStats";
import { useRealSystemActivity } from "./admin/dashboard/useRealSystemActivity";

export const useRealAdminDashboardData = (timeRange: string) => {
  const { statsData, loading: statsLoading, refetch: refetchStats } = useRealAdminStats(timeRange);
  const { activityData, loading: activityLoading, refetch: refetchActivity } = useRealSystemActivity(timeRange);

  const refetch = async () => {
    console.log('🔄 Atualizando dashboard administrativo...');
    
    try {
      await Promise.all([
        refetchStats?.(),
        refetchActivity?.()
      ]);
      
      console.log('✅ Dashboard atualizado com sucesso');
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
      lastUpdate: new Date().toISOString()
    }
  };
};
