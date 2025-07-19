
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface StatsData {
  // Dados cumulativos (sempre totais)
  totalUsers: number;
  totalSolutions: number;
  totalLearningLessons: number;
  completedImplementations: number;
  averageImplementationTime: number;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
  
  // Dados específicos do período selecionado
  newUsersInPeriod: number;
  activeUsersInPeriod: number;
  implementationsInPeriod: number;
  completedInPeriod: number;
  forumActivityInPeriod: number;
  
  // Métricas calculadas para o período
  periodGrowthRate: number;
  periodEngagementRate: number;
  periodCompletionRate: number;
  
  // Para compatibilidade com componentes existentes
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
    newUsersInPeriod: 0,
    activeUsersInPeriod: 0,
    implementationsInPeriod: 0,
    completedInPeriod: 0,
    forumActivityInPeriod: 0,
    periodGrowthRate: 0,
    periodEngagementRate: 0,
    periodCompletionRate: 0,
    lastMonthGrowth: 0,
    activeUsersLast7Days: 0,
    contentEngagementRate: 0
  });

  const refetch = async () => {
    try {
      setLoading(true);
      
      console.log(`🔄 [STATS] Carregando estatísticas para período: ${timeRange}`);
      
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
      
      console.log(`📅 [STATS] Período: ${daysBack} dias, desde: ${startDate.toISOString()}`);

      // === DADOS CUMULATIVOS (sempre totais) ===
      
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

      // Total de implementações completas (acumulado)
      const { count: completedImplementations } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true);

      // === DADOS ESPECÍFICOS DO PERÍODO ===
      
      // Novos usuários no período
      const { count: newUsersInPeriod } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Usuários ativos no período (com atividade)
      const { count: activeUsersInPeriod } = await supabase
        .from('progress')
        .select('user_id', { count: 'exact', head: true })
        .gte('last_activity', startDate.toISOString());

      // Implementações iniciadas no período
      const { count: implementationsInPeriod } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Implementações completadas no período
      const { count: completedInPeriod } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .gte('completed_at', startDate.toISOString());

      // Atividade do fórum no período
      const { count: forumActivityInPeriod } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // === DISTRIBUIÇÃO POR ROLES ===
      const { data: roleDistribution } = await supabase
        .from('profiles')
        .select(`
          id,
          user_roles!left (
            name
          )
        `);
      
      const roleStats: { [key: string]: number } = {};
      
      roleDistribution?.forEach(profile => {
        const userRole = profile.user_roles as any;
        const roleName = userRole?.name || 'member';
        roleStats[roleName] = (roleStats[roleName] || 0) + 1;
      });

      const usersByRole = Object.entries(roleStats).map(([role, count]) => ({
        role: role === 'admin' ? 'Administradores' : 
              role === 'member' ? 'Membros' :
              role === 'membro_club' ? 'Membros Club' :
              role === 'formacao' ? 'Formação' : role,
        count
      }));

      // === CÁLCULOS DE MÉTRICAS DO PERÍODO ===
      
      // Taxa de crescimento do período
      const periodGrowthRate = totalUsers && totalUsers > 0 
        ? Math.round((newUsersInPeriod || 0) / totalUsers * 100)
        : 0;

      // Taxa de engajamento do período
      const periodEngagementRate = totalUsers && totalUsers > 0
        ? Math.round((activeUsersInPeriod || 0) / totalUsers * 100)
        : 0;

      // Taxa de conclusão do período
      const periodCompletionRate = implementationsInPeriod && implementationsInPeriod > 0
        ? Math.round((completedInPeriod || 0) / implementationsInPeriod * 100)
        : 0;

      // Para compatibilidade com componentes existentes
      const lastMonthGrowth = periodGrowthRate;
      const activeUsersLast7Days = activeUsersInPeriod || 0;
      const contentEngagementRate = periodEngagementRate;

      const finalStats: StatsData = {
        // Cumulativos
        totalUsers: totalUsers || 0,
        totalSolutions: totalSolutions || 0,
        totalLearningLessons: totalLessons || 0,
        completedImplementations: completedImplementations || 0,
        averageImplementationTime: 240,
        usersByRole,
        
        // Específicos do período
        newUsersInPeriod: newUsersInPeriod || 0,
        activeUsersInPeriod: activeUsersInPeriod || 0,
        implementationsInPeriod: implementationsInPeriod || 0,
        completedInPeriod: completedInPeriod || 0,
        forumActivityInPeriod: forumActivityInPeriod || 0,
        
        // Métricas calculadas
        periodGrowthRate,
        periodEngagementRate,
        periodCompletionRate,
        
        // Compatibilidade
        lastMonthGrowth,
        activeUsersLast7Days,
        contentEngagementRate
      };

      setStatsData(finalStats);
      
      console.log('✅ [STATS] Estatísticas carregadas:', {
        periodo: `${daysBack} dias`,
        totalUsers: finalStats.totalUsers,
        newUsersInPeriod: finalStats.newUsersInPeriod,
        activeUsersInPeriod: finalStats.activeUsersInPeriod,
        implementationsInPeriod: finalStats.implementationsInPeriod,
        completedInPeriod: finalStats.completedInPeriod,
        periodGrowthRate: finalStats.periodGrowthRate,
        periodEngagementRate: finalStats.periodEngagementRate,
        timeRange
      });

    } catch (error: any) {
      console.error("❌ [STATS] Erro ao carregar estatísticas:", error);
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
    console.log(`🔄 [STATS] TimeRange mudou para: ${timeRange}`);
    refetch();
  }, [timeRange]);

  return { statsData, loading, refetch };
};
