
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStatus } from '@/hooks/onboarding/useOnboardingStatus';

interface OnboardingBypassProps {
  children: React.ReactNode;
}

/**
 * Componente de controle de bypass do onboarding
 * FASE 4: Sistema refinado com múltiplas ações
 */
export const OnboardingBypass: React.FC<OnboardingBypassProps> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();
  const { onboardingAction, isChecking } = useOnboardingStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || isChecking) return;

    if (!user || !profile) {
      console.log('❌ Usuário não autenticado, redirecionando...');
      navigate('/');
      return;
    }

    // Verificar ação do onboarding
    if (onboardingAction === 'bypass') {
      console.log('⚡ Executando bypass, redirecionando para dashboard...');
      navigate('/dashboard');
      return;
    }

    // Se chegou até aqui, pode mostrar o onboarding
    console.log(`✅ Usuário autorizado a ver onboarding (${onboardingAction})`);
  }, [user, profile, isLoading, isChecking, onboardingAction, navigate]);

  // Mostrar loading enquanto verifica
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando configuração do onboarding...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário, não mostrar nada (vai redirecionar)
  if (!user || !profile) {
    return null;
  }

  // Se deve fazer bypass, não mostrar nada (vai redirecionar)
  if (onboardingAction === 'bypass') {
    return null;
  }

  // Se chegou até aqui, pode mostrar o conteúdo
  return <>{children}</>;
};
