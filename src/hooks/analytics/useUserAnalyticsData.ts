
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UserAnalyticsData {
  totalUsers: number;
  activeUsers: number;
  usersByTime: Array<{
    date: string;
    name: string;
    usuarios: number;
    novos: number;
    total: number;
  }>;
  userRoleDistribution: Array<{
    name: string;
    value: number;
  }>;
  userActivityByDay: Array<{
    day: string;
    atividade: number;
  }>;
}

interface UseUserAnalyticsDataParams {
  timeRange: string;
  role?: string;
}

export const useUserAnalyticsData = ({ timeRange, role = 'all' }: UseUserAnalyticsDataParams) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserAnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    usersByTime: [],
    userRoleDistribution: [],
    userActivityByDay: []
  });

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados de crescimento de usuários
        const { data: userGrowthData, error: userGrowthError } = await supabase
          .from('user_growth_by_date')
          .select('*')
          .order('date', { ascending: true });

        if (userGrowthError) {
          console.warn('Erro ao buscar crescimento de usuários:', userGrowthError);
        }

        // Buscar segmentação de usuários
        const { data: segmentationData, error: segmentationError } = await supabase
          .from('user_segmentation_analytics')
          .select('*')
          .order('user_count', { ascending: false });

        if (segmentationError) {
          console.warn('Erro ao buscar segmentação:', segmentationError);
        }

        // Buscar padrões de atividade semanal
        const { data: weeklyData, error: weeklyError } = await supabase
          .from('weekly_activity_patterns')
          .select('*')
          .order('day_of_week', { ascending: true });

        if (weeklyError) {
          console.warn('Erro ao buscar atividade semanal:', weeklyError);
        }

        // Calcular totais
        const totalUsers = segmentationData?.reduce((sum, item) => sum + item.user_count, 0) || 0;
        const activeUsers = segmentationData?.reduce((sum, item) => sum + item.active_users_7d, 0) || 0;

        // Processar dados
        const processedData: UserAnalyticsData = {
          totalUsers,
          activeUsers,
          usersByTime: userGrowthData?.map(item => ({
            date: item.date,
            name: item.name,
            usuarios: item.novos,
            novos: item.novos,
            total: item.total
          })) || [],
          userRoleDistribution: segmentationData?.map(item => ({
            name: item.role_name === 'member' ? 'Membros' : 
                  item.role_name === 'admin' ? 'Administradores' :
                  item.role_name === 'formacao' ? 'Formação' : item.role_name,
            value: item.user_count
          })) || [],
          userActivityByDay: weeklyData?.map(item => ({
            day: item.day,
            atividade: item.atividade
          })) || []
        };

        setData(processedData);
        
        console.log('📊 Dados de usuários carregados:', {
          totalUsers: processedData.totalUsers,
          activeUsers: processedData.activeUsers,
          growthData: processedData.usersByTime.length,
          roleDistribution: processedData.userRoleDistribution.length
        });

      } catch (error: any) {
        console.error('Erro ao carregar analytics de usuários:', error);
        setError(error.message || 'Erro ao carregar dados de usuários');
        toast({
          title: "Erro ao carregar dados de usuários",
          description: "Não foi possível carregar os dados. Verifique sua conexão.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnalytics();
  }, [timeRange, role, toast]);

  return { data, loading, error };
};
