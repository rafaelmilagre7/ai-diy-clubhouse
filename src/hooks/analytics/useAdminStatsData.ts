
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminStatsData>({
    totalUsers: 0,
    totalSolutions: 0,
    totalLearningLessons: 0,
    completedImplementations: 0,
    averageImplementationTime: 0,
    usersByRole: [],
    lastMonthGrowth: 0,
    activeUsersLast7Days: 0,
    contentEngagementRate: 0,
    recentActivity: []
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar overview consolidado com fallback
        const { data: overviewData, error: overviewError } = await supabase
          .from('admin_analytics_overview')
          .select('*')
          .maybeSingle();

        let finalOverviewData = overviewData;
        if (overviewError || !overviewData) {
          console.warn('Fallback: Usando queries diretas para admin overview');
          // Fallback: query direta para dados básicos
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, created_at, onboarding_completed');
          
          finalOverviewData = {
            total_users: profilesData?.length || 0,
            new_users_30d: profilesData?.filter(p => 
              new Date(p.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length || 0,
            completed_onboarding: profilesData?.filter(p => p.onboarding_completed).length || 0,
            total_solutions: 0,
            new_solutions_30d: 0,
            active_users_7d: 0,
            growth_rate: 0,
            completion_rate: 0
          };
        }

        // Buscar segmentação de usuários com fallback
        const { data: segmentationData, error: segmentationError } = await supabase
          .from('user_segmentation_analytics')
          .select('*')
          .order('user_count', { ascending: false });

        let finalSegmentationData = segmentationData;
        if (segmentationError || !segmentationData) {
          console.warn('Fallback: Usando queries diretas para segmentação');
          // Fallback: query básica por roles
          const { data: profilesWithRoles } = await supabase
            .from('profiles')
            .select(`
              id, 
              created_at, 
              onboarding_completed,
              user_roles!inner (name)
            `);
          
          if (profilesWithRoles) {
            const roleGroups = profilesWithRoles.reduce((acc: Record<string, number>, profile) => {
              const roleName = (profile.user_roles as any)?.name || 'member';
              acc[roleName] = (acc[roleName] || 0) + 1;
              return acc;
            }, {});
            
            finalSegmentationData = Object.entries(roleGroups).map(([role_name, user_count]) => ({
              role_name,
              user_count: user_count as number,
              completed_count: 0,
              new_users_30d: 0,
              avg_completion_rate: 0
            }));
          } else {
            finalSegmentationData = [];
          }
        }

        // Buscar contagem de aulas
        const { count: totalLessons } = await supabase
          .from('learning_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('published', true);

        // Calcular crescimento do último mês
        const lastMonthGrowth = finalOverviewData?.new_users_30d || 0;
        const totalUsers = finalOverviewData?.total_users || 0;
        const growthPercentage = totalUsers > 0 ? Math.round((lastMonthGrowth / totalUsers) * 100) : 0;

        const processedData: AdminStatsData = {
          totalUsers: totalUsers,
          totalSolutions: finalOverviewData?.total_solutions || 0,
          totalLearningLessons: totalLessons || 0,
          completedImplementations: finalOverviewData?.completed_implementations || 0,
          averageImplementationTime: 240, // 4 horas em minutos (pode ser calculado dinamicamente no futuro)
          usersByRole: finalSegmentationData?.map(item => ({
            role: item.role_name === 'member' ? 'Membros' : 
                  item.role_name === 'admin' ? 'Administradores' :
                  item.role_name === 'formacao' ? 'Formação' : item.role_name,
            count: item.user_count
          })) || [],
          lastMonthGrowth: growthPercentage,
          activeUsersLast7Days: finalOverviewData?.active_users_7d || 0,
          contentEngagementRate: Math.round(((finalOverviewData?.active_users_7d || 0) / totalUsers) * 100),
          recentActivity: [
            { type: 'Novos usuários', count: finalOverviewData?.new_users_30d || 0, period: '30 dias' },
            { type: 'Implementações', count: finalOverviewData?.new_implementations_30d || 0, period: '30 dias' },
            { type: 'Usuários ativos', count: finalOverviewData?.active_users_7d || 0, period: '7 dias' }
          ]
        };

        setData(processedData);
        
        console.log('📈 Admin Stats carregados:', {
          totalUsers: processedData.totalUsers,
          activeUsers: processedData.activeUsersLast7Days,
          usersByRole: processedData.usersByRole.length
        });

      } catch (error: any) {
        console.error('Erro ao carregar admin stats:', error);
        setError(error.message || 'Erro ao carregar estatísticas administrativas');
        toast({
          title: "Erro ao carregar estatísticas",
          description: "Não foi possível carregar os dados. Verifique sua conexão.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [toast]);

  return { data, loading, error };
};
