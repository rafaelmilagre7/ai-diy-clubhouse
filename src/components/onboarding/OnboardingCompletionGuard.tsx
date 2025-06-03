
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import LoadingScreen from '@/components/common/LoadingScreen';

interface OnboardingCompletionGuardProps {
  children: React.ReactNode;
}

export const OnboardingCompletionGuard: React.FC<OnboardingCompletionGuardProps> = ({ children }) => {
  const { isOnboardingComplete, isLoading, error, invalidateOnboardingCache } = useUnifiedOnboardingValidation();
  const location = useLocation();

  // Invalidar cache ao montar o componente para garantir dados frescos
  useEffect(() => {
    console.log('🔄 OnboardingCompletionGuard: Invalidando cache na montagem');
    invalidateOnboardingCache();
  }, [invalidateOnboardingCache]);

  if (isLoading) {
    return <LoadingScreen message="Verificando status do onboarding..." />;
  }

  if (error) {
    console.error('Erro ao verificar onboarding:', error);
    // Em caso de erro, permitir acesso ao onboarding
    return <>{children}</>;
  }

  // NOVA LÓGICA: Verificar se o usuário está tentando acessar uma rota específica do onboarding
  const isOnOnboardingRoute = location.pathname.startsWith('/onboarding-new');
  
  // Se o onboarding já foi completado E o usuário está tentando acessar o onboarding
  if (isOnboardingComplete && isOnOnboardingRoute) {
    console.log('🔄 OnboardingCompletionGuard: Onboarding já completado, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Se não foi completado e está na rota do onboarding, permitir acesso
  if (!isOnboardingComplete && isOnOnboardingRoute) {
    console.log('✅ OnboardingCompletionGuard: Onboarding incompleto, permitindo acesso ao formulário');
    return <>{children}</>;
  }

  // Para qualquer outra situação, permitir acesso
  return <>{children}</>;
};
