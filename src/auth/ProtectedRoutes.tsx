
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SecurityProvider } from "@/contexts/auth/SecurityContext";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  
  // CORREÇÃO: Verificação segura do contexto
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error("[PROTECTED] Auth context não disponível:", error);
    // Se o contexto não está disponível, redirecionar para login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const { user, profile, isLoading } = authContext;

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // Se não há usuário autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // VERIFICAÇÃO OBRIGATÓRIA DE ONBOARDING
  // Rotas permitidas sem onboarding completo
  const allowedWithoutOnboarding = ['/login', '/onboarding', '/auth'];
  const isOnboardingRoute = allowedWithoutOnboarding.some(route => 
    location.pathname.startsWith(route)
  );

  // Se usuário não completou onboarding E não está em rota permitida
  if (profile && !profile.onboarding_completed && !isOnboardingRoute) {
    console.log("[PROTECTED] Redirecionando para onboarding obrigatório");
    return <Navigate to="/onboarding/step/1" replace />;
  }

  // Se ainda não tem perfil carregado, aguardar (exceto rotas de onboarding)
  if (!profile && !isOnboardingRoute) {
    return <LoadingScreen message="Carregando perfil do usuário..." />;
  }

  // Usuário autenticado e com onboarding completo - renderizar conteúdo protegido
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
};
