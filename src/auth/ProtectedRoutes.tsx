
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
// Removido SecurityProvider - já está no App.tsx
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();

  console.log("[PROTECTED] Estado atual:", {
    hasUser: !!user,
    hasProfile: !!profile,
    onboardingCompleted: profile?.onboarding_completed,
    currentPath: location.pathname
  });

  // Loading direto - sem timeouts
  if (isLoading) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // Sem usuário = login imediatamente
  if (!user) {
    console.log("[PROTECTED] Sem usuário - redirecionando para login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Rotas permitidas sem verificação
  const allowedWithoutOnboarding = ['/login', '/onboarding', '/auth'];
  const isOnboardingRoute = allowedWithoutOnboarding.some(route => 
    location.pathname.startsWith(route)
  );

  // Sem perfil = erro crítico (exceto em rotas de onboarding)
  if (!profile && !isOnboardingRoute) {
    console.error("[PROTECTED] ERRO CRÍTICO: Usuário sem perfil");
    throw new Error(`Usuário ${user.id} não possui perfil válido. Dados corrompidos.`);
  }

  // Onboarding não completo = redirecionar para step 1 diretamente
  if (profile && !profile.onboarding_completed && !isOnboardingRoute) {
    console.log("[PROTECTED] Onboarding não completo - redirecionando para step 1");
    return <Navigate to="/onboarding/step/1" replace />;
  }

  // Tudo ok - renderizar conteúdo
  return children;
};
