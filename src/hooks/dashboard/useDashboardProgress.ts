
import { useState, useEffect } from "react";
import { Dashboard } from "./types";
import { Solution } from "@/lib/supabase";
import { useDashboardData } from "./useDashboardData";
import { fallbackSolutionsData, processSolutionsData, sortSolutionsByDifficulty } from "./dashboardUtils";

// Default empty state
const DEFAULT_DASHBOARD_STATE: Dashboard = {
  activeSolutions: [],
  completedSolutions: [],
  recommendedSolutions: [],
  allSolutions: [],
  userProgress: {},
  loading: true
};

export const useDashboardProgress = () => {
  const [dashboard, setDashboard] = useState<Dashboard>(DEFAULT_DASHBOARD_STATE);
  const { solutions, progressData, loading, error } = useDashboardData();
  
  useEffect(() => {
    if (loading) {
      setDashboard(prev => ({ ...prev, loading: true }));
      return;
    }
    
    try {
      // Process progress data
      const {
        userProgress,
        activeSolutions,
        completedSolutions,
        availableSolutions
      } = processSolutionsData(solutions, progressData);
      
      // Get recommended solutions - prioritize easier solutions
      const recommendedSolutions = sortSolutionsByDifficulty(availableSolutions).slice(0, 3);
      
      // Update dashboard state
      setDashboard({
        activeSolutions,
        completedSolutions,
        recommendedSolutions,
        allSolutions: solutions,
        userProgress,
        loading: false
      });
    } catch (err) {
      console.error("Error processing dashboard data:", err);
      
      // Use fallback data on error
      setDashboard({
        activeSolutions: [],
        completedSolutions: [],
        recommendedSolutions: fallbackSolutionsData.slice(0, 3),
        allSolutions: fallbackSolutionsData,
        userProgress: {},
        loading: false
      });
    }
  }, [solutions, progressData, loading, error]);
  
  return dashboard;
};
