
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UserAnalyticsData {
  totalUsers: number;
  activeUsers: number;
  usersByTime: Array<{ name: string; novos: number; total: number }>;
  userRoleDistribution: Array<{ name: string; value: number }>;
  userActivityByDay: Array<{ day: string; users: number }>;
}

export const useUserAnalyticsData = (params: { timeRange: string; role: string }) => {
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
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar usuários com roles
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select(`
            id, 
            created_at, 
            role,
            role_id,
            user_roles!inner(name)
          `)
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        // Buscar atividade recente
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentActivity, error: activityError } = await supabase
          .from('analytics')
          .select('user_id, created_at')
          .gte('created_at', sevenDaysAgo.toISOString());

        if (activityError) console.warn('Analytics table might not exist:', activityError);

        // Filtrar por role se especificado
        let filteredUsers = usersData || [];
        if (params.role !== 'all') {
          filteredUsers = usersData?.filter(user => {
            const userRoleData = Array.isArray(user.user_roles) ? user.user_roles[0] : user.user_roles;
            return userRoleData?.name === params.role || user.role === params.role;
          }) || [];
        }

        const totalUsers = filteredUsers.length;
        const activeUsers = new Set(
          recentActivity?.filter(a => 
            filteredUsers.some(u => u.id === a.user_id)
          ).map(a => a.user_id) || []
        ).size;

        // Distribuição por roles
        const roleDistribution = filteredUsers.reduce((acc, user) => {
          const userRoleData = Array.isArray(user.user_roles) ? user.user_roles[0] : user.user_roles;
          const roleName = userRoleData?.name || user.role || 'member';
          const existing = acc.find(r => r.name === roleName);
          if (existing) {
            existing.value++;
          } else {
            acc.push({ name: roleName, value: 1 });
          }
          return acc;
        }, [] as Array<{ name: string; value: number }>);

        // Usuários por tempo (últimos 6 meses)
        const usersByTime = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'short' });
          const monthUsers = filteredUsers.filter(u => {
            const userDate = new Date(u.created_at);
            return userDate.getMonth() === monthDate.getMonth() && 
                   userDate.getFullYear() === monthDate.getFullYear();
          }).length;
          
          const totalUpToMonth = filteredUsers.filter(u => {
            const userDate = new Date(u.created_at);
            return userDate <= monthDate;
          }).length;

          usersByTime.push({
            name: monthName,
            novos: monthUsers,
            total: totalUpToMonth
          });
        }

        // Atividade por dia da semana
        const userActivityByDay = Array.from({ length: 7 }, (_, i) => {
          const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i];
          const dayCount = recentActivity?.filter(a => {
            const activityDate = new Date(a.created_at);
            return activityDate.getDay() === i && 
                   filteredUsers.some(u => u.id === a.user_id);
          }).length || 0;
          return { day: dayName, users: dayCount };
        });

        setData({
          totalUsers,
          activeUsers,
          usersByTime,
          userRoleDistribution: roleDistribution,
          userActivityByDay
        });

      } catch (err: any) {
        console.error('Erro ao buscar dados de usuários:', err);
        setError(err.message || 'Erro ao carregar dados');
        toast({
          title: "Erro ao carregar dados de usuários",
          description: "Não foi possível carregar as estatísticas de usuários.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.timeRange, params.role, toast]);

  return { data, loading, error };
};
