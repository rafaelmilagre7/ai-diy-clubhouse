
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface AdminStatsData {
  totalUsers: number;
  totalSolutions: number;
  totalLearningLessons: number;
  completedImplementations: number;
  averageImplementationTime: number;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
  lastMonthGrowth: number;
  activeUsersLast7Days: number;
  contentEngagementRate: number;
  recentActivity: Array<{
    type: string;
    count: number;
    period: string;
  }>;
}

export const useAdminStatsData = () => {
  return useQuery({
    queryKey: ['admin-stats-consolidated'],
    queryFn: async (): Promise<AdminStatsData> => {
      // Buscar dados de overview com fallback simplificado
      let overviewData;
      try {
        const { data, error } = await supabase
          .from('admin_analytics_overview')
          .select('*')
          .maybeSingle();
        if (error) throw error;
        overviewData = data;
      } catch (error) {
        console.warn('View analytics não disponível, usando fallback');
        const { data: profiles } = await supabase.from('profiles').select('id, created_at, onboarding_completed');
        overviewData = {
          total_users: profiles?.length || 0,
          new_users_30d: profiles?.filter(p => new Date(p.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0,
          completed_onboarding: profiles?.filter(p => p.onboarding_completed).length || 0,
          total_solutions: 0,
          active_users_7d: 0,
          growth_rate: 0,
          completion_rate: 0
        };
      }

      // Buscar segmentação com fallback
      let segmentationData = [];
      try {
        const { data } = await supabase.from('user_segmentation_analytics').select('*');
        segmentationData = data || [];
      } catch (error) {
        console.warn('Segmentação não disponível');
      }

      return {
        totalUsers: overviewData?.total_users || 0,
        totalSolutions: overviewData?.total_solutions || 0,
        totalLearningLessons: 0,
        completedImplementations: 0,
        averageImplementationTime: 240,
        usersByRole: segmentationData.map(item => ({
          role: item.segment_name === 'member' ? 'Membros' : 
                item.segment_name === 'admin' ? 'Administradores' :
                item.segment_name === 'formacao' ? 'Formação' : item.segment_name,
          count: item.user_count || 0
        })),
        lastMonthGrowth: overviewData?.growth_rate || 0,
        activeUsersLast7Days: overviewData?.active_users_7d || 0,
        contentEngagementRate: overviewData?.completion_rate || 0,
        recentActivity: [
          { type: 'Novos usuários', count: overviewData?.new_users_30d || 0, period: '30 dias' },
          { type: 'Usuários ativos', count: overviewData?.active_users_7d || 0, period: '7 dias' }
        ]
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
};
