
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface ActivityData {
  totalLogins: number;
  newUsers: number;
  activeImplementations: number;
  completedSolutions: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivities: Array<{
    type: string;
    count: number;
    period: string;
  }>;
  forumActivity: number;
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
    forumActivity: 0
  });

  const refetch = async () => {
    try {
      setLoading(true);
      
      console.log(`🔄 Carregando atividade do sistema para período: ${timeRange}`);
      
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

      // 1. NOVOS USUÁRIOS NO PERÍODO
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // 2. IMPLEMENTAÇÕES ATIVAS (em progresso)
      const { count: activeImplementations } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', false)
        .gte('last_activity', startDate.toISOString());

      // 3. SOLUÇÕES COMPLETADAS NO PERÍODO
      const { count: completedSolutions } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .gte('completed_at', startDate.toISOString());

      // 4. ATIVIDADE DO FÓRUM NO PERÍODO
      const { count: forumActivity } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // 5. EVENTOS DE LOGIN (usando analytics se disponível)
      const { count: totalLogins } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'login')
        .gte('created_at', startDate.toISOString());

      // 6. CALCULAR SAÚDE DO SISTEMA
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (newUsers === 0 && activeImplementations === 0) {
        systemHealth = 'critical';
      } else if (newUsers && newUsers < 5) {
        systemHealth = 'warning';
      }

      // 7. ATIVIDADES RECENTES ESTRUTURADAS
      const recentActivities = [
        {
          type: 'Novos usuários',
          count: newUsers || 0,
          period: `últimos ${daysBack} dias`
        },
        {
          type: 'Implementações',
          count: (activeImplementations || 0) + (completedSolutions || 0),
          period: `últimos ${daysBack} dias`
        },
        {
          type: 'Usuários ativos',
          count: activeImplementations || 0,
          period: 'em implementação'
        }
      ];

      const finalActivityData: ActivityData = {
        totalLogins: totalLogins || 0,
        newUsers: newUsers || 0,
        activeImplementations: activeImplementations || 0,
        completedSolutions: completedSolutions || 0,
        systemHealth,
        recentActivities,
        forumActivity: forumActivity || 0
      };

      setActivityData(finalActivityData);
      
      console.log('✅ Atividade do sistema carregada:', {
        totalLogins: finalActivityData.totalLogins,
        newUsers: finalActivityData.newUsers,
        activeImplementations: finalActivityData.activeImplementations,
        completedSolutions: finalActivityData.completedSolutions,
        systemHealth: finalActivityData.systemHealth,
        period: timeRange,
        startDate: startDate.toISOString()
      });

    } catch (error: any) {
      console.error("❌ Erro ao carregar atividade do sistema:", error);
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
    refetch();
  }, [timeRange]);

  return { activityData, loading, refetch };
};
