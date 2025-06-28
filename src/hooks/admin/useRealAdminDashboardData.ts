
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

export interface AdminDashboardData {
  totalUsers: number;
  totalSolutions: number;
  totalTools: number;
  totalEvents: number;
  recentActivity: any[];
  userGrowth: any[];
  completionRates: any[];
  popularSolutions: any[];
}

export const useRealAdminDashboardData = () => {
  const { isAdmin } = useSimpleAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!isAdmin) {
      setError('Acesso negado - apenas administradores');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar contadores básicos usando apenas tabelas que existem
      const [usersResult, solutionsResult, toolsResult, eventsResult] = await Promise.allSettled([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('solutions').select('id', { count: 'exact', head: true }),
        supabase.from('tools').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true })
      ]);

      // Buscar atividade recente dos últimos 30 dias
      const { data: recentAnalytics } = await supabase
        .from('analytics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Buscar soluções populares
      const { data: solutions } = await supabase
        .from('solutions')
        .select('id, title, category')
        .eq('is_published', true)
        .limit(5);

      const dashboardData: AdminDashboardData = {
        totalUsers: usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0,
        totalSolutions: solutionsResult.status === 'fulfilled' ? (solutionsResult.value.count || 0) : 0,
        totalTools: toolsResult.status === 'fulfilled' ? (toolsResult.value.count || 0) : 0,
        totalEvents: eventsResult.status === 'fulfilled' ? (eventsResult.value.count || 0) : 0,
        recentActivity: recentAnalytics || [],
        userGrowth: [], // Simplificado - dados reais requerem agregação complexa
        completionRates: [], // Simplificado - dados reais requerem tabela progress
        popularSolutions: solutions || []
      };

      setData(dashboardData);

    } catch (error: any) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError(error.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isAdmin]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
};
