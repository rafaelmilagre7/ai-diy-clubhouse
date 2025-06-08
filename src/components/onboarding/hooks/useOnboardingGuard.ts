
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingSubmit } from './useOnboardingSubmit';

export const useOnboardingGuard = () => {
  const { user, profile, isLoading } = useAuth();
  const { checkOnboardingStatus } = useOnboardingSubmit();
  const [isOnboardingRequired, setIsOnboardingRequired] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingRequired = async () => {
      // Aguardar auth estar carregado
      if (isLoading || !user || !profile) {
        return;
      }

      try {
        const onboardingData = await checkOnboardingStatus();
        
        // Se não tem dados de onboarding, é necessário completar
        setIsOnboardingRequired(!onboardingData);
      } catch (error) {
        console.error('Erro ao verificar onboarding:', error);
        // Em caso de erro, assumir que é necessário completar
        setIsOnboardingRequired(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboardingRequired();
  }, [user, profile, isLoading, checkOnboardingStatus]);

  const redirectToOnboarding = () => {
    window.location.href = '/onboarding';
  };

  return {
    isOnboardingRequired,
    isChecking,
    redirectToOnboarding
  };
};
