
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SecurityProvider } from "@/contexts/auth/SecurityContext";
import { InviteTokenManager } from "@/utils/inviteTokenManager";

interface ProtectedRoutesProps {
  children: ReactNode;
  allowInviteFlow?: boolean;
}

export const ProtectedRoutes = ({ children, allowInviteFlow = false }: ProtectedRoutesProps) => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useSimpleAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();

  // Detecção SIMPLES de fluxo de convite
  const isInInviteFlow = InviteTokenManager.hasToken() || location.pathname.includes('/invite');

  console.log("[PROTECTED-ROUTES] Estado:", {
    pathname: location.pathname,
    hasUser: !!user,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    allowInviteFlow,
    isInInviteFlow
  });
  
  // Loading simples
  if (authLoading || onboardingLoading) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // Sem usuário = login (NOVO PADRÃO: /login)
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Permitir fluxo de convite se configurado
  if (allowInviteFlow && isInInviteFlow) {
    console.log("[PROTECTED-ROUTES] Fluxo de convite permitido");
    return (
      <SecurityProvider>
        {children}
      </SecurityProvider>
    );
  }

  // Onboarding obrigatório (exceto se já estiver na rota)
  if (onboardingRequired && location.pathname !== '/onboarding') {
    console.log("[PROTECTED-ROUTES] Redirecionando para onboarding");
    
    // Preservar token se em fluxo de convite
    if (isInInviteFlow) {
      const currentToken = InviteTokenManager.getToken();
      
      if (currentToken) {
        InviteTokenManager.storeToken(currentToken);
        return <Navigate to={`/onboarding?token=${currentToken}`} replace />;
      }
    }
    
    return <Navigate to="/onboarding" replace />;
  }

  // Renderizar conteúdo protegido
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
};
