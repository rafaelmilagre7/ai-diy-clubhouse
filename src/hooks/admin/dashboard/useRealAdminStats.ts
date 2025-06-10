
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
        
        // Buscar total de usuários com roles
        const { data: usersWithRoles, error: usersError } = await supabase
          .from('profiles')
          .select(`
            id, 
            created_at, 
            role,
            user_roles!inner(name)
          `);
        
        if (usersError) throw usersError;
        
        // Buscar soluções publicadas
        const { data: solutions, error: solutionsError } = await supabase
          .from('solutions')
          .select('id, published')
          .eq('published', true);
        
        if (solutionsError) throw solutionsError;
        
        // Buscar aulas publicadas
        const { data: lessons, error: lessonsError } = await supabase
          .from('learning_lessons')
          .select('id, published')
          .eq('published', true);
        
        if (lessonsError) throw lessonsError;
        
        // Buscar implementações completadas
        const { data: completedProgress, error: progressError } = await supabase
          .from('progress')
          .select('id, completed_at, created_at')
          .not('completed_at', 'is', null);
        
        if (progressError) throw progressError;
        
        // Buscar atividade recente (últimos 7 dias)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: recentActivity, error: activityError } = await supabase
          .from('analytics')
          .select('user_id, created_at')
          .gte('created_at', sevenDaysAgo.toISOString());
        
        if (activityError) throw activityError;
        
        // Calcular estatísticas
        const totalUsers = usersWithRoles?.length || 0;
        const totalSolutions = solutions?.length || 0;
        const totalLearningLessons = lessons?.length || 0;
        const completedImplementations = completedProgress?.length || 0;
        
        // Distribuição por role
        const usersByRole = usersWithRoles?.reduce((acc, user) => {
          const roleName = user.user_roles?.name || user.role || 'member';
          const existing = acc.find(r => r.role === roleName);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ role: roleName, count: 1 });
          }
          return acc;
        }, [] as { role: string; count: number }[]) || [];
        
        // Crescimento do último mês
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const recentUsers = usersWithRoles?.filter(
          u => new Date(u.created_at) >= oneMonthAgo
        ).length || 0;
        
        const lastMonthGrowth = totalUsers > 0 ? 
          Math.round((recentUsers / totalUsers) * 100) : 0;
        
        // Usuários ativos últimos 7 dias
        const uniqueActiveUsers = new Set(recentActivity?.map(a => a.user_id)).size;
        
        // Taxa de engajamento (usuários ativos / total de usuários)
        const contentEngagementRate = totalUsers > 0 ? 
          Math.round((uniqueActiveUsers / totalUsers) * 100) : 0;
        
        // Tempo médio de implementação
        let averageImplementationTime = 0;
        if (completedProgress && completedProgress.length > 0) {
          const totalMinutes = completedProgress.reduce((acc, curr) => {
            if (curr.completed_at && curr.created_at) {
              const start = new Date(curr.created_at);
              const end = new Date(curr.completed_at);
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
