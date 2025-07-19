
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

        // Buscar overview consolidado
        const { data: overviewData, error: overviewError } = await supabase
          .from('admin_analytics_overview')
          .select('*')
          .single();

        if (overviewError && overviewError.code !== 'PGRST116') {
          console.warn('Erro ao buscar overview:', overviewError);
        }

        // Buscar segmentação de usuários
        const { data: segmentationData, error: segmentationError } = await supabase
          .from('user_segmentation_analytics')
          .select('*')
          .order('user_count', { ascending: false });

        if (segmentationError) {
          console.warn('Erro ao buscar segmentação:', segmentationError);
        }

        // Buscar contagem de aulas
        const { count: totalLessons } = await supabase
          .from('learning_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('published', true);

        // Calcular crescimento do último mês
        const lastMonthGrowth = overviewData?.new_users_30d || 0;
        const totalUsers = overviewData?.total_users || 0;
        const growthPercentage = totalUsers > 0 ? Math.round((lastMonthGrowth / totalUsers) * 100) : 0;

        const processedData: AdminStatsData = {
          totalUsers: totalUsers,
          totalSolutions: overviewData?.total_solutions || 0,
          totalLearningLessons: totalLessons || 0,
          completedImplementations: overviewData?.completed_implementations || 0,
          averageImplementationTime: 240, // 4 horas em minutos (pode ser calculado dinamicamente no futuro)
          usersByRole: segmentationData?.map(item => ({
            role: item.role_name === 'member' ? 'Membros' : 
                  item.role_name === 'admin' ? 'Administradores' :
                  item.role_name === 'formacao' ? 'Formação' : item.role_name,
            count: item.user_count
          })) || [],
          lastMonthGrowth: growthPercentage,
          activeUsersLast7Days: overviewData?.active_users_7d || 0,
          contentEngagementRate: Math.round(((overviewData?.active_users_7d || 0) / totalUsers) * 100),
          recentActivity: [
            { type: 'Novos usuários', count: overviewData?.new_users_30d || 0, period: '30 dias' },
            { type: 'Implementações', count: overviewData?.new_implementations_30d || 0, period: '30 dias' },
            { type: 'Usuários ativos', count: overviewData?.active_users_7d || 0, period: '7 dias' }
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
