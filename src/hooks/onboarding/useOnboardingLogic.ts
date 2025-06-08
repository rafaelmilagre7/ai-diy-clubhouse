
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

/**
 * Hook isolado para lógica do onboarding
 * FASE 1: Implementação básica e segura
 */
export const useOnboardingLogic = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Log para debug (apenas em desenvolvimento)
  useEffect(() => {
    if (!isLoading && user) {
      console.log('🚀 Onboarding acessado por:', {
        userId: user.id,
        email: user.email,
        role: profile?.role || 'não definido'
      });
    }
  }, [isLoading, user, profile]);

  return {
    isLoading,
    user,
    profile,
    // Placeholder para funções futuras
    canAccessOnboarding: true, // Por enquanto todos podem acessar
    isAdmin: profile?.role === 'admin',
    isMasterAdmin: user?.email === 'rafael@viverdeia.ai'
  };
};
