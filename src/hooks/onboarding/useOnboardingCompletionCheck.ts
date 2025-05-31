
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useOnboardingCompletionCheck = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-completion-check', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          isCompleted: false,
          hasData: false,
          source: 'no_user'
        };
      }

      try {
        // Verificar primeiro na tabela onboarding_final
        const { data: finalData, error: finalError } = await supabase
          .from('onboarding_final')
          .select('status, completed_at')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .maybeSingle();

        if (finalData && !finalError) {
          console.log('✅ Onboarding final encontrado como completo:', finalData);
          return {
            isCompleted: true,
            hasData: true,
            source: 'onboarding_final',
            completedAt: finalData.completed_at
          };
        }

        // Verificar no perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData && !profileError) {
          console.log('✅ Dados do perfil encontrados:', profileData);
          return {
            isCompleted: profileData.onboarding_completed || false,
            hasData: true,
            source: 'profiles'
          };
        }

        // Se não encontrou dados em nenhuma tabela
        console.log('⚠️ Nenhum dado de onboarding encontrado');
        return {
          isCompleted: false,
          hasData: false,
          source: 'none'
        };
      } catch (error) {
        console.error('❌ Erro ao verificar conclusão do onboarding:', error);
        return {
          isCompleted: false,
          hasData: false,
          source: 'error',
          error
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos
    retry: 2,
    retryDelay: 1000
  });
};
