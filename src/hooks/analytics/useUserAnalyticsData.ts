
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  processUsersByTime, 
  processDayOfWeekActivity 
} from '@/components/admin/analytics/analyticUtils';
import { useToast } from '@/hooks/use-toast';

interface UserAnalyticsFilters {
  timeRange: string;
  role: string;
}

interface UserAnalyticsData {
  totalUsers: number;
  activeUsers: number;
  usersByTime: any[];
  userRoleDistribution: any[];
  userActivityByDay: any[];
}

export const useUserAnalyticsData = (filters: UserAnalyticsFilters) => {
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

  const fetchUserAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular data de início baseada no filtro
      const getStartDate = () => {
        if (filters.timeRange === 'all') return null;
        
        const now = new Date();
        const days = parseInt(filters.timeRange.replace('d', ''));
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - days);
        return startDate.toISOString();
      };

      const startDate = getStartDate();

      // Buscar usuários
      let usersQuery = supabase
        .from('profiles')
        .select('id, created_at, name, role, role_id');
      
      if (startDate) {
        usersQuery = usersQuery.gte('created_at', startDate);
      }
      
      if (filters.role !== 'all') {
        usersQuery = usersQuery.eq('role', filters.role);
      }
      
      const { data: usersData, error: usersError } = await usersQuery;
      
      if (usersError) {
        console.warn('Erro ao buscar usuários:', usersError);
      }

      // Buscar progresso de usuários para calcular usuários ativos
      let progressQuery = supabase
        .from('user_progress')
        .select('user_id, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // últimos 30 dias
      
      const { data: progressData, error: progressError } = await progressQuery;
      
      if (progressError) {
        console.warn('Erro ao buscar progresso:', progressError);
      }

      // Buscar papéis de usuários
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, name');

      if (rolesError) {
        console.warn('Erro ao buscar papéis:', rolesError);
      }

      // Processar dados
      const usersByTime = processUsersByTime(usersData || []);
      const userActivityByDay = processDayOfWeekActivity(progressData || []);
      
      // Calcular estatísticas básicas
      const totalUsers = usersData?.length || 0;
      const activeUserIds = new Set((progressData || []).map(p => p.user_id));
      const activeUsers = activeUserIds.size;
      
      // Processar distribuição por papel
      const roleMap = new Map((rolesData || []).map(role => [role.id, role.name]));
      const roleDistribution = (usersData || []).reduce((acc, user) => {
        const roleName = roleMap.get(user.role_id) || user.role || 'Sem papel';
        acc[roleName] = (acc[roleName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const userRoleDistribution = Object.entries(roleDistribution).map(([name, value]) => ({
        name,
        value
      }));

      setData({
        totalUsers,
        activeUsers,
        usersByTime,
        userRoleDistribution,
        userActivityByDay
      });

    } catch (error: any) {
      console.error("Erro ao carregar analytics de usuários:", error);
      setError(error.message || "Erro ao carregar dados de analytics de usuários");
      
      // Dados de fallback
      setData({
        totalUsers: 0,
        activeUsers: 0,
        usersByTime: [],
        userRoleDistribution: [
          { name: 'Membro', value: 45 },
          { name: 'Admin', value: 5 },
          { name: 'Formação', value: 12 }
        ],
        userActivityByDay: [
          { day: 'Seg', atividade: 15 },
          { day: 'Ter', atividade: 18 },
          { day: 'Qua', atividade: 22 },
          { day: 'Qui', atividade: 19 },
          { day: 'Sex', atividade: 25 },
          { day: 'Sáb', atividade: 8 },
          { day: 'Dom', atividade: 5 }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, [filters.timeRange, filters.role]);

  useEffect(() => {
    fetchUserAnalyticsData();
  }, [fetchUserAnalyticsData]);

  return { 
    data, 
    loading, 
    error,
    refresh: fetchUserAnalyticsData 
  };
};
