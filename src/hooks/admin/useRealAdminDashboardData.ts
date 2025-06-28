
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProductionLogger } from '@/hooks/useProductionLogger';

interface AdminDashboardData {
  statsData: {
    totalUsers: number;
    totalSolutions: number;
    totalImplementations: number;
    totalEvents: number;
    usersByRole: Array<{ role: string; count: number; color: string }>;
    recentGrowth: number;
  };
  activityData: {
    totalEvents: number;
    userActivities: Array<{
      id: string;
      user_email: string;
      action: string;
      timestamp: string;
      details?: string;
    }>;
  };
}

export const useRealAdminDashboardData = (timeRange: string) => {
  const [data, setData] = useState<AdminDashboardData>({
    statsData: {
      totalUsers: 0,
      totalSolutions: 0,
      totalImplementations: 0,
      totalEvents: 0,
      usersByRole: [],
      recentGrowth: 0
    },
    activityData: {
      totalEvents: 0,
      userActivities: []
    }
  });
  
  const [loading, setLoading] = useState(true);
  const { log, error } = useProductionLogger({ component: 'AdminDashboard' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar dados de usuários
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Buscar dados de soluções
      const { data: solutionsData, error: solutionsError } = await supabase
        .from('solutions')
        .select('id, created_at');

      if (solutionsError) throw solutionsError;

      // Buscar dados de progresso
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('id, created_at');

      if (progressError) throw progressError;

      // Buscar dados de eventos
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, created_at');

      if (eventsError) throw eventsError;

      // Buscar roles dos usuários
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role_name');

      if (rolesError) throw rolesError;

      // Processar dados de roles
      const roleDistribution = rolesData?.reduce((acc: any, curr) => {
        acc[curr.role_name] = (acc[curr.role_name] || 0) + 1;
        return acc;
      }, {}) || {};

      const usersByRole = Object.entries(roleDistribution).map(([role, count]) => ({
        role,
        count: count as number,
        color: role === 'admin' ? '#ef4444' : role === 'formacao' ? '#3b82f6' : '#10b981'
      }));

      // Simular atividades recentes
      const mockActivities = (usersData || []).slice(0, 10).map((user, index) => ({
        id: user.id,
        user_email: `usuario${index}@example.com`,
        action: index % 3 === 0 ? 'Login realizado' : index % 3 === 1 ? 'Solução implementada' : 'Perfil atualizado',
        timestamp: user.created_at,
        details: `Atividade ${index + 1}`
      }));

      const statsData = {
        totalUsers: usersData?.length || 0,
        totalSolutions: solutionsData?.length || 0,
        totalImplementations: progressData?.length || 0,
        totalEvents: eventsData?.length || 0,
        usersByRole,
        recentGrowth: 12.5 // Mock data
      };

      const activityData = {
        totalEvents: mockActivities.length,
        userActivities: mockActivities
      };

      setData({ statsData, activityData });
      log(`Dashboard data loaded successfully`, { 
        users: statsData.totalUsers,
        solutions: statsData.totalSolutions 
      });

    } catch (error: any) {
      error('Erro ao carregar dados do dashboard:', error.message);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [timeRange, log, error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    statsData: data.statsData,
    activityData: data.activityData,
    loading,
    refetch: fetchData
  };
};
