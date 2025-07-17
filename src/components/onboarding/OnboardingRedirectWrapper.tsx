import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';

/**
 * Wrapper direto sem mascaramentos
 */
const OnboardingRedirectWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();

  console.log("[ONBOARDING-WRAPPER] Estado:", {
    hasUser: !!user,
    hasProfile: !!profile,
    onboardingCompleted: profile?.onboarding_completed,
    loading: isLoading
  });

  // Loading direto
  if (isLoading) {
    return <LoadingScreen message="Verificando estado..." />;
  }

  // Sem usuário = erro crítico (não deveria chegar aqui)
  if (!user) {
    console.error("[ONBOARDING-WRAPPER] ERRO: Sem usuário em onboarding");
    throw new Error("Usuário não autenticado tentando acessar onboarding");
  }

  // Sem perfil = erro crítico
  if (!profile) {
    console.error("[ONBOARDING-WRAPPER] ERRO: Sem perfil em onboarding");
    throw new Error(`Usuário ${user.id} sem perfil em onboarding`);
  }

  // ONBOARDING OPCIONAL - Sempre permitir acesso
  console.log("[ONBOARDING-WRAPPER] Onboarding é opcional - permitindo acesso livre");

  // Tudo ok - renderizar onboarding
  return <>{children}</>;
};

export default OnboardingRedirectWrapper;