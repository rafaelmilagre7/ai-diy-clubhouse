
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

/**
 * Hook isolado para lógica do onboarding
 * FASE 2: Integração com bypass e mais dados
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
        role: profile?.role || 'não definido',
        createdAt: profile?.created_at
      });
    }
  }, [isLoading, user, profile]);

  return {
    isLoading,
    user,
    profile,
    // Informações de acesso
    canAccessOnboarding: true, // Por enquanto todos podem acessar
    isAdmin: profile?.role === 'admin',
    isMasterAdmin: user?.email === 'rafael@viverdeia.ai',
    isFormacao: profile?.role === 'formacao',
    
    // Informações do usuário
    userName: profile?.name || user?.user_metadata?.name || 'Usuário',
    userEmail: user?.email || null,
    userRole: profile?.role || 'member',
    
    // Status da conta
    isNewUser: profile ? (new Date().getTime() - new Date(profile.created_at).getTime() < 24 * 60 * 60 * 1000) : false,
    accountAge: profile ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (24 * 60 * 60 * 1000)) : 0
  };
};
