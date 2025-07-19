
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface StatsData {
  totalUsers: number;
  totalSolutions: number;
  totalLearningLessons: number;
  completedImplementations: number;
  averageImplementationTime: number;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
  lastMonthGrowth: number;
  activeUsersLast7Days: number;
  contentEngagementRate: number;
}

export const useRealAdminStats = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsData>({
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

  const refetch = async () => {
    try {
      setLoading(true);
      
      console.log(`🔄 Carregando estatísticas para período: ${timeRange}`);
      
      // 1. DADOS CUMULATIVOS (sem filtro de data) - totais absolutos
      
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Total de soluções publicadas
      const { count: totalSolutions } = await supabase
        .from('solutions')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      // Total de aulas publicadas
      const { count: totalLessons } = await supabase
        .from('learning_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      // Total de implementações completas (sem filtro de data)
      const { count: completedImplementations } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true);

      // 2. DADOS TEMPORAIS (com filtro de data baseado no timeRange)
      
      // Calcular data de início baseada no timeRange
      const daysMap: { [key: string]: number } = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      
      const daysBack = daysMap[timeRange] || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Novos usuários no período
      const { count: newUsersInPeriod } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Usuários ativos nos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers7d } = await supabase
        .from('progress')
        .select('user_id', { count: 'exact', head: true })
        .gte('last_activity', sevenDaysAgo.toISOString());

      // 3. DISTRIBUIÇÃO POR ROLES (com LEFT JOIN para não perder dados)
      const { data: roleDistribution } = await supabase
        .from('profiles')
        .select(`
          id,
          user_roles!left (
            name
          )
        `);
      
      // Processar distribuição de roles com fallback
      const roleStats: { [key: string]: number } = {};
      
      roleDistribution?.forEach(profile => {
        const roleName = profile.user_roles?.name || 'member';
        roleStats[roleName] = (roleStats[roleName] || 0) + 1;
      });

      const usersByRole = Object.entries(roleStats).map(([role, count]) => ({
        role: role === 'admin' ? 'Administradores' : 
              role === 'member' ? 'Membros' :
              role === 'membro_club' ? 'Membros Club' :
              role === 'formacao' ? 'Formação' : role,
        count
      }));

      // 4. CÁLCULOS DERIVADOS
      
      // Taxa de crescimento (novos usuários vs total)
      const lastMonthGrowth = totalUsers && totalUsers > 0 
        ? Math.round((newUsersInPeriod || 0) / totalUsers * 100)
        : 0;

      // Taxa de engajamento (usuários ativos vs total)
      const contentEngagementRate = totalUsers && totalUsers > 0
        ? Math.round((activeUsers7d || 0) / totalUsers * 100)
        : 0;

      // Tempo médio de implementação (estimado)
      const averageImplementationTime = 240; // 4 horas em minutos

      const finalStats: StatsData = {
        totalUsers: totalUsers || 0,
        totalSolutions: totalSolutions || 0,
        totalLearningLessons: totalLessons || 0,
        completedImplementations: completedImplementations || 0,
        averageImplementationTime,
        usersByRole,
        lastMonthGrowth,
        activeUsersLast7Days: activeUsers7d || 0,
        contentEngagementRate
      };

      setStatsData(finalStats);
      
      console.log('✅ Estatísticas administrativas carregadas:', {
        totalUsers: finalStats.totalUsers,
        totalSolutions: finalStats.totalSolutions,
        completedImplementations: finalStats.completedImplementations,
        activeUsers: finalStats.activeUsersLast7Days,
        roleDistribution: finalStats.usersByRole,
        period: timeRange,
        startDate: startDate.toISOString()
      });

    } catch (error: any) {
      console.error("❌ Erro ao carregar estatísticas:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar as estatísticas do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [timeRange]);

  return { statsData, loading, refetch };
};
