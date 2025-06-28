
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnboardingHealthMetrics {
  totalUsers: number;
  completedOnboarding: number;
  abandonedOnboarding: number;
  completionRate: number;
  averageCompletionTime: number;
  mostCommonAbandonmentStep: string;
  stepCompletionRates: Array<{
    step: number;
    completionRate: number;
  }>;
  recentCompletions: Array<{
    userId: string;
    completedAt: string;
    timeToComplete: number;
  }>;
}

export const useOnboardingHealth = () => {
  const [metrics, setMetrics] = useState<OnboardingHealthMetrics>({
    totalUsers: 0,
    completedOnboarding: 0,
    abandonedOnboarding: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    mostCommonAbandonmentStep: 'N/A',
    stepCompletionRates: [],
    recentCompletions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnboardingHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get basic user onboarding statistics from profiles table
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, onboarding_completed, onboarding_completed_at, created_at');

      if (usersError) throw usersError;

      const totalUsers = users?.length || 0;
      const completedUsers = users?.filter(u => u.onboarding_completed) || [];
      const completedOnboarding = completedUsers.length;
      const abandonedOnboarding = totalUsers - completedOnboarding;
      const completionRate = totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0;

      // Calculate average completion time for users who completed
      const completionTimes = completedUsers
        .filter(u => u.onboarding_completed_at && u.created_at)
        .map(u => {
          const created = new Date(u.created_at).getTime();
          const completed = new Date(u.onboarding_completed_at).getTime();
          return completed - created;
        });

      const averageCompletionTime = completionTimes.length > 0 
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length / (1000 * 60 * 60) // hours
        : 0;

      // Simulate step completion rates (since we don't have step tracking)
      const stepCompletionRates = [
        { step: 1, completionRate: 95 },
        { step: 2, completionRate: 87 },
        { step: 3, completionRate: 78 },
        { step: 4, completionRate: 69 },
        { step: 5, completionRate: completionRate }
      ];

      // Recent completions from completed users
      const recentCompletions = completedUsers
        .filter(u => u.onboarding_completed_at)
        .sort((a, b) => new Date(b.onboarding_completed_at).getTime() - new Date(a.onboarding_completed_at).getTime())
        .slice(0, 10)
        .map(u => ({
          userId: u.id,
          completedAt: u.onboarding_completed_at,
          timeToComplete: u.created_at ? 
            (new Date(u.onboarding_completed_at).getTime() - new Date(u.created_at).getTime()) / (1000 * 60 * 60) 
            : 0
        }));

      setMetrics({
        totalUsers,
        completedOnboarding,
        abandonedOnboarding,
        completionRate,
        averageCompletionTime,
        mostCommonAbandonmentStep: 'Passo 3 (Informações Profissionais)', // Simulated
        stepCompletionRates,
        recentCompletions
      });

    } catch (error: any) {
      console.error('Erro ao carregar métricas de onboarding:', error);
      setError(error.message);
      toast.error('Erro ao carregar dados de saúde do onboarding');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingHealth();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchOnboardingHealth
  };
};
