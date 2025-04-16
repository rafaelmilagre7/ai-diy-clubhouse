
import { useState, useEffect } from "react";
import { UserStats } from "./types";
import { useUserStatsData } from "./useUserStatsData";
import { 
  DEFAULT_STATS,
  calculateCategoryDistribution,
  calculateTimeMetrics,
  findLatestActivity
} from "./userStatsUtils";

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const { solutions, progressData, loading, error } = useUserStatsData();

  useEffect(() => {
    if (loading) return;

    try {
      // Ensure solutions is an array
      const solutionsArray = solutions || [];
      const userProgress = progressData || [];
      
      // Calculate basic statistics
      const totalSolutions = solutionsArray.length;
      const completedSolutions = userProgress.filter(p => p.is_completed).length;
      const inProgressSolutions = userProgress.filter(p => !p.is_completed).length;
      const completionRate = totalSolutions > 0 
        ? Math.round((completedSolutions / totalSolutions) * 100) 
        : 0;

      // Calculate category distribution
      const categoryDistribution = calculateCategoryDistribution(solutionsArray, userProgress);

      // Calculate time metrics
      const { totalTimeSpent, avgTimePerSolution } = calculateTimeMetrics(
        completedSolutions, 
        inProgressSolutions
      );

      // Find latest activity date
      const lastActivity = findLatestActivity(userProgress);

      // Update stats state
      setStats({
        totalSolutions,
        completedSolutions,
        inProgressSolutions,
        completionRate,
        totalTimeSpent,
        avgTimePerSolution,
        lastActivity,
        categoryDistribution
      });
    } catch (err: any) {
      console.error("Error calculating user statistics:", err);
      // Maintain previous stats if there was an error
    }
  }, [solutions, progressData, loading]);

  return { 
    stats, 
    loading, 
    error,
    // Helper functions
    hasStats: stats.totalSolutions > 0,
    hasCompleted: stats.completedSolutions > 0
  };
};
