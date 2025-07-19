
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();
  const [profileLoadingTimeout, setProfileLoadingTimeout] = useState(false);
  const [hasGracefulFallback, setHasGracefulFallback] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log("[PROTECTED] Estado atual:", {
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading,
    profileLoadingTimeout,
    hasGracefulFallback,
    currentPath: location.pathname
  });

  // Configurar timeout para carregamento de perfil
  useEffect(() => {
    if (user && !profile && !isLoading && !profileLoadingTimeout) {
      console.log("[PROTECTED] Iniciando timeout para carregamento de perfil...");
      
      timeoutRef.current = setTimeout(() => {
        console.warn("[PROTECTED] Timeout atingido - perfil não carregou em 8 segundos");
        setProfileLoadingTimeout(true);
      }, 8000); // 8 segundos de timeout
    }

    // Limpar timeout se perfil carregar ou componente desmontar
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [user, profile, isLoading, profileLoadingTimeout]);

  // Loading direto - sem timeouts desnecessários
  if (isLoading) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // Sem usuário = login imediatamente
  if (!user) {
    console.log("[PROTECTED] Sem usuário - redirecionando para login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Usuário existe mas perfil ainda está carregando (dentro do timeout)
  if (user && !profile && !profileLoadingTimeout && !hasGracefulFallback) {
    console.log("[PROTECTED] Aguardando carregamento do perfil...");
    return <LoadingScreen message="Carregando seu perfil..." />;
  }

  // Timeout atingido - implementar fallback gracioso
  if (user && !profile && profileLoadingTimeout && !hasGracefulFallback) {
    console.warn("[PROTECTED] Implementando fallback gracioso para usuário sem perfil");
    
    // Log detalhado do problema
    console.error("[PROTECTED] PROBLEMA DE PERFIL:", {
      userId: user.id,
      email: user.email,
      userMetadata: user.user_metadata,
      timestamp: new Date().toISOString(),
      location: location.pathname
    });

    // Marcar que implementamos fallback para evitar loops
    setHasGracefulFallback(true);
    
    // Continuar com acesso básico - não bloquear usuário
    console.log("[PROTECTED] Permitindo acesso com perfil temporário");
  }

  // Tudo ok - renderizar conteúdo
  // Nota: Agora permite acesso mesmo se profile for null (fallback gracioso)
  return <>{children}</>;
};
