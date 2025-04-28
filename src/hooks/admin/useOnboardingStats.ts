
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStats {
  totalUsers: number;
  completedOnboarding: number;
  pendingUsers: number;
  completionRate: number;
  averageCompletionTime: number;
  usersByStep: Record<string, number>;
}

export const useOnboardingStats = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OnboardingStats>({
    totalUsers: 0,
    completedOnboarding: 0,
    pendingUsers: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    usersByStep: {}
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Buscar estatísticas gerais de onboarding
        const { data: onboardingData, error: onboardingError } = await supabase
          .from('onboarding_progress')
          .select('*');

        if (onboardingError) throw onboardingError;

        const totalUsers = onboardingData?.length || 0;
        const completedOnboarding = onboardingData?.filter(user => user.is_completed)?.length || 0;
        const pendingUsers = totalUsers - completedOnboarding;
        const completionRate = totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0;

        // Calcular distribuição de usuários por etapa
        const usersByStep = onboardingData?.reduce((acc: Record<string, number>, user) => {
          const currentStep = user.current_step;
          acc[currentStep] = (acc[currentStep] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalUsers,
          completedOnboarding,
          pendingUsers,
          completionRate,
          averageCompletionTime: 0, // Será implementado quando tivermos timestamps
          usersByStep: usersByStep || {}
        });

      } catch (error: any) {
        console.error('Erro ao buscar estatísticas:', error.message);
        toast({
          title: "Erro ao carregar estatísticas",
          description: "Não foi possível carregar os dados do onboarding.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return { stats, loading };
};
