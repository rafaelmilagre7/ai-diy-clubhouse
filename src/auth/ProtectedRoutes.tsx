
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SecurityProvider } from "@/contexts/auth/SecurityContext";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();

  console.log("[PROTECTED-ROUTES] Estado:", {
    pathname: location.pathname,
    hasUser: !!user,
    authLoading,
    onboardingLoading,
    onboardingRequired
  });
  
  // CORREÇÃO: Verificação segura do contexto
  if (authLoading || onboardingLoading) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // Se não há usuário autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // PROTEÇÃO CRÍTICA: Se onboarding é obrigatório e não estamos na rota de onboarding
  if (onboardingRequired && location.pathname !== '/onboarding') {
    console.log("[PROTECTED-ROUTES] Onboarding obrigatório - redirecionando");
    return <Navigate to="/onboarding" replace />;
  }

  // Usuário autenticado e onboarding ok - renderizar conteúdo protegido
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
};
