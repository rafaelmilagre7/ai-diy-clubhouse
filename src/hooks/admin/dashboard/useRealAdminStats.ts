
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/lib/supabase";

interface AdminStats {
  totalUsers: number;
  totalSolutions: number;
  totalLearningLessons: number;
  completedImplementations: number;
  averageImplementationTime: number;
  usersByRole: Array<{ role: string; count: number }>;
  lastMonthGrowth: number;
  activeUsersLast7Days: number;
  contentEngagementRate: number;
}

// Função para calcular data de início baseada no timeRange
const getStartDate = (timeRange: string): Date => {
  const now = new Date();
  
  switch (timeRange) {
    case '7d':
      now.setDate(now.getDate() - 7);
      break;
    case '30d':
      now.setDate(now.getDate() - 30);
      break;
    case '90d':
      now.setDate(now.getDate() - 90);
      break;
    case 'all':
    default:
      now.setFullYear(2020); // Data muito antiga para pegar todos os dados
      break;
  }
  
  return now;
};

// HOOK SIMPLIFICADO - REMOVENDO QUERIES REDUNDANTES
export const useRealAdminStats = (timeRange: string) => {
  // Reutilizar o hook consolidado
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-stats-simple', timeRange],
    queryFn: async () => {
      try {
        const { data: overview } = await supabase
          .from('admin_analytics_overview')
          .select('*')
          .maybeSingle();
        
        return {
          totalUsers: overview?.total_users || 0,
          totalSolutions: overview?.total_solutions || 0,
          totalLearningLessons: overview?.total_lessons || 0,
          completedImplementations: 0,
          averageImplementationTime: 240,
          usersByRole: [],
          lastMonthGrowth: overview?.growth_rate || 0,
          activeUsersLast7Days: overview?.active_users_7d || 0,
          contentEngagementRate: overview?.completion_rate || 0
        };
      } catch (error) {
        console.error('Erro no useRealAdminStats:', error);
        return {
          totalUsers: 0,
          totalSolutions: 0,
          totalLearningLessons: 0,
          completedImplementations: 0,
          averageImplementationTime: 0,
          usersByRole: [],
          lastMonthGrowth: 0,
          activeUsersLast7Days: 0,
          contentEngagementRate: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return { 
    statsData: data || {
      totalUsers: 0,
      totalSolutions: 0,
      totalLearningLessons: 0,
      completedImplementations: 0,
      averageImplementationTime: 0,
      usersByRole: [],
      lastMonthGrowth: 0,
      activeUsersLast7Days: 0,
      contentEngagementRate: 0
    }, 
    loading: isLoading, 
    refetch: () => {} 
  };
};
