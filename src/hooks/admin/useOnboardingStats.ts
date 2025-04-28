
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface OnboardingUserData {
  id: string;
  name: string | null;
  email: string | null;
  current_step: string;
  is_completed: boolean;
  started_at: string;
  last_activity: string;
  company_name?: string | null;
}

interface OnboardingStats {
  totalUsers: number;
  completedOnboarding: number;
  pendingUsers: number;
  completionRate: number;
  averageCompletionTime: number;
  usersByStep: Record<string, number>;
  users: OnboardingUserData[];
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
    usersByStep: {},
    users: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Buscar dados detalhados dos usuários com onboarding
        const { data: onboardingData, error: onboardingError } = await supabase
          .from('onboarding_progress')
          .select(`
            id,
            user_id,
            current_step,
            is_completed,
            created_at,
            updated_at,
            personal_info,
            professional_info,
            profiles:user_id (
              name,
              email,
              company_name
            )
          `);

        if (onboardingError) throw onboardingError;

        const formattedUsers: OnboardingUserData[] = onboardingData?.map((user: any) => ({
          id: user.user_id,
          name: user.profiles?.name || 'Usuário sem nome',
          email: user.profiles?.email || 'Email não definido',
          current_step: user.current_step || 'Não iniciado',
          is_completed: user.is_completed || false,
          started_at: user.created_at,
          last_activity: user.updated_at,
          company_name: user.professional_info?.company_name || user.profiles?.company_name
        })) || [];

        const totalUsers = formattedUsers.length;
        const completedOnboarding = formattedUsers.filter(user => user.is_completed).length;
        const pendingUsers = totalUsers - completedOnboarding;
        const completionRate = totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0;

        // Calcular distribuição de usuários por etapa
        const usersByStep = formattedUsers.reduce((acc: Record<string, number>, user) => {
          const currentStep = user.current_step;
          acc[currentStep] = (acc[currentStep] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalUsers,
          completedOnboarding,
          pendingUsers,
          completionRate,
          averageCompletionTime: 0,
          usersByStep,
          users: formattedUsers
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
