
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';

export const useOnboardingRequired = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRequired, setIsRequired] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkOnboardingRequirement = async () => {
      if (authLoading) {
        setIsLoading(true);
        return;
      }

      if (!user) {
        console.log('[ONBOARDING-REQUIRED] Sem usuário - onboarding não aplicável');
        setIsLoading(false);
        setIsRequired(false);
        setHasCompleted(false);
        return;
      }

      try {
        console.log('[ONBOARDING-REQUIRED] Verificando necessidade de onboarding para:', user.id);
        
        // Verificar se onboarding foi completado
        const onboardingCompleted = profile?.onboarding_completed === true;
        
        console.log('[ONBOARDING-REQUIRED] Status do onboarding:', {
          userId: user.id,
          email: user.email,
          profileExists: !!profile,
          profileOnboardingCompleted: profile?.onboarding_completed,
          onboardingCompleted,
          userRole: getUserRoleName ? getUserRoleName(profile) : 'N/A'
        });

        // Se onboarding foi completado, não é necessário
        if (onboardingCompleted) {
          console.log('[ONBOARDING-REQUIRED] Onboarding não necessário - já completado');
          setIsRequired(false);
          setHasCompleted(true);
          setError('');
        } else {
          console.log('[ONBOARDING-REQUIRED] Onboarding OBRIGATÓRIO - não completado');
          setIsRequired(true);
          setHasCompleted(false);
          setError('');
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao verificar onboarding';
        console.error('[ONBOARDING-REQUIRED] Erro ao verificar necessidade de onboarding:', err);
        setError(errorMessage);
        
        // SEGURANÇA: Em caso de erro, assumir que precisa fazer onboarding
        // A menos que o perfil claramente indique que foi completado
        if (profile?.onboarding_completed === true) {
          setIsRequired(false);
          setHasCompleted(true);
        } else {
          setIsRequired(true);
          setHasCompleted(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingRequirement();
  }, [user, profile, authLoading]);

  console.log('[ONBOARDING-REQUIRED] Estado final:', {
    isLoading,
    isRequired,
    hasCompleted,
    error: !!error,
    userId: user?.id,
    profileOnboardingCompleted: profile?.onboarding_completed
  });

  return {
    isRequired,
    hasCompleted,
    isLoading,
    error
  };
};
