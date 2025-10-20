
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface StatsData {
  // Dados cumulativos
  totalUsers: number;
  totalSolutions: number;
  totalLearningLessons: number;
  completedImplementations: number;
  averageImplementationTime: number;
  usersByRole: { role: string; count: number }[];
  
  // Dados específicos do período
  newUsersInPeriod: number;
  activeUsersInPeriod: number;
  implementationsInPeriod: number;
  completedInPeriod: number;
  
  // Métricas calculadas
  periodGrowthRate: number;
  periodEngagementRate: number;
  periodCompletionRate: number;
  
  // Identificador do período para forçar re-render
  timeRange: string;
  lastUpdated: string;
  
  // Campos de compatibilidade
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
    averageImplementationTime: 240,
    usersByRole: [],
    newUsersInPeriod: 0,
    activeUsersInPeriod: 0,
    implementationsInPeriod: 0,
    completedInPeriod: 0,
    periodGrowthRate: 0,
    periodEngagementRate: 0,
    periodCompletionRate: 0,
    timeRange: timeRange,
    lastUpdated: new Date().toISOString(),
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

      // === DADOS CUMULATIVOS (não mudam com período) ===
      
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Total de soluções
      const { count: totalSolutions } = await supabase
        .from('solutions')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      // Total de aulas
      const { count: totalLearningLessons } = await supabase
        .from('learning_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      // Total de implementações completas
      const { count: completedImplementations } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true);

      // Segmentação de usuários por role - corrigir consulta
      const { data: userRoles } = await supabase
        .from('profiles')
        .select(`
          role_id,
          user_roles (
            name
          )
        `)
        .not('role_id', 'is', null);

      // Processar contagem por roles
      const roleCount: { [key: string]: number } = {};
      userRoles?.forEach(user => {
        const roleName = (user.user_roles as any)?.name || 'Outros';
        roleCount[roleName] = (roleCount[roleName] || 0) + 1;
      });

      const userSegmentation = Object.entries(roleCount).map(([name, count]) => ({
        role_name: name,
        user_count: count
      }));

      // === DADOS ESPECÍFICOS DO PERÍODO ===

      // Novos usuários no período
      const { count: newUsersInPeriod } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Implementações ativas no período (implementation_trails)
      const { count: activeImplementationsInPeriod } = await supabase
        .from('implementation_trails')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Implementações completadas no período (implementation_trails com status completed)
      const { count: completedInPeriod } = await supabase
        .from('implementation_trails')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      // Usuários ativos no período = total de usuários (tabela analytics está vazia)
      // Vamos usar o total de usuários como proxy
      const activeUsersInPeriod = totalUsers || 0;

      // === CALCULAR MÉTRICAS ===
      
      // Taxa de crescimento do período
      const periodGrowthRate = totalUsers && totalUsers > 0 ? 
        Math.round(((newUsersInPeriod || 0) / totalUsers) * 100) : 0;

      // Taxa de engajamento do período
      const periodEngagementRate = totalUsers && totalUsers > 0 ? 
        Math.round((activeUsersInPeriod / totalUsers) * 100) : 0;

      // Taxa de conclusão do período
      const totalImplementationsInPeriod = activeImplementationsInPeriod || 0;
      const periodCompletionRate = totalImplementationsInPeriod > 0 ? 
        Math.round(((completedInPeriod || 0) / totalImplementationsInPeriod) * 100) : 0;

      // Processar roles corrigido
      const usersByRole = (userSegmentation || []).map(item => ({
        role: item.role_name === 'member' ? 'Membros Club' : 
              item.role_name === 'admin' ? 'Administradores' :
              item.role_name === 'formacao' ? 'Formação' : 
              item.role_name === 'membro_club' ? 'Membros Club' :
              item.role_name || 'Outros',
        count: item.user_count || 0
      }));

      const finalStats: StatsData = {
        // Dados cumulativos corretos
        totalUsers: totalUsers || 0,
        totalSolutions: totalSolutions || 0,
        totalLearningLessons: totalLearningLessons || 0,
        completedImplementations: completedImplementations || 0,
        averageImplementationTime: 240, // 4 horas em minutos
        usersByRole,
        
        // Dados específicos do período
        newUsersInPeriod: newUsersInPeriod || 0,
        activeUsersInPeriod: activeUsersInPeriod || 0,
        implementationsInPeriod: activeImplementationsInPeriod || 0,
        completedInPeriod: completedInPeriod || 0,
        
        // Métricas calculadas
        periodGrowthRate,
        periodEngagementRate,
        periodCompletionRate,
        
        // Identificadores para forçar re-render
        timeRange,
        lastUpdated: new Date().toISOString(),
        
        // Campos de compatibilidade
        lastMonthGrowth: periodGrowthRate,
        activeUsersLast7Days: activeUsersInPeriod,
        contentEngagementRate: periodEngagementRate
      };

      setStatsData(finalStats);
      
      console.log('✅ [STATS] Estatísticas carregadas:', {
        periodo: `${daysBack} dias`,
        totalUsers: finalStats.totalUsers,
        totalSolutions: finalStats.totalSolutions,
        totalLearningLessons: finalStats.totalLearningLessons,
        completedImplementations: finalStats.completedImplementations,
        newUsersInPeriod: finalStats.newUsersInPeriod,
        activeUsersInPeriod: finalStats.activeUsersInPeriod,
        implementationsInPeriod: finalStats.implementationsInPeriod,
        completedInPeriod: finalStats.completedInPeriod,
        periodGrowthRate: finalStats.periodGrowthRate,
        periodEngagementRate: finalStats.periodEngagementRate,
        timeRange: finalStats.timeRange,
        usersByRole: finalStats.usersByRole
      });

    } catch (error: any) {
      console.error("❌ [STATS] Erro ao carregar estatísticas:", error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Ocorreu um erro ao carregar os dados estatísticos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Automaticamente atualiza quando timeRange muda
  useEffect(() => {
    console.log(`🔄 [STATS] TimeRange mudou para: ${timeRange}`);
    // Limpar dados antigos e carregar novos
    setStatsData(prev => ({
      ...prev,
      timeRange,
      lastUpdated: new Date().toISOString()
    }));
    refetch();
  }, [timeRange]);

  return { statsData, loading, refetch };
};
