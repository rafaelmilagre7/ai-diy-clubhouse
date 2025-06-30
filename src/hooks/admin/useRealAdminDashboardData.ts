
import { useRealAdminStats } from "./dashboard/useRealAdminStats";
import { useRealSystemActivity } from "./dashboard/useRealSystemActivity";

export const useRealAdminDashboardData = (timeRange: string) => {
  const { statsData, loading: statsLoading, refetch: refetchStats } = useRealAdminStats(timeRange);
  const { activityData, loading: activityLoading, refetch: refetchActivity } = useRealSystemActivity(timeRange);

  const refetch = async () => {
    await Promise.all([
      refetchStats?.(),
      refetchActivity?.()
    ]);
  };

  return {
    statsData,
    activityData,
    loading: statsLoading || activityLoading,
    refetch
  };
};
