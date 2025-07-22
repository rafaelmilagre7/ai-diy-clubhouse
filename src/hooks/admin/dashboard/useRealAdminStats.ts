
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
    lastUpdated: new Date().toISOString()
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

      // Segmentação de usuários por role
      const { data: userSegmentation } = await supabase
        .from('user_segmentation_analytics')
        .select('*')
        .order('user_count', { ascending: false });

      // === DADOS ESPECÍFICOS DO PERÍODO ===

      // Novos usuários no período
      const { count: newUsersInPeriod } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Implementações ativas no período
      const { count: activeImplementationsInPeriod } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', false)
        .gte('last_activity', startDate.toISOString());

      // Novas implementações iniciadas no período
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

      // Usuários ativos no período (que fizeram alguma atividade)
      const { data: activeUsersData } = await supabase
        .from('analytics')
        .select('user_id')
        .gte('created_at', startDate.toISOString())
        .not('user_id', 'is', null);

      const activeUsersInPeriod = new Set(activeUsersData?.map(a => a.user_id) || []).size;

      // === CALCULAR MÉTRICAS ===
      
      // Taxa de crescimento do período
      const periodGrowthRate = totalUsers && totalUsers > 0 ? 
        Math.round(((newUsersInPeriod || 0) / totalUsers) * 100) : 0;

      // Taxa de engajamento do período
      const periodEngagementRate = totalUsers && totalUsers > 0 ? 
        Math.round((activeUsersInPeriod / totalUsers) * 100) : 0;

      // Taxa de conclusão do período
      const totalImplementationsInPeriod = (implementationsInPeriod || 0);
      const periodCompletionRate = totalImplementationsInPeriod > 0 ? 
        ((completedInPeriod || 0) / totalImplementationsInPeriod) * 100 : 0;

      // Processar roles
      const usersByRole = (userSegmentation || []).map(item => ({
        role: item.role_name === 'member' ? 'Membros Club' : 
              item.role_name === 'admin' ? 'Administradores' :
              item.role_name === 'formacao' ? 'Formação' : 
              item.role_name || 'Outros',
        count: item.user_count || 0
      }));

      const finalStats: StatsData = {
        // Dados cumulativos
        totalUsers: totalUsers || 0,
        totalSolutions: totalSolutions || 0,
        totalLearningLessons: totalLearningLessons || 0,
        completedImplementations: completedImplementations || 0,
        averageImplementationTime: 240, // 4 horas em minutos
        usersByRole,
        
        // Dados específicos do período
        newUsersInPeriod: newUsersInPeriod || 0,
        activeUsersInPeriod: activeUsersInPeriod || 0,
        implementationsInPeriod: implementationsInPeriod || 0,
        completedInPeriod: completedInPeriod || 0,
        
        // Métricas calculadas
        periodGrowthRate,
        periodEngagementRate,
        periodCompletionRate,
        
        // Identificadores para forçar re-render
        timeRange,
        lastUpdated: new Date().toISOString()
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
        timeRange: finalStats.timeRange
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

  useEffect(() => {
    console.log(`🔄 [STATS] TimeRange mudou para: ${timeRange}`);
    // Forçar atualização dos dados quando o período mudar
    setStatsData(prev => ({ ...prev, timeRange, lastUpdated: new Date().toISOString() }));
    refetch();
  }, [timeRange]);

  return { statsData, loading, refetch };
};
