
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useOnboardingCompletionCheck = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-completion-check', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('🔍 useOnboardingCompletionCheck: Nenhum usuário encontrado');
        return {
          isCompleted: false,
          hasData: false,
          source: 'no_user'
        };
      }

      try {
        console.log('🔍 useOnboardingCompletionCheck: Verificando onboarding para usuário:', user.id);
        
        // Verificar primeiro na tabela onboarding_final
        const { data: finalData, error: finalError } = await supabase
          .from('onboarding_final')
          .select('is_completed, completed_at, id')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .maybeSingle();

        if (finalData && !finalError) {
          console.log('✅ useOnboardingCompletionCheck: Onboarding final encontrado como completo:', finalData);
          return {
            isCompleted: true,
            hasData: true,
            source: 'onboarding_final',
            completedAt: finalData.completed_at,
            onboardingId: finalData.id
          };
        }

        console.log('🔍 useOnboardingCompletionCheck: Verificando na tabela profiles...');
        
        // Verificar no perfil do usuário se existe campo onboarding_completed
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData && !profileError) {
          console.log('✅ useOnboardingCompletionCheck: Dados do perfil encontrados:', profileData);
          // Verificar se o campo onboarding_completed existe
          const hasOnboardingCompleted = 'onboarding_completed' in profileData;
          const isCompleted = hasOnboardingCompleted ? (profileData.onboarding_completed || false) : false;
          
          console.log('🔍 useOnboardingCompletionCheck: onboarding_completed no perfil:', isCompleted);
          
          return {
            isCompleted,
            hasData: true,
            source: 'profiles'
          };
        }

        // Se não encontrou dados em nenhuma tabela
        console.log('⚠️ useOnboardingCompletionCheck: Nenhum dado de onboarding encontrado');
        return {
          isCompleted: false,
          hasData: false,
          source: 'none'
        };
      } catch (error) {
        console.error('❌ useOnboardingCompletionCheck: Erro ao verificar conclusão do onboarding:', error);
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
