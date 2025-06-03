
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
    // Em caso de erro, permitir acesso
    return <>{children}</>;
  }

  // LÓGICA SIMPLIFICADA: Apenas redirecionar se onboarding completo E tentando acessar onboarding
  const isOnOnboardingRoute = location.pathname.startsWith('/onboarding-new');
  
  if (isOnboardingComplete && isOnOnboardingRoute) {
    console.log('✅ OnboardingCompletionGuard: Onboarding completo, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Para todas as outras situações, permitir acesso
  return <>{children}</>;
};
