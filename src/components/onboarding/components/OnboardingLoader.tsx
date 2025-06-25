
import React, { useEffect, useState } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useOnboardingRequired } from '@/hooks/useOnboardingRequired';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { logger } from '@/utils/logger';

interface OnboardingLoaderProps {
  children: React.ReactNode;
}

export const OnboardingLoader: React.FC<OnboardingLoaderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, isAdmin } = useSimpleAuth();
  const { isRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const [forceShowContent, setForceShowContent] = useState(false);

  // TIMEOUT SIMPLES: máximo 1 segundo de loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      logger.warn('[ONBOARDING-LOADER] Timeout de 1s - forçando exibição do conteúdo');
      setForceShowContent(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // BYPASS IMEDIATO PARA ADMIN
  useEffect(() => {
    if (!authLoading && user && profile && isAdmin) {
      logger.info('[ONBOARDING-LOADER] Admin detectado - redirecionando para /admin');
      navigate('/admin', { replace: true });
      return;
    }
  }, [user, profile, isAdmin, authLoading, navigate]);

  const totalLoading = authLoading || onboardingLoading;
  const shouldShowLoading = totalLoading && !forceShowContent;

  logger.info('[ONBOARDING-LOADER] Estado atual:', {
    authLoading,
    onboardingLoading,
    totalLoading,
    forceShowContent,
    shouldShowLoading,
    isAdmin,
    isRequired,
    hasUser: !!user,
    hasProfile: !!profile
  });

  // Mostrar loading apenas se necessário E não passou do timeout
  if (shouldShowLoading) {
    return <LoadingScreen message="Verificando seu progresso..." />;
  }

  // Mostrar conteúdo (onboarding)
  return <>{children}</>;
};
