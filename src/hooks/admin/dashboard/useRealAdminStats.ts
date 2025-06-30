import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AdminStats {
  totalUsers: number;
  totalSolutions: number;
  totalLearningLessons: number;
  completedImplementations: number;
  averageImplementationTime: number;
  usersByRole: Array<{ role: string; count: number }>;
  lastMonthGrowth: number;
  activeUsersLast7Days: number;
  contentEngagementRate: number;
}

// Função para calcular data de início baseada no timeRange
const getStartDate = (timeRange: string): Date => {
  const now = new Date();
  
  switch (timeRange) {
    case '7d':
      now.setDate(now.getDate() - 7);
      break;
    case '30d':
      now.setDate(now.getDate() - 30);
      break;
    case '90d':
      now.setDate(now.getDate() - 90);
      break;
    case 'all':
    default:
      now.setFullYear(2020); // Data muito antiga para pegar todos os dados
      break;
  }
  
  return now;
};

export const useRealAdminStats = (timeRange: string) => {
  const [statsData, setStatsData] = useState<AdminStats>({
    totalUsers: 0,
    totalSolutions: 0,
    totalLearningLessons: 0,
    completedImplementations: 0,
    averageImplementationTime: 0,
    usersByRole: [],
    lastMonthGrowth: 0,
    activeUsersLast7Days: 0,
    contentEngagementRate: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      // Calcular data de início baseada no timeRange
      const startDate = getStartDate(timeRange);
      const startDateISO = startDate.toISOString();
      
      // Buscar dados das tabelas com filtro de período
      const [usersResult, solutionsResult, lessonsResult, progressResult] = await Promise.all([
        // Usuários criados no período
        supabase
          .from('profiles')
          .select('id, role', { count: 'exact' })
          .gte('created_at', startDateISO),
        
        // Soluções publicadas no período
        supabase
          .from('solutions')
          .select('id', { count: 'exact' })
          .eq('published', true)
          .gte('created_at', startDateISO),
        
        // Aulas publicadas no período
        supabase
          .from('learning_lessons')
          .select('id', { count: 'exact' })
          .eq('published', true)
          .gte('created_at', startDateISO),
        
        // Implementações completadas no período
        supabase
          .from('progress')
          .select('id, completed_at, created_at', { count: 'exact' })
          .eq('is_completed', true)
          .gte('completed_at', startDateISO)
      ]);

      // Processar roles dos usuários
      const rolesCounts = (usersResult.data || []).reduce((acc: Record<string, number>, user) => {
        const role = user.role || 'member';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const usersByRole = Object.entries(rolesCounts).map(([role, count]) => ({
        role,
        count: count as number
      }));

      // Calcular usuários ativos baseado no período selecionado
      const activeUsersPeriod = timeRange === '7d' ? 7 : 
                              timeRange === '30d' ? 30 : 
                              timeRange === '90d' ? 90 : 7;
      
      const activeUsersStartDate = new Date();
      activeUsersStartDate.setDate(activeUsersStartDate.getDate() - activeUsersPeriod);
      
      const { count: activeUsers } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', activeUsersStartDate.toISOString())
        .not('user_id', 'is', null);

      // Calcular tempo médio de implementação baseado nos dados do período
      let averageImplementationTime = 0;
      if (progressResult.data && progressResult.data.length > 0) {
        const implementationsWithTime = progressResult.data.filter(p => 
          p.completed_at && p.created_at
        );
        
        if (implementationsWithTime.length > 0) {
          const totalMinutes = implementationsWithTime.reduce((acc, curr) => {
            const start = new Date(curr.created_at);
            const end = new Date(curr.completed_at);
            const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
            return acc + (diffMinutes > 0 && diffMinutes < 10080 ? diffMinutes : 0);
          }, 0);
          
          averageImplementationTime = Math.round(totalMinutes / implementationsWithTime.length);
        }
      }

      const totalUsers = usersResult.count || 0;
      const totalSolutions = solutionsResult.count || 0;
      const completedImplementations = progressResult.count || 0;

      // Calcular crescimento baseado no período atual vs período anterior
      const previousPeriodStart = new Date(startDate);
      const periodDuration = new Date().getTime() - startDate.getTime();
      previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDuration);

      const { count: previousPeriodUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', startDateISO);

      const lastMonthGrowth = previousPeriodUsers > 0 ? 
        Math.round(((totalUsers - previousPeriodUsers) / previousPeriodUsers) * 100) : 
        totalUsers > 0 ? 100 : 0;

      setStatsData({
        totalUsers,
        totalSolutions,
        totalLearningLessons: lessonsResult.count || 0,
        completedImplementations,
        averageImplementationTime,
        usersByRole,
        lastMonthGrowth,
        activeUsersLast7Days: activeUsers || Math.floor(totalUsers * 0.3),
        contentEngagementRate: totalUsers > 0 ? Math.round((completedImplementations / totalUsers) * 100) : 0
      });

      console.log(`✅ Estatísticas administrativas carregadas para período ${timeRange}:`, {
        totalUsers,
        totalSolutions,
        completedImplementations,
        activeUsers,
        period: timeRange,
        startDate: startDateISO
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas administrativas:', error);
      
      // Fallback com dados mínimos
      setStatsData({
        totalUsers: 0,
        totalSolutions: 0,
        totalLearningLessons: 0,
        completedImplementations: 0,
        averageImplementationTime: 0,
        usersByRole: [{ role: 'member', count: 0 }],
        lastMonthGrowth: 0,
        activeUsersLast7Days: 0,
        contentEngagementRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, [timeRange]);

  return { statsData, loading, refetch: fetchAdminStats };
};
