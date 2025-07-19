
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface ActivityData {
  // Dados do período
  totalLogins: number;
  newUsers: number;
  activeImplementations: number;
  completedSolutions: number;
  forumActivity: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  
  // Atividades estruturadas por período
  recentActivities: Array<{
    type: string;
    count: number;
    period: string;
  }>;
  
  // Identificadores para forçar re-render
  timeRange: string;
  lastUpdated: string;
}

export const useRealSystemActivity = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityData>({
    totalLogins: 0,
    newUsers: 0,
    activeImplementations: 0,
    completedSolutions: 0,
    systemHealth: 'healthy',
    recentActivities: [],
    forumActivity: 0,
    timeRange,
    lastUpdated: new Date().toISOString()
  });

  const refetch = async () => {
    try {
      setLoading(true);
      
      console.log(`🔄 [ACTIVITY] Carregando atividade para período: ${timeRange}`);
      
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
      
      console.log(`📅 [ACTIVITY] Período: ${daysBack} dias, desde: ${startDate.toISOString()}`);

      // === DADOS ESPECÍFICOS DO PERÍODO ===

      // Novos usuários no período
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Implementações ativas no período
      const { count: activeImplementations } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', false)
        .gte('last_activity', startDate.toISOString());

      // Soluções completadas no período
      const { count: completedSolutions } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .gte('completed_at', startDate.toISOString());

      // Atividade do fórum no período
      const { count: forumActivity } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Total de implementações (ativas + completadas) para calcular engajamento
      const totalImplementationsInPeriod = (activeImplementations || 0) + (completedSolutions || 0);

      // Eventos de login no período
      const { count: totalLogins } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'login')
        .gte('created_at', startDate.toISOString());

      // === CALCULAR SAÚDE DO SISTEMA ===
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if ((newUsers || 0) === 0 && (activeImplementations || 0) === 0) {
        systemHealth = 'critical';
      } else if ((newUsers || 0) < 2 || (totalImplementationsInPeriod || 0) < 3) {
        systemHealth = 'warning';
      }

      // === ESTRUTURAR ATIVIDADES RECENTES ===
      const periodLabel = daysBack === 7 ? '7 dias' :
                         daysBack === 30 ? '30 dias' :
                         daysBack === 90 ? '90 dias' :
                         daysBack === 365 ? '1 ano' : `${daysBack} dias`;

      const recentActivities = [
        {
          type: 'Novos usuários',
          count: newUsers || 0,
          period: `últimos ${periodLabel}`
        },
        {
          type: 'Implementações Ativas',
          count: activeImplementations || 0,
          period: `em andamento nos ${periodLabel}`
        },
        {
          type: 'Implementações Concluídas',
          count: completedSolutions || 0,
          period: `finalizadas nos ${periodLabel}`
        },
        {
          type: 'Atividade do Fórum',
          count: forumActivity || 0,
          period: `posts nos ${periodLabel}`
        }
      ].filter(activity => activity.count > 0);

      const finalActivityData: ActivityData = {
        totalLogins: totalLogins || 0,
        newUsers: newUsers || 0,
        activeImplementations: activeImplementations || 0,
        completedSolutions: completedSolutions || 0,
        systemHealth,
        recentActivities,
        forumActivity: forumActivity || 0,
        timeRange,
        lastUpdated: new Date().toISOString()
      };

      setActivityData(finalActivityData);
      
      console.log('✅ [ACTIVITY] Atividade carregada:', {
        periodo: periodLabel,
        newUsers: finalActivityData.newUsers,
        activeImplementations: finalActivityData.activeImplementations,
        completedSolutions: finalActivityData.completedSolutions,
        forumActivity: finalActivityData.forumActivity,
        systemHealth: finalActivityData.systemHealth,
        activitiesCount: finalActivityData.recentActivities.length,
        timeRange: finalActivityData.timeRange
      });

    } catch (error: any) {
      console.error("❌ [ACTIVITY] Erro ao carregar atividade:", error);
      toast({
        title: "Erro ao carregar atividade",
        description: "Ocorreu um erro ao carregar os dados de atividade do sistema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(`🔄 [ACTIVITY] TimeRange mudou para: ${timeRange}`);
    refetch();
  }, [timeRange]);

  return { activityData, loading, refetch };
};
