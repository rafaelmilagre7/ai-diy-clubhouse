
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import { useOptimizedAuth } from '@/hooks/auth/useOptimizedAuth';
import LoadingScreen from '@/components/common/LoadingScreen';

interface OnboardingCompletionGuardProps {
  children: React.ReactNode;
}

export const OnboardingCompletionGuard: React.FC<OnboardingCompletionGuardProps> = ({ children }) => {
  const { isOnboardingComplete, isLoading, error, invalidateOnboardingCache } = useUnifiedOnboardingValidation();
  const { isAdmin } = useOptimizedAuth();
  const location = useLocation();

  // Invalidar cache ao montar o componente para garantir dados frescos
  useEffect(() => {
    console.log('🔄 OnboardingCompletionGuard: Invalidando cache na montagem');
    invalidateOnboardingCache();
  }, [invalidateOnboardingCache]);

  useEffect(() => {
    console.log('🛡️ OnboardingCompletionGuard: Status atual', {
      isOnboardingComplete,
      isLoading,
      error,
      isAdmin,
      currentPath: location.pathname
    });
  }, [isOnboardingComplete, isLoading, error, isAdmin, location.pathname]);

  if (isLoading) {
    return <LoadingScreen message="Verificando status do onboarding..." />;
  }

  if (error) {
    console.error('❌ OnboardingCompletionGuard: Erro ao verificar onboarding:', error);
    // Em caso de erro, permitir acesso
    return <>{children}</>;
  }

  // LÓGICA SIMPLIFICADA: Para admins, sempre permitir acesso
  if (isAdmin) {
    console.log('✅ OnboardingCompletionGuard: Admin detectado, permitindo acesso');
    return <>{children}</>;
  }

  // REMOVIDO O REDIRECIONAMENTO AUTOMÁTICO - esta era parte do problema
  // Agora apenas verifica se onboarding está completo e a rota atual
  const isOnOnboardingRoute = location.pathname.startsWith('/onboarding-new');
  
  if (isOnboardingComplete && isOnOnboardingRoute) {
    console.log('✅ OnboardingCompletionGuard: Onboarding completo, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Para todas as outras situações, permitir acesso
  console.log('✅ OnboardingCompletionGuard: Permitindo acesso à rota atual');
  return <>{children}</>;
};
