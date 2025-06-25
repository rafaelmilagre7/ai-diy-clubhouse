
import { useRealAdminStats } from "./dashboard/useRealAdminStats";
import { useRealSystemActivity } from "./dashboard/useRealSystemActivity";
import { logger } from "@/utils/logger";

export const useRealAdminDashboardData = (timeRange: string) => {
  const { statsData, loading: statsLoading } = useRealAdminStats(timeRange);
  const { activityData, loading: activityLoading } = useRealSystemActivity(timeRange);

  const loading = statsLoading || activityLoading;

  // Log do estado atual para debug
  if (import.meta.env.DEV) {
    logger.info('[ADMIN-DASHBOARD] Estado dos dados:', {
      statsLoading,
      activityLoading,
      totalLoading: loading,
      hasStatsData: !!statsData,
      hasActivityData: !!activityData,
      timeRange
    });
  }

  return {
    statsData,
    activityData,
    loading
  };
};
