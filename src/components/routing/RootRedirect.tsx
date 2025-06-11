
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState } from "react";

const RootRedirect = () => {
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Verificação segura do contexto
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error("[ROOT-REDIRECT] Auth context não disponível:", error);
    return <Navigate to="/login" replace />;
  }

  const { user, profile, isLoading } = authContext;
  
  console.log("[ROOT-REDIRECT] Estado atual:", {
    currentPath: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading,
    timeoutReached
  });
  
  // Timeout simples de 3 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Se usuário está em /login mas já está autenticado, redirecionar
  if (location.pathname === '/login' && user && profile) {
    console.log("🔄 [ROOT-REDIRECT] Usuário autenticado em /login, redirecionando...");
    
    const roleName = profile.user_roles?.name;
    
    if (roleName === 'formacao') {
      return <Navigate to="/formacao" replace />;
    }
    
    return <Navigate to="/dashboard" replace />;
  }
  
  // Loading com timeout
  if (isLoading && !timeoutReached) {
    return <LoadingScreen message="Verificando sua sessão..." />;
  }
  
  // Se não há usuário, vai para login
  if (!user) {
    console.log("[ROOT-REDIRECT] Sem usuário - redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas não há perfil e timeout foi atingido
  if (!profile && timeoutReached) {
    console.log("[ROOT-REDIRECT] Timeout + sem perfil - redirecionando para dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se há usuário mas não há perfil, aguardar um pouco mais
  if (!profile && !timeoutReached) {
    return <LoadingScreen message="Carregando seu perfil..." />;
  }
  
  // Verificação de roles
  const roleName = profile?.user_roles?.name;
  
  // Se é formação, ir direto para área de formação
  if (roleName === 'formacao') {
    console.log("🎯 [ROOT REDIRECT] Formação detectado - redirecionando para /formacao");
    return <Navigate to="/formacao" replace />;
  }
  
  // Caso padrão: dashboard de membro
  console.log("🏠 [ROOT REDIRECT] Redirecionando para dashboard de membro");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
