
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingSubmit } from './useOnboardingSubmit';

export const useOnboardingGuard = () => {
  const { user, profile, isLoading } = useAuth();
  const { checkOnboardingStatus } = useOnboardingSubmit();
  const [isOnboardingRequired, setIsOnboardingRequired] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Memoizar a função de verificação para evitar loops infinitos
  const checkOnboardingRequired = useCallback(async () => {
    // Aguardar auth estar carregado
    if (isLoading || !user || !profile) {
      return;
    }

    try {
      console.log('Verificando status do onboarding para usuário:', user.id);
      const onboardingData = await checkOnboardingStatus();
      
      // Se não tem dados de onboarding, é necessário completar
      const needsOnboarding = !onboardingData || !onboardingData.completed_at;
      console.log('Onboarding necessário:', needsOnboarding);
      
      setIsOnboardingRequired(needsOnboarding);
    } catch (error) {
      console.error('Erro ao verificar onboarding:', error);
      // Em caso de erro, assumir que não é necessário completar para não travar o fluxo
      setIsOnboardingRequired(false);
    } finally {
      setIsChecking(false);
    }
  }, [user, profile, isLoading, checkOnboardingStatus]);

  useEffect(() => {
    // Apenas executar se ainda estiver verificando ou se os dados mudaram
    if (isChecking && user && profile && !isLoading) {
      checkOnboardingRequired();
    } else if (!user || (!isLoading && !profile)) {
      setIsChecking(false);
      setIsOnboardingRequired(false);
    }
  }, [checkOnboardingRequired, isChecking, user, profile, isLoading]);

  const redirectToOnboarding = useCallback(() => {
    window.location.href = '/onboarding';
  }, []);

  return {
    isOnboardingRequired,
    isChecking,
    redirectToOnboarding
  };
};
