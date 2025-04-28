
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
        console.log("Iniciando busca de dados de onboarding...");

        // Buscar dados direto da view onboarding_analytics que já contém os relacionamentos
        const { data: onboardingData, error } = await supabase
          .from('onboarding_analytics')
          .select('*');

        if (error) {
          console.error('Erro ao buscar dados de onboarding:', error);
          throw error;
        }

        console.log("Dados de onboarding recebidos:", onboardingData);

        // Se não houver dados, inicializar com array vazio
        const formattedUsers: OnboardingUserData[] = onboardingData ? onboardingData.map((user: any) => ({
          id: user.user_id,
          name: user.email?.split('@')[0] || 'Usuário sem nome', // Usar parte do email como nome se não tiver nome
          email: user.email || 'Email não definido',
          current_step: user.current_step || 'Não iniciado',
          is_completed: user.is_completed || false,
          started_at: user.started_at,
          last_activity: user.last_activity,
          company_name: user.company_name || 
                       (user.personal_info && typeof user.personal_info === 'object' ? 
                         user.personal_info.company_name : null)
        })) : [];

        const totalUsers = formattedUsers.length;
        const completedOnboarding = formattedUsers.filter(user => user.is_completed).length;
        const pendingUsers = totalUsers - completedOnboarding;
        const completionRate = totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0;

        // Calcular distribuição de usuários por etapa
        const usersByStep: Record<string, number> = {};
        formattedUsers.forEach(user => {
          const step = user.current_step;
          usersByStep[step] = (usersByStep[step] || 0) + 1;
        });

        setStats({
          totalUsers,
          completedOnboarding,
          pendingUsers,
          completionRate,
          averageCompletionTime: 0, // Podemos implementar este cálculo no futuro
          usersByStep,
          users: formattedUsers
        });

        console.log("Dados processados com sucesso:", {
          totalUsers,
          completedOnboarding,
          pendingUsers,
          usersByStep
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
