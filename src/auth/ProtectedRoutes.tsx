
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { UnifiedLoadingScreen } from "@/components/common/UnifiedLoadingScreen";
import { getLoadingMessages } from "@/lib/loadingMessages";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  // Log para debug de navegação via notificações (apenas em dev)
  useEffect(() => {
    if (import.meta.env.DEV && location.state?.from === 'notification') {
      console.log('🔔 [PROTECTED ROUTE] Navegação via notificação', {
        user: user?.id,
        profile: profile?.id,
        isLoading,
        pathname: location.pathname
      });
    }
  }, [location, user, profile, isLoading]);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  // Ainda carregando (dentro do tempo limite)
  if (isLoading && !showTimeout) {
    return (
      <UnifiedLoadingScreen 
        title="Carregando sua área..."
        messages={getLoadingMessages('auth')}
        estimatedSeconds={5}
      />
    );
  }

  // Timeout atingido - permitir acesso mesmo sem perfil completo se houver usuário
  if (showTimeout && user) {
    return <>{children}</>;
  }

  // Sem usuário = login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Usuário autenticado - renderizar conteúdo
  return <>{children}</>;
};
