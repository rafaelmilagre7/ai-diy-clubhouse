
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
    abandonmentRate: number;
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
  timeAnalysis: {
    avgTimePerStep: Record<string, number>;
    completionTrends: Array<{
      date: string;
      completions: number;
      starts: number;
    }>;
  };
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
    bottlenecks: [],
    timeAnalysis: {
      avgTimePerStep: {},
      completionTrends: []
    }
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
          time_per_step,
          profiles(id, email, name)
        `);

      if (onboardingError) throw onboardingError;

      // Buscar dados detalhados de tracking
      const { data: stepTracking, error: trackingError } = await supabase
        .from('onboarding_step_tracking')
        .select('*');

      if (trackingError) throw trackingError;

      // Buscar pontos de abandono
      const { data: abandonmentPoints, error: abandonmentError } = await supabase
        .from('onboarding_abandonment_points')
        .select('*');

      if (abandonmentError) throw abandonmentError;

      // Calcular métricas básicas
      const total = onboardingData?.length || 0;
      const completed = onboardingData?.filter(o => o.is_completed).length || 0;
      const inProgress = total - completed;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      // Calcular tempo médio de conclusão usando dados reais
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

      // Analisar funil baseado em dados reais de step tracking
      const stepStats = new Map();
      const maxSteps = 5; // Assumindo 5 etapas no onboarding

      // Inicializar stats para todos os passos
      for (let step = 1; step <= maxSteps; step++) {
        stepStats.set(step, {
          users: 0,
          completed: 0,
          totalTime: 0,
          timeCount: 0,
          abandoned: 0
        });
      }

      // Processar dados de onboarding
      onboardingData?.forEach(onboarding => {
        const currentStep = onboarding.current_step;
        
        // Contar usuários que chegaram até cada etapa
        for (let step = 1; step <= currentStep; step++) {
          const stats = stepStats.get(step);
          stats.users++;
          
          if (step < currentStep || onboarding.is_completed) {
            stats.completed++;
          }
        }

        // Calcular tempo por etapa se disponível
        if (onboarding.time_per_step) {
          Object.entries(onboarding.time_per_step).forEach(([step, time]) => {
            const stepNum = parseInt(step);
            const stats = stepStats.get(stepNum);
            if (stats && typeof time === 'number') {
              stats.totalTime += time;
              stats.timeCount++;
            }
          });
        }
      });

      // Processar pontos de abandono
      abandonmentPoints?.forEach(point => {
        const stats = stepStats.get(point.step_number);
        if (stats) {
          stats.abandoned++;
        }
      });

      // Criar dados do funil
      const funnel = Array.from(stepStats.entries()).map(([step, stats]) => {
        const stageName = getStepName(step);
        const avgTimeSpent = stats.timeCount > 0 ? stats.totalTime / stats.timeCount / 60 : 0; // em minutos
        const abandonmentRate = stats.users > 0 ? (stats.abandoned / stats.users) * 100 : 0;
        
        return {
          stage: stageName,
          users: stats.users,
          avgTimeSpent,
          abandonmentRate
        };
      });

      // Identificar usuários presos
      const stuckUsers = onboardingData
        ?.filter(o => !o.is_completed)
        .map(o => {
          const lastActivity = new Date(o.updated_at);
          const daysStuck = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
          
          const profileData = Array.isArray(o.profiles) 
            ? o.profiles[0] 
            : o.profiles;
          
          return {
            id: o.user_id,
            email: profileData?.email || 'Email não disponível',
            name: profileData?.name || undefined,
            currentStage: getStepName(o.current_step),
            lastActivity: o.updated_at,
            daysStuck
          };
        })
        .filter(u => u.daysStuck > 0)
        .sort((a, b) => b.daysStuck - a.daysStuck) || [];

      // Identificar gargalos (etapas com alta taxa de abandono)
      const bottlenecks = funnel
        .filter(stage => stage.abandonmentRate > 15) // Mais de 15% de abandono
        .sort((a, b) => b.abandonmentRate - a.abandonmentRate)
        .map(stage => ({
          stage: stage.stage,
          abandonmentRate: stage.abandonmentRate,
          avgTimeSpent: stage.avgTimeSpent,
          usersStuck: Math.floor(stage.users * (stage.abandonmentRate / 100))
        }));

      // Análise temporal
      const avgTimePerStep: Record<string, number> = {};
      stepStats.forEach((stats, step) => {
        const stageName = getStepName(step);
        avgTimePerStep[stageName] = stats.timeCount > 0 ? stats.totalTime / stats.timeCount / 60 : 0;
      });

      // Tendências de conclusão (últimos 7 dias)
      const completionTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayCompletions = onboardingData?.filter(o => 
          o.completed_at && o.completed_at.startsWith(dateStr)
        ).length || 0;
        
        const dayStarts = onboardingData?.filter(o => 
          o.created_at.startsWith(dateStr)
        ).length || 0;
        
        completionTrends.push({
          date: dateStr,
          completions: dayCompletions,
          starts: dayStarts
        });
      }

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
        bottlenecks,
        timeAnalysis: {
          avgTimePerStep,
          completionTrends
        }
      });

    } catch (error: any) {
      console.error("Erro ao carregar dados de onboarding:", error);
      toast.error("Erro ao carregar dados de onboarding");
    } finally {
      setLoading(false);
    }
  };

  const getStepName = (step: number): string => {
    const stepNames = {
      1: 'Informações Pessoais',
      2: 'Informações Comerciais',
      3: 'Objetivos',
      4: 'Experiência com IA',
      5: 'Personalização'
    };
    return stepNames[step as keyof typeof stepNames] || `Etapa ${step}`;
  };

  const triggerIntervention = async (userId: string, interventionType: string) => {
    try {
      const { error } = await supabase
        .from('automated_interventions')
        .insert([{
          user_id: userId,
          intervention_type: interventionType,
          trigger_condition: 'manual_trigger',
          action_taken: `Intervenção manual: ${interventionType}`,
          status: 'pending',
          metadata: {
            triggered_by: 'admin',
            timestamp: new Date().toISOString()
          }
        }]);

      if (error) throw error;

      toast.success("Intervenção agendada com sucesso!");
      await fetchOnboardingHealth();
    } catch (error: any) {
      console.error("Erro ao agendar intervenção:", error);
      toast.error("Erro ao agendar intervenção");
    }
  };

  useEffect(() => {
    fetchOnboardingHealth();
  }, []);

  return {
    data,
    loading,
    refresh: fetchOnboardingHealth,
    triggerIntervention
  };
};
