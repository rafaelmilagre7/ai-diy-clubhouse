
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
      
      // Buscar usuários criados no período com informações de role
      const usersResult = await supabase
        .from('profiles')
        .select(`
          id, 
          role,
          created_at,
          user_roles:role_id (
            name
          )
        `, { count: 'exact' })
        .gte('created_at', startDateISO);

      // Tentar buscar soluções com fallback
      let solutionsResult;
      try {
        solutionsResult = await supabase
          .from('solutions')
          .select('id, created_at', { count: 'exact' })
          .eq('published', true)
          .gte('created_at', startDateISO);
      } catch (error) {
        console.warn('Tabela solutions não existe, usando fallback');
        solutionsResult = { data: [], count: 0, error: null };
      }
      
      // Buscar aulas publicadas no período
      const lessonsResult = await supabase
        .from('learning_lessons')
        .select('id, created_at', { count: 'exact' })
        .eq('published', true)
        .gte('created_at', startDateISO);
      
      // Tentar buscar implementações com fallback
      let progressResult;
      try {
        progressResult = await supabase
          .from('progress')
          .select('id, user_id, completed_at, created_at, last_activity', { count: 'exact' })
          .eq('is_completed', true)
          .gte('completed_at', startDateISO);
      } catch (error) {
        console.warn('Tabela progress não existe, usando fallback');
        progressResult = { data: [], count: 0, error: null };
      }

      // Processar roles dos usuários com fallback
      const rolesCounts = (usersResult.data || []).reduce((acc: Record<string, number>, user) => {
        const roleData = user.user_roles as any;
        const role = roleData?.name || user.role || 'member';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const usersByRole = Object.entries(rolesCounts).map(([role, count]) => ({
        role,
        count: count as number
      }));

      // Buscar usuários ativos com query otimizada
      const activeUsersPeriod = timeRange === '7d' ? 7 : 
                              timeRange === '30d' ? 30 : 
                              timeRange === '90d' ? 90 : 7;
      
      const activeUsersStartDate = new Date();
      activeUsersStartDate.setDate(activeUsersStartDate.getDate() - activeUsersPeriod);
      
      // Buscar atividades recentes para contar usuários ativos
      const { data: recentActivities } = await supabase
        .from('analytics')
        .select('user_id')
        .gte('created_at', activeUsersStartDate.toISOString())
        .not('user_id', 'is', null);

      // Contar usuários únicos ativos
      const uniqueActiveUsers = new Set(recentActivities?.map(a => a.user_id) || []);

      // Calcular tempo médio de implementação com dados mais precisos
      let averageImplementationTime = 0;
      if (progressResult?.data && progressResult.data.length > 0) {
        const implementationsWithTime = progressResult.data.filter(p => 
          p.completed_at && p.created_at
        );
        
        if (implementationsWithTime.length > 0) {
          const validImplementations = implementationsWithTime
            .map(p => {
              const start = new Date(p.created_at);
              const end = new Date(p.completed_at);
              const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
              return diffMinutes;
            })
            .filter(minutes => minutes > 0 && minutes < 43200); // Entre 1 minuto e 30 dias
          
          if (validImplementations.length > 0) {
            averageImplementationTime = Math.round(
              validImplementations.reduce((sum, time) => sum + time, 0) / validImplementations.length
            );
          }
        }
      }

      const totalUsers = usersResult?.count || 0;
      const totalSolutions = solutionsResult?.count || 0;
      const completedImplementations = progressResult?.count || 0;

      // Calcular crescimento com base no período anterior
      const previousPeriodStart = new Date(startDate);
      const periodDuration = new Date().getTime() - startDate.getTime();
      previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDuration);

      const { count: previousPeriodUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', startDateISO);

      const lastMonthGrowth = previousPeriodUsers && previousPeriodUsers > 0 ? 
        Math.round(((totalUsers - previousPeriodUsers) / previousPeriodUsers) * 100) : 
        totalUsers > 0 ? 100 : 0;

      // Calcular taxa de engajamento
      const contentEngagementRate = totalUsers > 0 ? 
        Math.round((completedImplementations / totalUsers) * 100) : 0;

      setStatsData({
        totalUsers,
        totalSolutions,
        totalLearningLessons: lessonsResult.count || 0,
        completedImplementations,
        averageImplementationTime,
        usersByRole,
        lastMonthGrowth,
        activeUsersLast7Days: uniqueActiveUsers.size,
        contentEngagementRate
      });

      console.log(`✅ Estatísticas administrativas otimizadas para período ${timeRange}:`, {
        totalUsers,
        totalSolutions,
        completedImplementations,
        activeUsers: uniqueActiveUsers.size,
        avgTime: averageImplementationTime,
        period: timeRange,
        startDate: startDateISO
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas administrativas:', error);
      
      // Fallback com dados estruturados
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
