
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { getOnboardingAction, logOnboardingDecision } from '@/hooks/onboarding/utils/onboardingUtils';

interface OnboardingBypassProps {
  children: React.ReactNode;
}

/**
 * Componente de controle de bypass do onboarding
 * FASE 2: Proteção total para usuários existentes
 */
export const OnboardingBypass: React.FC<OnboardingBypassProps> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!user || !profile) {
      console.log('❌ Usuário não autenticado, redirecionando...');
      navigate('/');
      return;
    }

    const action = getOnboardingAction(user.email, profile);
    logOnboardingDecision(user.email, profile, action);

    // Se deve fazer bypass, redirecionar para dashboard
    if (action === 'bypass') {
      console.log('⚡ Executando bypass, redirecionando para dashboard...');
      navigate('/dashboard');
      return;
    }

    // Se chegou até aqui, pode mostrar o onboarding
    console.log('✅ Usuário autorizado a ver onboarding');
  }, [user, profile, isLoading, navigate]);

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso ao onboarding...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário, não mostrar nada (vai redirecionar)
  if (!user || !profile) {
    return null;
  }

  // Se chegou até aqui, pode mostrar o conteúdo
  return <>{children}</>;
};
