
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalSolutions: number;
    totalTools: number;
    activeSessions: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
}

export interface AdminDashboardReturn {
  data: AdminDashboardData;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  statsData: AdminDashboardData['stats'];
  activityData: AdminDashboardData['recentActivity'];
}

export const useAdminDashboard = (timeRange?: string): AdminDashboardReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard', timeRange],
    queryFn: async (): Promise<AdminDashboardData> => {
      try {
        // Get basic counts using head requests to avoid type issues
        const [usersResult, solutionsResult, toolsResult] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('solutions').select('*', { count: 'exact', head: true }),
          supabase.from('tools').select('*', { count: 'exact', head: true })
        ]);

        // Mock recent activity for now
        const recentActivity = [
          {
            id: '1',
            type: 'user_registration',
            description: 'Novo usuário registrado',
            timestamp: new Date().toISOString(),
            user: 'Sistema'
          }
        ];

        return {
          stats: {
            totalUsers: usersResult.count || 0,
            totalSolutions: solutionsResult.count || 0,
            totalTools: toolsResult.count || 0,
            activeSessions: 0
          },
          recentActivity
        };
      } catch (error) {
        console.error('Erro ao carregar dashboard admin:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const dashboardData: AdminDashboardData = data || {
    stats: {
      totalUsers: 0,
      totalSolutions: 0,
      totalTools: 0,
      activeSessions: 0
    },
    recentActivity: []
  };

  return {
    data: dashboardData,
    loading: isLoading,
    error: error?.message || '',
    refetch: async () => {
      await refetch();
    },
    statsData: dashboardData.stats,
    activityData: dashboardData.recentActivity
  };
};
