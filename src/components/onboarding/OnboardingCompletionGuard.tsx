
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboardingCompletionCheck } from '@/hooks/onboarding/useOnboardingCompletionCheck';
import LoadingScreen from '@/components/common/LoadingScreen';

interface OnboardingCompletionGuardProps {
  children: React.ReactNode;
}

export const OnboardingCompletionGuard: React.FC<OnboardingCompletionGuardProps> = ({ children }) => {
  const { data: completionStatus, isLoading, error } = useOnboardingCompletionCheck();

  if (isLoading) {
    return <LoadingScreen message="Verificando status do onboarding..." />;
  }

  if (error) {
    console.error('Erro ao verificar onboarding:', error);
    // Em caso de erro, permitir acesso ao onboarding
    return <>{children}</>;
  }

  // Se o onboarding já foi completado, redirecionar para o dashboard
  if (completionStatus?.isCompleted) {
    console.log('🔄 Onboarding já completado, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Se não foi completado, permitir acesso ao fluxo de onboarding
  return <>{children}</>;
};
