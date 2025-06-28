
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";

interface AdminStatsData {
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

interface SystemActivity {
  id: string;
  user_id: string;
  event_type: string;
  created_at: string;
  user_name?: string;
  event_description: string;
}

interface ActivityData {
  totalEvents: number;
  eventsByType: { type: string; count: number }[];
  userActivities: SystemActivity[];
}

const getDateRangeFromTimeRange = (timeRange: string) => {
  const now = new Date();
  let startDate: Date;
  
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
    default:
      startDate = new Date('2020-01-01'); // Data bem antiga para pegar tudo
      break;
  }
  
  return { startDate, endDate: now };
};

export const useRealAdminDashboardData = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<AdminStatsData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
        
        logger.info('[ADMIN-DASHBOARD] Carregando dados reais', {
          timeRange,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });

        // 1. Buscar todos os usuários (sem filtro de data para total)
        const { data: allUsers, error: usersError } = await supabase
          .from('profiles')
          .select(`
            id,
            created_at,
            user_roles (
              name
            )
          `);

        if (usersError) throw new Error(`Erro ao buscar usuários: ${usersError.message}`);

        // 2. Buscar soluções publicadas
        const { data: solutions, error: solutionsError } = await supabase
          .from('solutions')
          .select('id, published, created_at')
          .eq('published', true);

        if (solutionsError) throw new Error(`Erro ao buscar soluções: ${solutionsError.message}`);

        // 3. Buscar aulas do LMS
        const { data: learningLessons, error: lessonsError } = await supabase
          .from('learning_lessons')
          .select('id, created_at');

        if (lessonsError) throw new Error(`Erro ao buscar aulas: ${lessonsError.message}`);

        // 4. Buscar progresso completo (filtrado por período se não for 'all')
        let progressQuery = supabase
          .from('progress')
          .select('id, is_completed, created_at, completed_at, last_activity');
        
        if (timeRange !== 'all') {
          progressQuery = progressQuery.gte('created_at', startDate.toISOString());
        }

        const { data: progress, error: progressError } = await progressQuery;

        if (progressError) throw new Error(`Erro ao buscar progresso: ${progressError.message}`);

        // 5. Buscar analytics (se existir, filtrado por período)
        let analyticsQuery = supabase
          .from('analytics')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (timeRange !== 'all') {
          analyticsQuery = analyticsQuery.gte('created_at', startDate.toISOString());
        }

        const { data: analytics, error: analyticsError } = await analyticsQuery;

        // Analytics pode não existir - isso é normal
        if (analyticsError && !analyticsError.message.includes('does not exist')) {
          logger.warn('[ADMIN-DASHBOARD] Analytics não disponível', { error: analyticsError });
        }

        // CALCULAR ESTATÍSTICAS REAIS (SEM FALLBACKS)
        const totalUsers = allUsers?.length || 0;
        const totalSolutions = solutions?.length || 0;
        const totalLearningLessons = learningLessons?.length || 0;
        
        // Implementações completas (REAL - sem fallback)
        const completedImplementations = progress?.filter(p => (p as any).is_completed)?.length || 0;

        // Tempo médio de implementação (REAL - sem fallback de 480min)
        let averageImplementationTime = 0;
        const completedWithTimes = progress?.filter(p => 
          (p as any).is_completed && 
          (p as any).completed_at && 
          (p as any).created_at
        ) || [];

        if (completedWithTimes.length > 0) {
          const totalMinutes = completedWithTimes.reduce((acc, curr) => {
            const start = new Date((curr as any).created_at);
            const end = new Date((curr as any).completed_at);
            const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
            return acc + (diffMinutes > 0 && diffMinutes < 43200 ? diffMinutes : 0); // Max 30 dias
          }, 0);
          
          averageImplementationTime = Math.round(totalMinutes / completedWithTimes.length);
        }

        // Distribuição por role (REAL - sem fallback)
        const usersByRole: { role: string; count: number }[] = [];
        const roleMap = new Map<string, number>();
        
        allUsers?.forEach(user => {
          const roleName = (user as any).user_roles?.name || 'sem_role';
          roleMap.set(roleName, (roleMap.get(roleName) || 0) + 1);
        });
        
        roleMap.forEach((count, role) => {
          usersByRole.push({ role, count });
        });

        // Crescimento mensal (REAL - baseado em dados)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentUsers = allUsers?.filter(
          u => new Date((u as any).created_at) >= thirtyDaysAgo
        ).length || 0;
        
        const lastMonthGrowth = totalUsers > 0 ? 
          Math.round((recentUsers / totalUsers) * 100) : 0;

        // Usuários ativos últimos 7 dias (REAL - baseado em analytics se disponível)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        let activeUsersLast7Days = 0;
        
        if (analytics && analytics.length > 0) {
          const uniqueUsers = new Set(
            analytics
              .filter(a => new Date((a as any).created_at) >= sevenDaysAgo)
              .map(a => (a as any).user_id)
          );
          activeUsersLast7Days = uniqueUsers.size;
        }

        // Taxa de engajamento (REAL - baseada em progresso vs usuários)
        const contentEngagementRate = totalUsers > 0 ? 
          Math.round((progress?.length || 0) / totalUsers * 100) : 0;

        setStatsData({
          totalUsers,
          totalSolutions,
          totalLearningLessons,
          completedImplementations,
          averageImplementationTime,
          usersByRole,
          lastMonthGrowth,
          activeUsersLast7Days,
          contentEngagementRate
        });

        // ATIVIDADES DO SISTEMA (REAL - sem mock)
        const systemActivities: SystemActivity[] = [];
        const eventsByType: { type: string; count: number }[] = [];

        if (analytics && analytics.length > 0) {
          // Buscar nomes dos usuários para as atividades
          const userIds = [...new Set(analytics.map(a => (a as any).user_id))];
          const { data: userProfiles } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', userIds);

          const userNameMap = new Map(
            userProfiles?.map(u => [u.id, u.name]) || []
          );

          // Processar atividades reais
          analytics.slice(0, 20).forEach(activity => {
            systemActivities.push({
              id: (activity as any).id,
              user_id: (activity as any).user_id,
              event_type: (activity as any).event_type || 'activity',
              created_at: (activity as any).created_at,
              user_name: userNameMap.get((activity as any).user_id) || 'Usuário',
              event_description: (activity as any).description || 'Atividade do sistema'
            });
          });

          // Contar eventos por tipo
          const eventTypeMap = new Map<string, number>();
          analytics.forEach(a => {
            const type = (a as any).event_type || 'activity';
            eventTypeMap.set(type, (eventTypeMap.get(type) || 0) + 1);
          });

          eventTypeMap.forEach((count, type) => {
            eventsByType.push({ type, count });
          });
        }

        setActivityData({
          totalEvents: analytics?.length || 0,
          eventsByType,
          userActivities: systemActivities
        });

        logger.info('[ADMIN-DASHBOARD] Dados carregados com sucesso', {
          totalUsers,
          totalSolutions,
          totalEvents: analytics?.length || 0,
          timeRange
        });

      } catch (error) {
        logger.error('[ADMIN-DASHBOARD] Erro ao carregar dados', error);
        setError(error instanceof Error ? error : new Error('Erro desconhecido'));
        
        toast({
          title: "Erro ao carregar dashboard",
          description: "Não foi possível carregar os dados do dashboard administrativo.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange, toast]);

  return {
    statsData,
    activityData,
    loading,
    error
  };
};
