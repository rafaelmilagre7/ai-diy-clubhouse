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

  // Onboarding completo = redirecionar (mas permitir acesso a /onboarding se estiver nessa rota)
  if (profile.onboarding_completed) {
    console.log("[ONBOARDING-WRAPPER] Onboarding completo - verificando rota atual");
    const currentPath = window.location.pathname;
    
    // Se não está em rota de onboarding, permitir acesso normal
    if (!currentPath.startsWith('/onboarding')) {
      console.log("[ONBOARDING-WRAPPER] Rota não é onboarding, permitindo acesso");
      return <>{children}</>;
    }
    
    // Se está tentando acessar onboarding mas já completou, redirecionar
    console.log("[ONBOARDING-WRAPPER] Tentando acessar onboarding completo - redirecionando");
    const roleName = profile.user_roles?.name;
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }

  // Tudo ok - renderizar onboarding
  return <>{children}</>;
};

export default OnboardingRedirectWrapper;