
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserHealthData {
  overview: {
    totalUsers: number;
    healthyUsers: number;
    atRiskUsers: number;
    criticalUsers: number;
    avgHealthScore: number;
    improvementRate: number;
  };
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedUsers: number;
    description: string;
  }>;
  recentAlerts: Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    alertType: string;
    severity: string;
    title: string;
    description: string;
    triggeredAt: string;
    status: string;
  }>;
  healthTrends: {
    period: string;
    averageScore: number;
    totalUsers: number;
    improvements: number;
    deteriorations: number;
  }[];
  interventionSuggestions: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    estimatedImpact: number;
    affectedUsers: number;
  }>;
}

export const useUserHealthDashboard = () => {
  const [data, setData] = useState<UserHealthData>({
    overview: {
      totalUsers: 0,
      healthyUsers: 0,
      atRiskUsers: 0,
      criticalUsers: 0,
      avgHealthScore: 0,
      improvementRate: 0
    },
    riskFactors: [],
    recentAlerts: [],
    healthTrends: [],
    interventionSuggestions: []
  });
  const [loading, setLoading] = useState(true);

  const fetchUserHealthData = async () => {
    try {
      setLoading(true);

      // Buscar métricas de saúde dos usuários
      const { data: healthMetrics, error: healthError } = await supabase
        .from('user_health_metrics')
        .select(`
          *,
          profiles(id, name, email)
        `);

      if (healthError) throw healthError;

      // Buscar alertas recentes
      const { data: alerts, error: alertsError } = await supabase
        .from('user_health_alerts')
        .select(`
          *,
          profiles(name, email)
        `)
        .eq('status', 'active')
        .order('triggered_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;

      // Buscar dados de onboarding para análise complementar
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('onboarding_final')
        .select('user_id, is_completed, current_step, updated_at');

      if (onboardingError) throw onboardingError;

      // Calcular overview
      const totalUsers = healthMetrics?.length || 0;
      const avgHealthScore = totalUsers > 0 
        ? healthMetrics.reduce((sum, metric) => sum + (metric.health_score || 0), 0) / totalUsers
        : 0;

      const healthyUsers = healthMetrics?.filter(m => (m.health_score || 0) >= 0.7).length || 0;
      const atRiskUsers = healthMetrics?.filter(m => {
        const score = m.health_score || 0;
        return score >= 0.4 && score < 0.7;
      }).length || 0;
      const criticalUsers = healthMetrics?.filter(m => (m.health_score || 0) < 0.4).length || 0;

      // Processar alertas recentes
      const recentAlerts = alerts?.map(alert => {
        const profileData = Array.isArray(alert.profiles) 
          ? alert.profiles[0] 
          : alert.profiles;
        
        return {
          id: alert.id,
          userId: alert.user_id,
          userName: profileData?.name || 'Nome não disponível',
          userEmail: profileData?.email || 'Email não disponível',
          alertType: alert.alert_type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          triggeredAt: alert.triggered_at,
          status: alert.status
        };
      }) || [];

      // Analisar fatores de risco
      const riskFactors = [
        {
          factor: 'Onboarding incompleto',
          severity: 'high' as const,
          affectedUsers: onboardingData?.filter(o => !o.is_completed).length || 0,
          description: 'Usuários que não completaram o onboarding'
        },
        {
          factor: 'Baixa atividade',
          severity: 'medium' as const,
          affectedUsers: healthMetrics?.filter(m => m.engagement_level === 'low').length || 0,
          description: 'Usuários com pouca atividade na plataforma'
        },
        {
          factor: 'Score de saúde crítico',
          severity: 'critical' as const,
          affectedUsers: criticalUsers,
          description: 'Usuários com score de saúde muito baixo'
        },
        {
          factor: 'Sem atividade recente',
          severity: 'medium' as const,
          affectedUsers: healthMetrics?.filter(m => {
            const lastActivity = new Date(m.last_activity || 0);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return lastActivity < weekAgo;
          }).length || 0,
          description: 'Usuários sem atividade na última semana'
        }
      ];

      // Sugestões de intervenção baseadas nos dados
      const interventionSuggestions = [
        {
          type: 'onboarding_assistance',
          priority: 'high' as const,
          title: 'Assistência no Onboarding',
          description: 'Oferecer suporte personalizado para usuários presos no onboarding',
          estimatedImpact: 85,
          affectedUsers: onboardingData?.filter(o => !o.is_completed && o.current_step > 1).length || 0
        },
        {
          type: 'engagement_campaign',
          priority: 'medium' as const,
          title: 'Campanha de Reengajamento',
          description: 'Enviar conteúdo personalizado para usuários com baixa atividade',
          estimatedImpact: 60,
          affectedUsers: healthMetrics?.filter(m => m.engagement_level === 'low').length || 0
        },
        {
          type: 'proactive_support',
          priority: 'high' as const,
          title: 'Suporte Proativo',
          description: 'Contato direto com usuários críticos',
          estimatedImpact: 90,
          affectedUsers: criticalUsers
        }
      ];

      // Tendências de saúde (simulação baseada nos dados atuais)
      const healthTrends = [
        {
          period: 'Última semana',
          averageScore: avgHealthScore,
          totalUsers,
          improvements: Math.floor(totalUsers * 0.15),
          deteriorations: Math.floor(totalUsers * 0.08)
        },
        {
          period: 'Últimas 2 semanas',
          averageScore: avgHealthScore - 0.05,
          totalUsers: Math.floor(totalUsers * 0.95),
          improvements: Math.floor(totalUsers * 0.12),
          deteriorations: Math.floor(totalUsers * 0.10)
        },
        {
          period: 'Último mês',
          averageScore: avgHealthScore - 0.1,
          totalUsers: Math.floor(totalUsers * 0.85),
          improvements: Math.floor(totalUsers * 0.20),
          deteriorations: Math.floor(totalUsers * 0.15)
        }
      ];

      setData({
        overview: {
          totalUsers,
          healthyUsers,
          atRiskUsers,
          criticalUsers,
          avgHealthScore,
          improvementRate: totalUsers > 0 ? (healthyUsers / totalUsers) * 100 : 0
        },
        riskFactors: riskFactors.filter(rf => rf.affectedUsers > 0),
        recentAlerts,
        healthTrends,
        interventionSuggestions: interventionSuggestions.filter(is => is.affectedUsers > 0)
      });

    } catch (error: any) {
      console.error("Erro ao carregar dados de saúde dos usuários:", error);
      toast.error("Erro ao carregar dados de saúde dos usuários");
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('user_health_alerts')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) throw error;

      toast.success("Alerta resolvido com sucesso!");
      await fetchUserHealthData();
    } catch (error: any) {
      console.error("Erro ao resolver alerta:", error);
      toast.error("Erro ao resolver alerta");
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('user_health_alerts')
        .update({ status: 'dismissed' })
        .eq('id', alertId);

      if (error) throw error;

      toast.success("Alerta dispensado!");
      await fetchUserHealthData();
    } catch (error: any) {
      console.error("Erro ao dispensar alerta:", error);
      toast.error("Erro ao dispensar alerta");
    }
  };

  const triggerHealthCalculation = async () => {
    try {
      // Executar função para recalcular saúde de todos os usuários
      const { data: users } = await supabase
        .from('profiles')
        .select('id');

      if (users) {
        for (const user of users) {
          // Calcular score de saúde
          const { data: score } = await supabase
            .rpc('calculate_user_health_score', { p_user_id: user.id });

          // Atualizar ou inserir métricas de saúde
          await supabase
            .from('user_health_metrics')
            .upsert({
              user_id: user.id,
              health_score: score || 0,
              calculated_at: new Date().toISOString()
            });
        }
      }

      // Executar detecção de usuários em risco
      await supabase.rpc('detect_at_risk_users');

      toast.success("Cálculo de saúde executado com sucesso!");
      await fetchUserHealthData();
    } catch (error: any) {
      console.error("Erro ao calcular saúde dos usuários:", error);
      toast.error("Erro ao calcular saúde dos usuários");
    }
  };

  useEffect(() => {
    fetchUserHealthData();
  }, []);

  return {
    data,
    loading,
    refresh: fetchUserHealthData,
    resolveAlert,
    dismissAlert,
    triggerHealthCalculation
  };
};
