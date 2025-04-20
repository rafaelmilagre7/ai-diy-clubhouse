
import { useAdminStats } from "./dashboard/useAdminStats";
import { useEngagementData } from "./dashboard/useEngagementData";
import { useCompletionRateData } from "./dashboard/useCompletionRateData";

export const useAdminDashboardData = (timeRange: string) => {
  const { statsData, loading: statsLoading } = useAdminStats(timeRange);
  const { engagementData, loading: engagementLoading } = useEngagementData(timeRange);
  const { completionRateData, loading: completionLoading } = useCompletionRateData(timeRange);

  const loading = statsLoading || engagementLoading || completionLoading;

  return {
    statsData,
    engagementData,
    completionRateData,
    recentActivities: [], // Mantido por compatibilidade
    loading
  };
};
