
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboardingCompletionCheck } from '@/hooks/onboarding/useOnboardingCompletionCheck';
import LoadingScreen from '@/components/common/LoadingScreen';
import { toast } from 'sonner';

interface OnboardingCompletionGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const OnboardingCompletionGuard: React.FC<OnboardingCompletionGuardProps> = ({
  children,
  redirectTo = '/dashboard'
}) => {
  const { data: completionData, isLoading, error } = useOnboardingCompletionCheck();

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return <LoadingScreen message="Verificando status do onboarding..." />;
  }

  // Se houver erro, permitir acesso mas registrar o problema
  if (error) {
    console.error('Erro na verificação do onboarding guard:', error);
    return <>{children}</>;
  }

  // Se o onboarding já foi completado, redirecionar
  if (completionData?.isCompleted) {
    console.log('🔒 OnboardingCompletionGuard: Usuário já completou onboarding, redirecionando para', redirectTo);
    
    // Mostrar toast informativo
    toast.info('Você já completou o onboarding!', {
      description: 'Redirecionando para seu dashboard...'
    });

    return <Navigate to={redirectTo} replace />;
  }

  // Se não completou, permitir acesso às rotas de onboarding
  console.log('✅ OnboardingCompletionGuard: Permitindo acesso ao onboarding');
  return <>{children}</>;
};
