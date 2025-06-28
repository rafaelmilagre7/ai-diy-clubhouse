
import { useQuery } from '@tanstack/react-query';
import { useDashboardData } from './useDashboardData';

export const useEnhancedDashboard = () => {
  const dashboardQuery = useDashboardData();

  return {
    // Corrigido: usar propriedades corretas do useQuery
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
    isEmpty: !dashboardQuery.data?.stats?.totalSolutions
  };
};
