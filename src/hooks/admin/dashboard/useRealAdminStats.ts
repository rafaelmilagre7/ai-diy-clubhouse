
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";

interface StatsData {
  totalUsers: number;
  totalSolutions: number;
  totalLearningLessons: number;
  completedImplementations: number;
  averageImplementationTime: number;
  usersByRole: { role: string; count: number }[];
  lastMonthGrowth: number;
  activeUsersLast7Days: number;
  contentEngagementRate: number;
}

const getDefaultStats = (): StatsData => ({
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

export const useRealAdminStats = (timeRange: string) => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsData>(getDefaultStats());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        logger.info('[ADMIN-STATS] Iniciando busca de estatísticas', { timeRange });

        const stats = getDefaultStats();

        // 1. Buscar total de usuários com fallback
        try {
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id, created_at, role')
            .limit(1000);
          
          if (usersError) {
            logger.warn('[ADMIN-STATS] Erro ao buscar usuários:', usersError);
          } else {
            stats.totalUsers = usersData?.length || 0;
            
            // Calcular crescimento do último mês
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const recentUsers = usersData?.filter(
              u => new Date(u.created_at) >= thirtyDaysAgo
            ).length || 0;
            
            stats.lastMonthGrowth = stats.totalUsers > 0 ? 
              Math.round((recentUsers / stats.totalUsers) * 100) : 0;

            // Agrupar por role
            const roleGroups = usersData?.reduce((acc, user) => {
              const role = user.role || 'unknown';
              acc[role] = (acc[role] || 0) + 1;
              return acc;
            }, {} as Record<string, number>) || {};

            stats.usersByRole = Object.entries(roleGroups).map(([role, count]) => ({
              role,
              count
            }));
          }
        } catch (error) {
          logger.error('[ADMIN-STATS] Erro na consulta de usuários:', error);
        }

        // 2. Buscar soluções com fallback
        try {
          const { data: solutionsData, error: solutionsError } = await supabase
            .from('solutions')
            .select('id, published')
            .eq('published', true);
          
          if (solutionsError) {
            logger.warn('[ADMIN-STATS] Erro ao buscar soluções:', solutionsError);
          } else {
            stats.totalSolutions = solutionsData?.length || 0;
          }
        } catch (error) {
          logger.error('[ADMIN-STATS] Erro na consulta de soluções:', error);
        }

        // 3. Buscar aulas com fallback
        try {
          const { data: lessonsData, error: lessonsError } = await supabase
            .from('learning_lessons')
            .select('id, published')
            .eq('published', true);
          
          if (lessonsError) {
            logger.warn('[ADMIN-STATS] Erro ao buscar aulas:', lessonsError);
          } else {
            stats.totalLearningLessons = lessonsData?.length || 0;
          }
        } catch (error) {
          logger.error('[ADMIN-STATS] Erro na consulta de aulas:', error);
        }

        // 4. Buscar progresso com fallback
        try {
          const { data: progressData, error: progressError } = await supabase
            .from('progress')
            .select('id, is_completed, created_at, completed_at')
            .limit(1000);
          
          if (progressError) {
            logger.warn('[ADMIN-STATS] Erro ao buscar progresso:', progressError);
          } else {
            const completed = progressData?.filter(p => p.is_completed) || [];
            stats.completedImplementations = completed.length;

            // Calcular tempo médio de implementação
            const completedWithTime = completed.filter(p => 
              p.completed_at && p.created_at
            );
            
            if (completedWithTime.length > 0) {
              const totalMinutes = completedWithTime.reduce((acc, curr) => {
                const start = new Date(curr.created_at);
                const end = new Date(curr.completed_at);
                const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
                return acc + (diffMinutes > 0 && diffMinutes < 10080 ? diffMinutes : 0);
              }, 0);
              
              stats.averageImplementationTime = Math.round(totalMinutes / completedWithTime.length);
            }
          }
        } catch (error) {
          logger.error('[ADMIN-STATS] Erro na consulta de progresso:', error);
        }

        // 5. Buscar usuários ativos (últimos 7 dias) com fallback
        try {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const { data: analyticsData, error: analyticsError } = await supabase
            .from('analytics')
            .select('user_id')
            .gte('created_at', sevenDaysAgo.toISOString())
            .limit(1000);
          
          if (analyticsError) {
            logger.warn('[ADMIN-STATS] Erro ao buscar analytics:', analyticsError);
          } else {
            const uniqueUsers = new Set(analyticsData?.map(a => a.user_id) || []);
            stats.activeUsersLast7Days = uniqueUsers.size;
            
            // Taxa de engajamento aproximada
            stats.contentEngagementRate = stats.totalUsers > 0 ? 
              Math.round((stats.activeUsersLast7Days / stats.totalUsers) * 100) : 0;
          }
        } catch (error) {
          logger.error('[ADMIN-STATS] Erro na consulta de analytics:', error);
        }

        logger.info('[ADMIN-STATS] Estatísticas carregadas com sucesso', {
          totalUsers: stats.totalUsers,
          totalSolutions: stats.totalSolutions,
          totalLearningLessons: stats.totalLearningLessons,
          completedImplementations: stats.completedImplementations
        });

        setStatsData(stats);

      } catch (error) {
        logger.error('[ADMIN-STATS] Erro geral ao carregar estatísticas:', error);
        setStatsData(getDefaultStats());
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  return { statsData, loading };
};
