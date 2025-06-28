
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface RealAdminDashboardData {
  totalUsers: number;
  totalSolutions: number;
  totalTools: number;
  totalEvents: number;
  usersByRole: Array<{ role: string; count: number }>;
  userActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
}

export const useRealAdminDashboardData = (timeRange: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['real-admin-dashboard', timeRange],
    queryFn: async (): Promise<RealAdminDashboardData> => {
      try {
        // Get basic counts using Promise.all to avoid type depth issues
        const [usersResult, solutionsResult, toolsResult, eventsResult] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('solutions').select('*', { count: 'exact', head: true }),
          supabase.from('tools').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*', { count: 'exact', head: true })
        ]);

        // Mock user activities for now
        const userActivities = [
          {
            id: '1',
            type: 'user_registration',
            description: 'Novo usuário registrado',
            timestamp: new Date().toISOString(),
            user: 'Sistema'
          }
        ];

        // Mock users by role distribution
        const usersByRole = [
          { role: 'admin', count: 1 },
          { role: 'membro_club', count: usersResult.count ? usersResult.count - 1 : 0 }
        ];

        return {
          totalUsers: usersResult.count || 0,
          totalSolutions: solutionsResult.count || 0,
          totalTools: toolsResult.count || 0,
          totalEvents: eventsResult.count || 0,
          usersByRole,
          userActivities
        };
      } catch (error) {
        console.error('Erro ao carregar dashboard admin:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const dashboardData: RealAdminDashboardData = data || {
    totalUsers: 0,
    totalSolutions: 0,
    totalTools: 0,
    totalEvents: 0,
    usersByRole: [],
    userActivities: []
  };

  return {
    statsData: {
      totalUsers: dashboardData.totalUsers,
      totalSolutions: dashboardData.totalSolutions,
      totalTools: dashboardData.totalTools,
      totalEvents: dashboardData.totalEvents,
      usersByRole: dashboardData.usersByRole
    },
    activityData: {
      userActivities: dashboardData.userActivities,
      totalEvents: dashboardData.totalEvents
    },
    loading: isLoading,
    error: error?.message || '',
    refetch: async () => {
      await refetch();
    }
  };
};
