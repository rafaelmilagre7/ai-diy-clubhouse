
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useSimpleOnboardingValidation = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['simple-onboarding-validation', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('🔍 useSimpleOnboardingValidation: Nenhum usuário encontrado');
        return {
          isOnboardingComplete: false,
          hasValidData: false,
          source: 'no_user'
        };
      }

      try {
        console.log('🔍 useSimpleOnboardingValidation: Verificando onboarding para usuário:', user.id);
        
        // Verificar primeiro na tabela onboarding_final
        const { data: finalData, error: finalError } = await supabase
          .from('onboarding_final')
          .select('is_completed, completed_at')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .maybeSingle();

        if (finalData && !finalError) {
          console.log('✅ useSimpleOnboardingValidation: Onboarding final encontrado como completo');
          return {
            isOnboardingComplete: true,
            hasValidData: true,
            source: 'onboarding_final'
          };
        }

        console.log('🔍 useSimpleOnboardingValidation: Verificando na tabela profiles...');
        
        // Verificar no perfil se tem onboarding_completed
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData && !profileError) {
          const isCompleted = profileData.onboarding_completed || false;
          console.log('🔍 useSimpleOnboardingValidation: onboarding_completed no perfil:', isCompleted);
          
          return {
            isOnboardingComplete: isCompleted,
            hasValidData: true,
            source: 'profiles'
          };
        }

        console.log('⚠️ useSimpleOnboardingValidation: Nenhum dado de onboarding encontrado');
        return {
          isOnboardingComplete: false,
          hasValidData: false,
          source: 'none'
        };
      } catch (error) {
        console.error('❌ useSimpleOnboardingValidation: Erro ao verificar onboarding:', error);
        return {
          isOnboardingComplete: false,
          hasValidData: false,
          source: 'error',
          error
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos
    retry: 2
  });

  return {
    isOnboardingComplete: data?.isOnboardingComplete || false,
    hasValidData: data?.hasValidData || false,
    source: data?.source,
    isLoading,
    error
  };
};
