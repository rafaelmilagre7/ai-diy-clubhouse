
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

export const useAdminDashboard = (): AdminDashboardReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async (): Promise<AdminDashboardData> => {
      try {
        // Get basic counts
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        const { count: totalSolutions } = await supabase
          .from('solutions')
          .select('id', { count: 'exact', head: true });

        const { count: totalTools } = await supabase
          .from('tools')
          .select('id', { count: 'exact', head: true });

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
            totalUsers: totalUsers || 0,
            totalSolutions: totalSolutions || 0,
            totalTools: totalTools || 0,
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
