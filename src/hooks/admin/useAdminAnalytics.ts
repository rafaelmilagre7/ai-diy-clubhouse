
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalUsers: number;
  totalSolutions: number;
  totalTools: number;
  totalEvents: number;
  activeUsers: number;
  publishedSolutions: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export const useAdminAnalytics = () => {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalSolutions: 0,
    totalTools: 0,
    totalEvents: 0,
    activeUsers: 0,
    publishedSolutions: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Buscar contadores em paralelo
      const [
        { count: totalUsers },
        { count: totalSolutions },
        { count: totalTools },
        { count: totalEvents },
        { count: publishedSolutions },
        { data: solutions }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('solutions').select('*', { count: 'exact', head: true }),
        supabase.from('tools').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('solutions').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('solutions').select('title, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      // Calcular usuários ativos (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Montar atividade recente
      const recentActivity = (solutions || []).map((solution: any) => ({
        id: solution.id || Math.random().toString(),
        type: 'Solução',
        description: `Nova solução criada: ${solution.title}`,
        timestamp: solution.created_at
      }));

      setData({
        totalUsers: totalUsers || 0,
        totalSolutions: totalSolutions || 0,
        totalTools: totalTools || 0,
        totalEvents: totalEvents || 0,
        activeUsers: activeUsers || 0,
        publishedSolutions: publishedSolutions || 0,
        recentActivity
      });

    } catch (error: any) {
      console.error('Erro ao carregar analytics:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados de analytics.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    data,
    loading,
    refetch: fetchAnalytics
  };
};
