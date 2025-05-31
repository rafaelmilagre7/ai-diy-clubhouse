
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import LoadingScreen from '@/components/common/LoadingScreen';

interface OnboardingCompletionGuardProps {
  children: React.ReactNode;
}

export const OnboardingCompletionGuard: React.FC<OnboardingCompletionGuardProps> = ({ children }) => {
  const { isOnboardingComplete, isLoading, error } = useUnifiedOnboardingValidation();

  if (isLoading) {
    return <LoadingScreen message="Verificando status do onboarding..." />;
  }

  if (error) {
    console.error('Erro ao verificar onboarding:', error);
    // Em caso de erro, permitir acesso ao onboarding
    return <>{children}</>;
  }

  // Se o onboarding já foi completado, redirecionar para o review (não para dashboard)
  if (isOnboardingComplete) {
    console.log('🔄 Onboarding já completado, redirecionando para review');
    return <Navigate to="/profile/onboarding-review" replace />;
  }

  // Se não foi completado, permitir acesso ao fluxo de onboarding
  return <>{children}</>;
};
