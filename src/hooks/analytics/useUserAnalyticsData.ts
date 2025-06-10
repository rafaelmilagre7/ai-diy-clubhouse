
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UserAnalyticsData {
  usersByTime: any[];
  userRoleDistribution: any[];
  userActivityByDay: any[];
  totalUsers: number;
  activeUsers: number;
}

interface AnalyticsFilters {
  timeRange: string;
  role: string;
}

export const useUserAnalyticsData = (filters: AnalyticsFilters) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserAnalyticsData>({
    usersByTime: [],
    userRoleDistribution: [],
    userActivityByDay: [],
    totalUsers: 0,
    activeUsers: 0
  });

  const fetchUserAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular data de início baseada no filtro
      const getStartDate = () => {
        if (filters.timeRange === 'all') return null;
        
        const now = new Date();
        const days = parseInt(filters.timeRange);
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - days);
        return startDate.toISOString();
      };

      const startDate = getStartDate();

      // Buscar usuários com filtros
      let usersQuery = supabase
        .from('profiles')
        .select(`
          id,
          created_at,
          name,
          role,
          role_id,
          user_roles:role_id (
            name,
            description
          )
        `);
      
      if (startDate) {
        usersQuery = usersQuery.gte('created_at', startDate);
      }
      
      if (filters.role !== 'all') {
        usersQuery = usersQuery.eq('role', filters.role);
      }
      
      const { data: usersData, error: usersError } = await usersQuery;
      
      if (usersError) throw usersError;

      // Processar dados para gráficos
      const processUsersByTime = (users: any[]) => {
        if (!users || users.length === 0) return [];
        
        const grouped = users.reduce((acc, user) => {
          const date = new Date(user.created_at).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        
        return Object.entries(grouped)
          .map(([date, count]) => ({ date, usuarios: count }))
          .sort((a, b) => a.date.localeCompare(b.date));
      };

      const processRoleDistribution = (users: any[]) => {
        if (!users || users.length === 0) return [];
        
        const grouped = users.reduce((acc, user) => {
          const roleName = user.user_roles?.name || user.role || 'Sem papel';
          acc[roleName] = (acc[roleName] || 0) + 1;
          return acc;
        }, {});
        
        return Object.entries(grouped)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => (b.value as number) - (a.value as number));
      };

      const processActivityByDay = (users: any[]) => {
        if (!users || users.length === 0) return [];
        
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const grouped = users.reduce((acc, user) => {
          const dayIndex = new Date(user.created_at).getDay();
          const dayName = dayNames[dayIndex];
          acc[dayName] = (acc[dayName] || 0) + 1;
          return acc;
        }, {});
        
        return dayNames.map(day => ({
          day,
          usuarios: grouped[day] || 0
        }));
      };

      const usersByTime = processUsersByTime(usersData || []);
      const userRoleDistribution = processRoleDistribution(usersData || []);
      const userActivityByDay = processActivityByDay(usersData || []);

      // Calcular métricas básicas
      const totalUsers = usersData?.length || 0;
      
      // Usuários ativos (logaram nos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      setData({
        usersByTime,
        userRoleDistribution,
        userActivityByDay,
        totalUsers,
        activeUsers: activeUsersCount || 0
      });

    } catch (error: any) {
      console.error("Erro ao carregar analytics de usuários:", error);
      setError(error.message || "Erro ao carregar dados de usuários");
      toast({
        title: "Erro ao carregar analytics",
        description: "Não foi possível carregar os dados de usuários.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filters.timeRange, filters.role, toast]);

  useEffect(() => {
    fetchUserAnalytics();
  }, [fetchUserAnalytics]);

  return { 
    data, 
    loading, 
    error,
    refresh: fetchUserAnalytics 
  };
};
