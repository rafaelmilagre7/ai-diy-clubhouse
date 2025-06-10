
import { useRealAdminStats } from "./dashboard/useRealAdminStats";
import { useRealSystemActivity } from "./dashboard/useRealSystemActivity";

export const useRealAdminDashboardData = (timeRange: string) => {
  const { statsData, loading: statsLoading } = useRealAdminStats(timeRange);
  const { activityData, loading: activityLoading } = useRealSystemActivity(timeRange);

  return {
    statsData,
    activityData,
    loading: statsLoading || activityLoading
  };
};
