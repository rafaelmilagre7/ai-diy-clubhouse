
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  
  // Usar useAuth de forma defensiva para evitar erro durante inicialização
  let user, profile, isLoading;
  try {
    const authContext = useAuth();
    user = authContext?.user;
    profile = authContext?.profile;
    isLoading = authContext?.isLoading;
  } catch (error) {
    // AuthProvider ainda não está disponível - mostrar loading
    console.log('🛡️ [PROTECTED] AuthProvider não disponível ainda, mostrando loading');
    return <LoadingScreen message="Inicializando autenticação..." />;
  }
  
  const [showTimeout, setShowTimeout] = useState(false);

  // Log removido para evitar loops de renderização

  // Timeout de segurança sincronizado com AuthContext
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowTimeout(true);
    }, 5000); // 5 segundos máximo - sincronizado

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
