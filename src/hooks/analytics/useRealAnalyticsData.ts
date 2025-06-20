
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalSolutions: number;
  totalImplementations: number;
  usersByTime: Array<{ name: string; novos: number; total: number }>;
  userRoleDistribution: Array<{ name: string; value: number }>;
  solutionPopularity: Array<{ name: string; value: number }>;
  implementationsByCategory: Array<{ name: string; value: number }>;
  userCompletionRate: Array<{ name: string; value: number }>;
  dayOfWeekActivity: Array<{ day: string; atividade: number }>;
  userActivityByDay: Array<{ day: string; users: number }>;
}

export const useRealAnalyticsData = (params: { 
  timeRange: string; 
  category: string; 
  difficulty: string; 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalSolutions: 0,
    totalImplementations: 0,
    usersByTime: [],
    userRoleDistribution: [],
    solutionPopularity: [],
    implementationsByCategory: [],
    userCompletionRate: [],
    dayOfWeekActivity: [],
    userActivityByDay: []
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar total de usuários
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, created_at, role, role_id, user_roles!inner(name)')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        // Buscar soluções
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('solutions')
          .select('id, title, category, difficulty, published')
          .eq('published', true as any);

        if (solutionsError) throw solutionsError;

        // Buscar progresso/implementações
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('id, user_id, solution_id, is_completed, created_at, completed_at');

        if (progressError) throw progressError;

        // Buscar atividade recente (últimos 7 dias)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentActivity, error: activityError } = await supabase
          .from('analytics')
          .select('user_id, created_at, event_type')
          .gte('created_at', sevenDaysAgo.toISOString());

        if (activityError) console.warn('Analytics table might not exist:', activityError);

        // Processar dados
        const totalUsers = (usersData as any)?.length || 0;
        const activeUsers = new Set((recentActivity as any)?.map((a: any) => a.user_id) || []).size;
        const totalSolutions = (solutionsData as any)?.length || 0;
        const totalImplementations = (progressData as any)?.length || 0;

        // Distribuição por roles
        const roleDistribution = (usersData as any)?.reduce((acc: any, user: any) => {
          const userRoleData = Array.isArray((user as any).user_roles) ? (user as any).user_roles[0] : (user as any).user_roles;
          const roleName = userRoleData?.name || (user as any).role || 'member';
          const existing = acc.find((r: any) => r.name === roleName);
          if (existing) {
            existing.value++;
          } else {
            acc.push({ name: roleName, value: 1 });
          }
          return acc;
        }, [] as Array<{ name: string; value: number }>) || [];

        // Popularidade das soluções
        const solutionStats = (solutionsData as any)?.map((solution: any) => {
          const implementations = (progressData as any)?.filter((p: any) => (p as any).solution_id === (solution as any).id).length || 0;
          return { name: (solution as any).title, value: implementations };
        }).sort((a: any, b: any) => b.value - a.value).slice(0, 5) || [];

        // Implementações por categoria
        const categoryStats = (solutionsData as any)?.reduce((acc: any, solution: any) => {
          const implementations = (progressData as any)?.filter((p: any) => (p as any).solution_id === (solution as any).id).length || 0;
          const existing = acc.find((c: any) => c.name === (solution as any).category);
          if (existing) {
            existing.value += implementations;
          } else {
            acc.push({ name: (solution as any).category, value: implementations });
          }
          return acc;
        }, [] as Array<{ name: string; value: number }>) || [];

        // Taxa de conclusão
        const completedCount = (progressData as any)?.filter((p: any) => (p as any).is_completed).length || 0;
        const inProgressCount = ((progressData as any)?.length || 0) - completedCount;
        const completionRate = [
          { name: 'Concluídas', value: completedCount },
          { name: 'Em andamento', value: inProgressCount }
        ];

        // Usuários por tempo (últimos 6 meses)
        const usersByTime = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'short' });
          const monthUsers = (usersData as any)?.filter((u: any) => {
            const userDate = new Date((u as any).created_at);
            return userDate.getMonth() === monthDate.getMonth() && 
                   userDate.getFullYear() === monthDate.getFullYear();
          }).length || 0;
          
          const totalUpToMonth = (usersData as any)?.filter((u: any) => {
            const userDate = new Date((u as any).created_at);
            return userDate <= monthDate;
          }).length || 0;

          usersByTime.push({
            name: monthName,
            novos: monthUsers,
            total: totalUpToMonth
          });
        }

        // Atividade por dia da semana
        const dayActivity = Array.from({ length: 7 }, (_, i) => {
          const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i];
          const dayCount = (recentActivity as any)?.filter((a: any) => {
            const activityDate = new Date((a as any).created_at);
            return activityDate.getDay() === i;
          }).length || 0;
          return { day: dayName, atividade: dayCount };
        });

        setData({
          totalUsers,
          activeUsers,
          totalSolutions,
          totalImplementations,
          usersByTime,
          userRoleDistribution: roleDistribution,
          solutionPopularity: solutionStats,
          implementationsByCategory: categoryStats,
          userCompletionRate: completionRate,
          dayOfWeekActivity: dayActivity,
          userActivityByDay: dayActivity.map(d => ({ day: d.day, users: d.atividade }))
        });

      } catch (err: any) {
        console.error('Erro ao buscar dados do analytics:', err);
        setError(err.message || 'Erro ao carregar dados');
        toast({
          title: "Erro ao carregar analytics",
          description: "Não foi possível carregar os dados de analytics.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [params.timeRange, params.category, params.difficulty, toast]);

  return { data, loading, error };
};
