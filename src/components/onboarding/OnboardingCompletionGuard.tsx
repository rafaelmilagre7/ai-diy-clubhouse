
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import LoadingScreen from '@/components/common/LoadingScreen';

interface OnboardingCompletionGuardProps {
  children: React.ReactNode;
}

export const OnboardingCompletionGuard: React.FC<OnboardingCompletionGuardProps> = ({ children }) => {
  const { isOnboardingComplete, isLoading, checkOnboardingStatus } = useUnifiedOnboardingValidation();

  // Invalidar cache ao montar o componente para garantir dados frescos
  useEffect(() => {
    console.log('🔄 OnboardingCompletionGuard: Verificando status na montagem');
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  if (isLoading) {
    return <LoadingScreen message="Verificando status do onboarding..." />;
  }

  // Se o onboarding já foi completado, redirecionar para o review (não para dashboard)
  if (isOnboardingComplete) {
    console.log('🔄 OnboardingCompletionGuard: Onboarding já completado, redirecionando para review');
    return <Navigate to="/profile/onboarding-review" replace />;
  }

  // Se não foi completado, permitir acesso ao fluxo de onboarding
  console.log('✅ OnboardingCompletionGuard: Onboarding incompleto, permitindo acesso ao formulário');
  return <>{children}</>;
};
