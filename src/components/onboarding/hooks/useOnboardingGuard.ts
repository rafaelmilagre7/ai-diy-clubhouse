
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingSubmit } from './useOnboardingSubmit';

export const useOnboardingGuard = () => {
  const { user, profile, isLoading } = useAuth();
  const { checkOnboardingStatus } = useOnboardingSubmit();
  const [isOnboardingRequired, setIsOnboardingRequired] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Memoizar IDs estáveis
  const userId = useMemo(() => user?.id, [user?.id]);
  const hasProfile = useMemo(() => !!profile, [profile]);

  // Memoizar a função de verificação com dependências estáveis
  const checkOnboardingRequired = useCallback(async () => {
    // Aguardar auth estar carregado
    if (isLoading || !userId || !hasProfile) {
      return;
    }

    try {
      console.log('Verificando status do onboarding para usuário:', userId);
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
  }, [userId, hasProfile, isLoading, checkOnboardingStatus]);

  useEffect(() => {
    // Apenas executar se ainda estiver verificando e tiver os dados necessários
    if (isChecking && userId && hasProfile && !isLoading) {
      checkOnboardingRequired();
    } else if (!userId || (!isLoading && !hasProfile)) {
      setIsChecking(false);
      setIsOnboardingRequired(false);
    }
  }, [checkOnboardingRequired, isChecking, userId, hasProfile, isLoading]);

  const redirectToOnboarding = useCallback(() => {
    window.location.href = '/onboarding';
  }, []);

  return useMemo(() => ({
    isOnboardingRequired,
    isChecking,
    redirectToOnboarding
  }), [isOnboardingRequired, isChecking, redirectToOnboarding]);
};
