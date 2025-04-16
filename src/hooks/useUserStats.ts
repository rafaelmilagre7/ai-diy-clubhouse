
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";

// Define solution category types for type safety
export type SolutionCategory = "revenue" | "operational" | "strategy";

// Type for category distribution metrics
export interface CategoryDistribution {
  revenue: { total: number; completed: number };
  operational: { total: number; completed: number };
  strategy: { total: number; completed: number };
}

// Comprehensive type for user statistics
export interface UserStats {
  totalSolutions: number;
  completedSolutions: number;
  inProgressSolutions: number;
  completionRate: number;
  totalTimeSpent: number;
  avgTimePerSolution: number;
  lastActivity: string | null;
  categoryDistribution: CategoryDistribution;
}

// Default empty state for user stats
const DEFAULT_STATS: UserStats = {
  totalSolutions: 0,
  completedSolutions: 0,
  inProgressSolutions: 0,
  completionRate: 0,
  totalTimeSpent: 0,
  avgTimePerSolution: 0,
  lastActivity: null,
  categoryDistribution: {
    revenue: { total: 0, completed: 0 },
    operational: { total: 0, completed: 0 },
    strategy: { total: 0, completed: 0 }
  }
};

export const useUserStats = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all published solutions
        const { data: solutions, error: solutionsError } = await supabase
          .from("solutions")
          .select("id, category, difficulty")
          .eq("published", true);

        if (solutionsError) {
          throw new Error(`Error fetching solutions: ${solutionsError.message}`);
        }

        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id);

        if (progressError) {
          throw new Error(`Error fetching progress: ${progressError.message}`);
        }

        // Optional: Fetch analytics data 
        const { data: analyticsData, error: analyticsError } = await supabase
          .from("analytics")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (analyticsError && !analyticsError.message.includes("does not exist")) {
          console.warn("Analytics data could not be fetched:", analyticsError.message);
        }

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

        // Initialize category distribution
        const categoryDistribution: CategoryDistribution = {
          revenue: { total: 0, completed: 0 },
          operational: { total: 0, completed: 0 },
          strategy: { total: 0, completed: 0 }
        };

        // Count solutions by category
        solutionsArray.forEach(solution => {
          const category = solution.category as SolutionCategory;
          if (category in categoryDistribution) {
            categoryDistribution[category].total++;
          }
        });

        // Count completed solutions by category
        if (userProgress.length > 0 && solutionsArray.length > 0) {
          // Create a map for faster lookups
          const solutionMap = new Map(
            solutionsArray.map(s => [s.id, s.category as SolutionCategory])
          );
          
          userProgress.forEach(progress => {
            if (progress.is_completed && solutionMap.has(progress.solution_id)) {
              const category = solutionMap.get(progress.solution_id) as SolutionCategory;
              if (category in categoryDistribution) {
                categoryDistribution[category].completed++;
              }
            }
          });
        }

        // Calculate time metrics (estimated values for this implementation)
        const totalTimeSpent = completedSolutions * 45 + inProgressSolutions * 20; // minutes
        const avgTimePerSolution = completedSolutions > 0 
          ? Math.round(totalTimeSpent / completedSolutions) 
          : 0;

        // Find latest activity date
        const lastActivity = userProgress.length > 0 
          ? userProgress.sort((a, b) => 
              new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
            )[0].last_activity 
          : null;

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
        setError(err.message || "An unknown error occurred");
        // Maintain previous stats if there was an error
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  return { 
    stats, 
    loading, 
    error,
    // Helper functions
    hasStats: stats.totalSolutions > 0,
    hasCompleted: stats.completedSolutions > 0
  };
};
