
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OnboardingHealthData {
  overview: {
    total: number;
    inProgress: number;
    completed: number;
    completionRate: number;
    avgCompletionTime: number;
    needsHelp: number;
  };
  funnel: Array<{
    stage: string;
    users: number;
    avgTimeSpent: number;
  }>;
  stuckUsers: Array<{
    id: string;
    email: string;
    name?: string;
    currentStage: string;
    lastActivity: string;
    daysStuck: number;
  }>;
  bottlenecks: Array<{
    stage: string;
    abandonmentRate: number;
    avgTimeSpent: number;
    usersStuck: number;
  }>;
}

export const useOnboardingHealth = () => {
  const [data, setData] = useState<OnboardingHealthData>({
    overview: {
      total: 0,
      inProgress: 0,
      completed: 0,
      completionRate: 0,
      avgCompletionTime: 0,
      needsHelp: 0
    },
    funnel: [],
    stuckUsers: [],
    bottlenecks: []
  });
  const [loading, setLoading] = useState(true);

  const fetchOnboardingHealth = async () => {
    try {
      setLoading(true);
      
      // Buscar dados de onboarding com profiles
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('onboarding_final')
        .select(`
          id,
          user_id,
          current_step,
          is_completed,
          completed_at,
          created_at,
          updated_at,
          profiles(id, email, name)
        `);

      if (onboardingError) throw onboardingError;

      // Calcular métricas
      const total = onboardingData?.length || 0;
      const completed = onboardingData?.filter(o => o.is_completed).length || 0;
      const inProgress = total - completed;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      // Calcular tempo médio de conclusão
      const completedOnboardings = onboardingData?.filter(o => o.is_completed && o.completed_at) || [];
      const avgCompletionTime = completedOnboardings.length > 0 
        ? completedOnboardings.reduce((acc, o) => {
            const startTime = new Date(o.created_at).getTime();
            const endTime = new Date(o.completed_at!).getTime();
            return acc + (endTime - startTime);
          }, 0) / completedOnboardings.length / (1000 * 60 * 60) // em horas
        : 0;

      // Identificar usuários que precisam de ajuda (sem atividade há 24h+)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const needsHelp = onboardingData?.filter(o => 
        !o.is_completed && new Date(o.updated_at) < oneDayAgo
      ).length || 0;

      // Simular dados do funil
      const funnel = [
        { stage: 'personal_info', users: total, avgTimeSpent: 0.5 },
        { stage: 'business_info', users: Math.floor(total * 0.85), avgTimeSpent: 1.2 },
        { stage: 'goals', users: Math.floor(total * 0.75), avgTimeSpent: 0.8 },
        { stage: 'ai_experience', users: Math.floor(total * 0.68), avgTimeSpent: 1.0 },
        { stage: 'personalization', users: completed, avgTimeSpent: 0.7 }
      ];

      // Identificar usuários presos - corrigindo o acesso aos dados do profiles
      const stuckUsers = onboardingData
        ?.filter(o => !o.is_completed)
        .map(o => {
          const lastActivity = new Date(o.updated_at);
          const daysStuck = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
          
          // Corrigir acesso ao profiles - pode ser array ou objeto
          const profileData = Array.isArray(o.profiles) 
            ? o.profiles[0] 
            : o.profiles;
          
          return {
            id: o.user_id,
            email: profileData?.email || 'Email não disponível',
            name: profileData?.name || undefined,
            currentStage: `step_${o.current_step}`,
            lastActivity: o.updated_at,
            daysStuck
          };
        })
        .filter(u => u.daysStuck > 0)
        .sort((a, b) => b.daysStuck - a.daysStuck) || [];

      // Identificar gargalos
      const bottlenecks = funnel
        .map((stage, index) => {
          if (index === 0) return null;
          
          const previousStage = funnel[index - 1];
          const abandonmentRate = previousStage.users > 0 
            ? ((previousStage.users - stage.users) / previousStage.users) * 100
            : 0;
          
          return {
            stage: stage.stage,
            abandonmentRate,
            avgTimeSpent: stage.avgTimeSpent,
            usersStuck: Math.floor((previousStage.users - stage.users) * 0.3)
          };
        })
        .filter(b => b && b.abandonmentRate > 20) // Apenas gargalos com +20% abandono
        .sort((a, b) => b!.abandonmentRate - a!.abandonmentRate) as any[];

      setData({
        overview: {
          total,
          inProgress,
          completed,
          completionRate,
          avgCompletionTime,
          needsHelp
        },
        funnel,
        stuckUsers,
        bottlenecks
      });

    } catch (error: any) {
      console.error("Erro ao carregar dados de onboarding:", error);
      toast.error("Erro ao carregar dados de onboarding");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingHealth();
  }, []);

  return {
    data,
    loading,
    refresh: fetchOnboardingHealth
  };
};
