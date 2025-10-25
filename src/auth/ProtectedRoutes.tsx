
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  // Log para debug de navegação via notificações
  useEffect(() => {
    if (location.state?.from === 'notification') {
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
      console.warn('⏱️ [PROTECTED ROUTE] Timeout atingido - carregamento lento');
    }, 5000); // 5 segundos máximo (reduzido de 10s)

    return () => clearTimeout(timeout);
  }, []);

  // Ainda carregando (dentro do tempo limite)
  if (isLoading && !showTimeout) {
    return <LoadingScreen message="Carregando sua área..." />;
  }

  // Timeout atingido - permitir acesso mesmo sem perfil completo se houver usuário
  if (showTimeout && user) {
    console.log('✅ [PROTECTED ROUTE] Permitindo acesso após timeout (usuário presente)');
    return <>{children}</>;
  }

  // Sem usuário = login
  if (!user) {
    console.log('🔒 [PROTECTED ROUTE] Sem usuário - redirecionando para login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Usuário autenticado - renderizar conteúdo
  console.log('✅ [PROTECTED ROUTE] Usuário autenticado - renderizando conteúdo');
  return <>{children}</>;
};
