
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

  // Log removido para evitar loops de renderização

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowTimeout(true);
    }, 10000); // 10 segundos máximo

    return () => clearTimeout(timeout);
  }, []);

  // Ainda carregando (dentro do tempo limite)
  if (isLoading && !showTimeout) {
    return <LoadingScreen message="Verificando suas credenciais..." />;
  }

  // Sem usuário = login
  if (!user) {
    console.log("[PROTECTED] Sem usuário - redirecionando para login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Timeout atingido mas sem perfil (fallback gracioso)
  if (showTimeout && !profile) {
    console.warn("[PROTECTED] Timeout atingido - permitindo acesso sem perfil completo");
  }

  // Usuário autenticado - renderizar conteúdo
  return <>{children}</>;
};
