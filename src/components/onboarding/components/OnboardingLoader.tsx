
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import LoadingScreen from '@/components/common/LoadingScreen';

interface OnboardingLoaderProps {
  children: React.ReactNode;
}

export const OnboardingLoader = ({ children }: OnboardingLoaderProps) => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isRequired, isLoading: onboardingLoading, canProceed } = useOnboardingStatus();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  // Determinar tipo de membro baseado no perfil
  const memberType = profile?.role === 'formacao' ? 'formacao' : 'club';

  useEffect(() => {
    if (!authLoading && !onboardingLoading && canProceed && !hasChecked) {
      setHasChecked(true);
      
      // Se usuário não está autenticado
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      // Se onboarding não é necessário
      if (isRequired === false) {
        const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
        navigate(redirectPath, { replace: true });
        return;
      }
    }
  }, [authLoading, onboardingLoading, canProceed, hasChecked, user, isRequired, memberType, navigate]);

  // Mostrar loading enquanto verifica
  if (authLoading || onboardingLoading || !canProceed || !hasChecked) {
    return (
      <LoadingScreen message="Verificando seu progresso..." />
    );
  }

  // Se não está autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se onboarding não é necessário
  if (isRequired === false) {
    const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Se onboarding é necessário, renderizar children (OnboardingWizard)
  return <>{children}</>;
};
