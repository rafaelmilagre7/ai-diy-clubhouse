
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface RealStatsData {
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

export const useRealAdminStats = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<RealStatsData>({
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

  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        setLoading(true);
        
        // Calcular data de início baseada no timeRange
        const now = new Date();
        let startDate: Date | null = null;
        
        if (timeRange !== 'all') {
          startDate = new Date();
          switch (timeRange) {
            case '7d':
              startDate.setDate(now.getDate() - 7);
              break;
            case '30d':
              startDate.setDate(now.getDate() - 30);
              break;
            case '90d':
              startDate.setDate(now.getDate() - 90);
              break;
            default:
              startDate = null;
          }
        }
        
        // Buscar total de usuários com filtro de data se aplicável
        let usersQuery = supabase
          .from('profiles')
          .select(`
            id, 
            created_at, 
            role,
            user_roles!inner(name)
          `);
        
        if (startDate) {
          usersQuery = usersQuery.gte('created_at', startDate.toISOString());
        }
        
        const { data: usersWithRoles, error: usersError } = await usersQuery;
        if (usersError) throw usersError;
        
        // Para comparação, buscar todos os usuários para calcular crescimento
        const { data: allUsers, error: allUsersError } = await supabase
          .from('profiles')
          .select('id, created_at');
        if (allUsersError) throw allUsersError;
        
        // Buscar soluções publicadas com filtro de data
        let solutionsQuery = supabase
          .from('solutions')
          .select('id, published, created_at')
          .eq('published', true as any);
        
        if (startDate) {
          solutionsQuery = solutionsQuery.gte('created_at', startDate.toISOString());
        }
        
        const { data: solutions, error: solutionsError } = await solutionsQuery;
        if (solutionsError) throw solutionsError;
        
        // Buscar aulas publicadas com filtro de data
        let lessonsQuery = supabase
          .from('learning_lessons')
          .select('id, published, created_at')
          .eq('published', true as any);
        
        if (startDate) {
          lessonsQuery = lessonsQuery.gte('created_at', startDate.toISOString());
        }
        
        const { data: lessons, error: lessonsError } = await lessonsQuery;
        if (lessonsError) throw lessonsError;
        
        // Buscar implementações completadas com filtro de data
        let progressQuery = supabase
          .from('progress')
          .select('id, completed_at, created_at')
          .not('completed_at', 'is', null);
        
        if (startDate) {
          progressQuery = progressQuery.gte('completed_at', startDate.toISOString());
        }
        
        const { data: completedProgress, error: progressError } = await progressQuery;
        if (progressError) throw progressError;
        
        // Buscar atividade recente baseada no timeRange
        const activityDate = startDate || new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        const { data: recentActivity, error: activityError } = await supabase
          .from('analytics')
          .select('user_id, created_at')
          .gte('created_at', activityDate.toISOString());
        
        if (activityError) throw activityError;
        
        // Calcular estatísticas baseadas no período
        const totalUsers = usersWithRoles?.length || 0;
        const totalSolutions = solutions?.length || 0;
        const totalLearningLessons = lessons?.length || 0;
        const completedImplementations = completedProgress?.length || 0;
        
        // Distribuição por role - apenas para o período selecionado
        const usersByRole = usersWithRoles?.reduce((acc, user) => {
          const userRoleData = Array.isArray((user as any).user_roles) ? (user as any).user_roles[0] : (user as any).user_roles;
          const roleName = userRoleData?.name || (user as any).role || 'member';
          const existing = acc.find(r => r.role === roleName);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ role: roleName, count: 1 });
          }
          return acc;
        }, [] as { role: string; count: number }[]) || [];
        
        // Calcular crescimento comparativo
        let lastMonthGrowth = 0;
        if (timeRange !== 'all' && allUsers) {
          const periodStart = startDate || new Date(0);
          const periodEnd = now;
          const periodLength = periodEnd.getTime() - periodStart.getTime();
          const previousPeriodStart = new Date(periodStart.getTime() - periodLength);
          
          const currentPeriodUsers = allUsers.filter(
            u => new Date((u as any).created_at) >= periodStart && new Date((u as any).created_at) <= periodEnd
          ).length;
          
          const previousPeriodUsers = allUsers.filter(
            u => new Date((u as any).created_at) >= previousPeriodStart && new Date((u as any).created_at) < periodStart
          ).length;
          
          if (previousPeriodUsers > 0) {
            lastMonthGrowth = Math.round(((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100);
          } else if (currentPeriodUsers > 0) {
            lastMonthGrowth = 100;
          }
        }
        
        // Usuários ativos no período
        const uniqueActiveUsers = new Set(recentActivity?.map(a => (a as any).user_id)).size;
        
        // Taxa de engajamento baseada no total de usuários existentes
        const allUsersCount = allUsers?.length || 1;
        const contentEngagementRate = Math.round((uniqueActiveUsers / allUsersCount) * 100);
        
        // Tempo médio de implementação para o período
        let averageImplementationTime = 0;
        if (completedProgress && completedProgress.length > 0) {
          const totalMinutes = completedProgress.reduce((acc, curr) => {
            if ((curr as any).completed_at && (curr as any).created_at) {
              const start = new Date((curr as any).created_at);
              const end = new Date((curr as any).completed_at);
              const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
              return acc + (diffMinutes > 0 && diffMinutes < 10080 ? diffMinutes : 0);
            }
            return acc;
          }, 0);
          
          averageImplementationTime = Math.round(totalMinutes / completedProgress.length);
        }

        setStatsData({
          totalUsers,
          totalSolutions,
          totalLearningLessons,
          completedImplementations,
          averageImplementationTime,
          usersByRole,
          lastMonthGrowth,
          activeUsersLast7Days: uniqueActiveUsers,
          contentEngagementRate
        });

      } catch (error: any) {
        console.error("Erro ao carregar estatísticas reais:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar as estatísticas do dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRealStats();
  }, [toast, timeRange]);

  return { statsData, loading };
};
