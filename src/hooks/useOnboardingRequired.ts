
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';

export const useOnboardingRequired = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRequired, setIsRequired] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  // Ref para evitar loops infinitos
  const lastCheckRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Debounce para evitar verificações excessivas
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const checkOnboardingRequirement = () => {
        if (authLoading || !user) {
          setIsLoading(true);
          return;
        }

        // Criar chave única para evitar re-verificações desnecessárias
        const checkKey = `${user.id}-${profile?.onboarding_completed}`;
        if (lastCheckRef.current === checkKey) {
          return; // Já verificamos este estado
        }

        try {
          console.log('[ONBOARDING-REQUIRED] Verificação única para:', user.id);
          
          const onboardingCompleted = profile?.onboarding_completed === true;
          
          console.log('[ONBOARDING-REQUIRED] Resultado:', {
            userId: user.id,
            onboardingCompleted,
            userRole: getUserRoleName(profile)
          });

          // Atualizar estados apenas se mudou
          if (onboardingCompleted) {
            setIsRequired(false);
            setHasCompleted(true);
          } else {
            setIsRequired(true);
            setHasCompleted(false);
          }
          
          // Marcar como verificado
          lastCheckRef.current = checkKey;
          
        } catch (error) {
          console.error('[ONBOARDING-REQUIRED] Erro:', error);
          // Segurança: assumir que precisa de onboarding
          setIsRequired(true);
          setHasCompleted(false);
        } finally {
          setIsLoading(false);
        }
      };

      checkOnboardingRequirement();
    }, 300); // Debounce de 300ms

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [user?.id, profile?.onboarding_completed, authLoading]);

  return {
    isRequired,
    hasCompleted,
    isLoading
  };
};
