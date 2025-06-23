
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SecurityProvider } from "@/contexts/auth/SecurityContext";
import { InviteTokenManager } from "@/utils/inviteTokenManager";

interface ProtectedRoutesProps {
  children: ReactNode;
  allowInviteFlow?: boolean; // CORREÇÃO 4: Nova prop para permitir fluxo de convite
}

export const ProtectedRoutes = ({ children, allowInviteFlow = false }: ProtectedRoutesProps) => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();

  // CORREÇÃO 4: Detectar se usuário está em fluxo de convite
  const isInInviteFlow = InviteTokenManager.hasStoredToken() || 
                        new URLSearchParams(location.search).has('token') ||
                        location.pathname.includes('/invite');

  console.log("[PROTECTED-ROUTES] Estado:", {
    pathname: location.pathname,
    hasUser: !!user,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    allowInviteFlow,
    isInInviteFlow,
    hasStoredToken: InviteTokenManager.hasStoredToken()
  });
  
  if (authLoading || onboardingLoading) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // Se não há usuário autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // CORREÇÃO 4: Lógica especial para fluxo de convites
  if (allowInviteFlow && isInInviteFlow) {
    console.log("[PROTECTED-ROUTES] Permitindo acesso por fluxo de convite");
    return (
      <SecurityProvider>
        {children}
      </SecurityProvider>
    );
  }

  // PROTEÇÃO CRÍTICA: Se onboarding é obrigatório e não estamos na rota de onboarding
  if (onboardingRequired && location.pathname !== '/onboarding') {
    console.log("[PROTECTED-ROUTES] Onboarding obrigatório - redirecionando");
    
    // CORREÇÃO 4: Preservar token se estiver em fluxo de convite
    if (isInInviteFlow) {
      const currentToken = new URLSearchParams(location.search).get('token') || 
                          InviteTokenManager.getStoredToken();
      
      if (currentToken) {
        InviteTokenManager.storeToken(currentToken);
        return <Navigate to={`/onboarding?token=${currentToken}`} replace />;
      }
    }
    
    return <Navigate to="/onboarding" replace />;
  }

  // Usuário autenticado e onboarding ok - renderizar conteúdo protegido
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
};
