
import { useMemo } from 'react';
import { useDashboardData } from './useDashboardData';

export const useEnhancedDashboard = () => {
  const dashboardQuery = useDashboardData();

  // Processar e categorizar as soluções
  const processedData = useMemo(() => {
    if (!dashboardQuery.data?.recentSolutions) {
      return {
        active: [],
        completed: [],
        recommended: []
      };
    }

    const solutions = dashboardQuery.data.recentSolutions;
    
    // Mock categorization - adjust based on your actual data structure
    const active = solutions.filter((_, index) => index % 3 === 0);
    const completed = solutions.filter((_, index) => index % 3 === 1);
    const recommended = solutions.filter((_, index) => index % 3 === 2);

    return {
      active,
      completed,
      recommended
    };
  }, [dashboardQuery.data?.recentSolutions]);

  return {
    // Dados processados
    active: processedData.active,
    completed: processedData.completed,
    recommended: processedData.recommended,
    
    // Estados do query
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    
    // Compatibility properties
    solutions: dashboardQuery.data?.recentSolutions || [],
    loading: dashboardQuery.isLoading,
    
    // Enhanced functionality
    refetch: dashboardQuery.refetch,
    isRefetching: dashboardQuery.isRefetching,
    
    // Computed properties
    hasData: !!dashboardQuery.data,
    isEmpty: !dashboardQuery.data?.stats?.totalSolutions,
    
    // Performance info
    performance: {
      optimized: true,
      fallback: false,
      cacheStatus: 'active'
    }
  };
};
